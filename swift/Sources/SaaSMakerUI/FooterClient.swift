import Foundation

// The footer's SaaS Maker client: updates sign-up and feedback, the native
// twin of the browser script in packages/templates/src/Base.astro. Without a
// publishable key (given, or resolved from the catalog id) it runs in preview
// mode and sends nothing.

// MARK: - Transport

/// The one network call the footer makes. URLSession conforms; tests inject a fake.
public protocol SMHTTPTransport: Sendable {
    func send(_ request: URLRequest) async throws -> (Data, URLResponse)
}

extension URLSession: SMHTTPTransport {
    public func send(_ request: URLRequest) async throws -> (Data, URLResponse) {
        try await data(for: request)
    }
}

// MARK: - Contract

/// Updates sign-up kind from the catalog capture policy; `.off` when capture is not applicable.
public enum SMCapture: String, Sendable, CaseIterable {
    case newsletter, waitlist, off

    /// Must match SaaS Maker's server consent snapshot (newsletter-capture CONSENT_COPY_V1).
    public var consentCopy: String? {
        switch self {
        case .newsletter: "I agree to receive newsletter emails about this product. I can unsubscribe at any time."
        case .waitlist: "I agree to receive early-access and availability emails about this product. I can unsubscribe at any time."
        case .off: nil
        }
    }
}

/// The values SaaS Maker's /v1/feedback accepts.
public enum SMFeedbackType: String, Sendable, CaseIterable, Identifiable {
    case bug, feature, feedback
    public var id: String { rawValue }
    public var label: String {
        switch self {
        case .bug: "Something broke"
        case .feature: "An idea"
        case .feedback: "General feedback"
        }
    }
}

/// What the person wrote in the feedback sheet.
public struct SMFeedbackDraft: Sendable, Equatable {
    public var type: SMFeedbackType
    public var title: String
    public var description: String
    public var email: String
    public var screenshot: Data?

    public init(type: SMFeedbackType = .feedback, title: String = "", description: String = "", email: String = "", screenshot: Data? = nil) {
        self.type = type
        self.title = title
        self.description = description
        self.email = email
        self.screenshot = screenshot
    }

    /// Same limits as the web form: a one-line summary and at least a few words of detail.
    public var isComplete: Bool {
        let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let d = description.trimmingCharacters(in: .whitespacesAndNewlines)
        let e = email.trimmingCharacters(in: .whitespacesAndNewlines)
        return !t.isEmpty && t.count <= 120 && d.count >= 4 && d.count <= 4000 && (e.isEmpty || SMFooterClient.isEmail(e))
    }
}

public enum SMFooterError: Error, Equatable {
    case consentRequired
    case invalidInput
    case http(Int)
    /// The catalog id is set, but its key lookup failed (network, server error, bad reply).
    case unreachable
}

/// The outcome of a send: delivered, or preview mode (no key, nothing sent).
public enum SMFooterResult: Sendable, Equatable {
    case sent
    case preview
}

/// Status lines, word for word from the web footer.
public enum SMFooterCopy {
    public static let sending = "Sending…"
    public static let preview = "Preview only: this demo has no project key, so nothing was sent."
    public static let failed = "That did not send. Please try again in a moment."
    public static let unreachable = "Couldn't reach SaaS Maker, so nothing was sent. Please try again in a moment."

    /// The status line for a failed send.
    public static func failure(_ error: Error) -> String {
        (error as? SMFooterError) == .unreachable ? unreachable : failed
    }
    public static let subscribed = "You're on the list."
    public static func feedbackSent(_ product: String) -> String { "Thanks, it reached the person who builds \(product)." }
    public static let feedbackConsent = "I agree to send this feedback and the page details to SaaS Maker."
    public static let feedbackNote = "Sends what you write, the app and screen name (never your data), and anything you attach."
}

// MARK: - Client

/// Sends footer sign-ups and feedback to SaaS Maker. Resolves the publishable
/// key from the catalog id when none is given and caches it once found; a
/// failed lookup is not cached, so the next send tries again.
public actor SMFooterClient {
    public static let api = URL(string: "https://api.sassmaker.com")!
    public static let privacyURL = URL(string: "https://sassmaker.com/privacy")!

    private let projectKey: String?
    private let catalogId: String?
    private let transport: any SMHTTPTransport
    /// Identifies the app in feedback page urls (`app://<id>/<screen>`).
    public let appIdentifier: String
    public let clientVersion: String
    /// The in-flight or successful key lookup. Cleared when a lookup fails or finds no key.
    private var resolved: Task<String?, Error>?

    public init(
        projectKey: String? = nil,
        catalogId: String? = nil,
        transport: any SMHTTPTransport = URLSession.shared,
        appIdentifier: String = Bundle.main.bundleIdentifier ?? "app",
        clientVersion: String = SMFooterClient.bundleVersion()
    ) {
        let key = projectKey?.trimmingCharacters(in: .whitespaces)
        self.projectKey = key?.isEmpty == false ? key : nil
        let id = catalogId?.trimmingCharacters(in: .whitespaces)
        self.catalogId = id?.isEmpty == false ? id : nil
        self.transport = transport
        self.appIdentifier = appIdentifier
        self.clientVersion = clientVersion
    }

    /// `1.4 (212)` from the main bundle, or `unknown`.
    public static func bundleVersion(_ bundle: Bundle = .main) -> String {
        let short = bundle.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String
        let build = bundle.object(forInfoDictionaryKey: "CFBundleVersion") as? String
        switch (short, build) {
        case let (s?, b?): return "\(s) (\(b))"
        case let (s?, nil): return s
        case let (nil, b?): return b
        default: return "unknown"
        }
    }

    /// The key to send with: the given key, or one resolved from the catalog id.
    /// `nil` means preview mode (no key, no catalog id, or the catalog id has no
    /// project). Throws `.unreachable` when the lookup itself fails.
    public func projectKeyForSend() async throws -> String? {
        if let projectKey { return projectKey }
        guard let catalogId else { return nil }
        let task: Task<String?, Error>
        if let resolved {
            task = resolved
        } else {
            task = Task { [transport] in try await Self.lookUpKey(catalogId: catalogId, transport: transport) }
            resolved = task
        }
        do {
            let key = try await task.value
            if key == nil { forget(task) }
            return key
        } catch {
            forget(task)
            throw SMFooterError.unreachable
        }
    }

    /// Drops a lookup that failed or found no key, unless a newer one replaced it.
    private func forget(_ task: Task<String?, Error>) {
        if resolved == task { resolved = nil }
    }

    /// `nil` for an unknown catalog id (404) or a reply without a key; throws otherwise.
    private static func lookUpKey(catalogId: String, transport: any SMHTTPTransport) async throws -> String? {
        guard let request = captureConfigRequest(catalogId: catalogId) else { return nil }
        let (data, response) = try await transport.send(request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if status == 404 { return nil }
        guard (200..<300).contains(status) else { throw SMFooterError.http(status) }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw SMFooterError.unreachable }
        guard let key = json["api_key"] as? String, !key.isEmpty else { return nil }
        return key
    }

    /// Updates sign-up. Throws `.consentRequired` without consent; `.preview` when there is no key.
    public func subscribe(email: String, kind: SMCapture, consent: Bool) async throws -> SMFooterResult {
        guard consent else { throw SMFooterError.consentRequired }
        let email = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard kind != .off, Self.isEmail(email) else { throw SMFooterError.invalidInput }
        guard let key = try await projectKeyForSend() else { return .preview }
        try await check(transport.send(Self.subscriptionRequest(key: key, email: email, kind: kind)))
        return .sent
    }

    /// Feedback with an optional screenshot. `screen` names where it was sent from; no user data.
    public func sendFeedback(_ draft: SMFeedbackDraft, screen: String, title: String, consent: Bool) async throws -> SMFooterResult {
        guard consent else { throw SMFooterError.consentRequired }
        guard draft.isComplete else { throw SMFooterError.invalidInput }
        guard let key = try await projectKeyForSend() else { return .preview }
        let page = Self.pageURL(app: appIdentifier, screen: screen)
        let request = try Self.feedbackRequest(key: key, draft: draft, pageURL: page, pageTitle: title, clientVersion: clientVersion)
        try await check(transport.send(request))
        return .sent
    }

    private func check(_ result: (Data, URLResponse)) throws {
        let status = (result.1 as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else { throw SMFooterError.http(status) }
    }

    // MARK: Request building (pure, tested)

    public static func isEmail(_ s: String) -> Bool {
        s.count <= 254 && s.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil
    }

    /// `GET /v1/capture-config/<id>`, whose `api_key` is the publishable key.
    public static func captureConfigRequest(catalogId: String) -> URLRequest? {
        guard let id = catalogId.addingPercentEncoding(withAllowedCharacters: .alphanumerics.union(CharacterSet(charactersIn: "-._~"))),
              let url = URL(string: "/v1/capture-config/\(id)", relativeTo: api)?.absoluteURL else { return nil }
        var request = URLRequest(url: url)
        request.httpShouldHandleCookies = false
        return request
    }

    public static func subscriptionRequest(key: String, email: String, kind: SMCapture) -> URLRequest {
        var request = URLRequest(url: api.appending(path: "v1/subscriptions"))
        request.httpMethod = "POST"
        request.httpShouldHandleCookies = false
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(key, forHTTPHeaderField: "X-Project-Key")
        let body: [String: Any] = ["email": email, "kind": kind.rawValue, "source": "app", "consent": true]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [.sortedKeys])
        return request
    }

    /// An app address for feedback: `app://<bundle-id>/<screen>`, with any query,
    /// fragment or characters outside a plain path dropped so no user data leaks.
    public static func pageURL(app: String, screen: String) -> String {
        let allowed = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: "-._/"))
        let host = String(app.unicodeScalars.filter { allowed.contains($0) && $0 != "/" }).lowercased()
        var path = screen
        if let cut = path.firstIndex(where: { $0 == "?" || $0 == "#" }) { path = String(path[..<cut]) }
        path = String(path.unicodeScalars.filter { allowed.contains($0) && $0.isASCII })
        let segments = path.split(separator: "/").filter { $0 != "." && $0 != ".." }
        return "app://\(host.isEmpty ? "app" : host)/" + segments.joined(separator: "/")
    }

    public static func feedbackRequest(key: String, draft: SMFeedbackDraft, pageURL: String, pageTitle: String, clientVersion: String, boundary: String = "sm-" + UUID().uuidString) throws -> URLRequest {
        var feedback: [String: Any] = [
            "type": draft.type.rawValue,
            "title": draft.title.trimmingCharacters(in: .whitespacesAndNewlines),
            "description": draft.description.trimmingCharacters(in: .whitespacesAndNewlines),
            "page": ["url": pageURL, "title": pageTitle],
            "source": "app",
            "client_version": clientVersion,
        ]
        let email = draft.email.trimmingCharacters(in: .whitespacesAndNewlines)
        if !email.isEmpty { feedback["submitter_email"] = email }
        let json = try JSONSerialization.data(withJSONObject: feedback, options: [.sortedKeys])

        var body = Data()
        func line(_ s: String) { body.append(Data((s + "\r\n").utf8)) }
        line("--\(boundary)")
        line("Content-Disposition: form-data; name=\"feedback\"")
        line("")
        body.append(json)
        line("")
        if let shot = draft.screenshot, !shot.isEmpty {
            let (ext, mime) = imageType(shot)
            line("--\(boundary)")
            line("Content-Disposition: form-data; name=\"screenshot\"; filename=\"screenshot.\(ext)\"")
            line("Content-Type: \(mime)")
            line("")
            body.append(shot)
            line("")
        }
        line("--\(boundary)--")

        var request = URLRequest(url: api.appending(path: "v1/feedback"))
        request.httpMethod = "POST"
        request.httpShouldHandleCookies = false
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.setValue(key, forHTTPHeaderField: "X-Project-Key")
        request.httpBody = body
        return request
    }

    /// File extension and media type from the image's magic bytes (png, jpeg, webp).
    static func imageType(_ data: Data) -> (String, String) {
        let b = [UInt8](data.prefix(12))
        if b.starts(with: [0xFF, 0xD8, 0xFF]) { return ("jpg", "image/jpeg") }
        if b.count >= 12, b[0...3] == [0x52, 0x49, 0x46, 0x46], b[8...11] == [0x57, 0x45, 0x42, 0x50] { return ("webp", "image/webp") }
        return ("png", "image/png")
    }
}

// MARK: - Ask AI

/// The assistants the footer hands a question to, with the same URLs as the web.
public enum SMAssistant: String, Sendable, CaseIterable, Identifiable {
    case claude = "Claude", chatgpt = "ChatGPT", perplexity = "Perplexity", grok = "Grok"
    public var id: String { rawValue }

    public var action: URL {
        switch self {
        case .claude: URL(string: "https://claude.ai/new")!
        case .chatgpt: URL(string: "https://chatgpt.com/")!
        case .perplexity: URL(string: "https://www.perplexity.ai/search")!
        case .grok: URL(string: "https://grok.com/")!
        }
    }

    /// The assistant URL with the question prefilled (`?q=`), as the web form's GET submit builds it.
    public func url(asking question: String) -> URL {
        var c = URLComponents(url: action, resolvingAgainstBaseURL: false)!
        c.queryItems = [URLQueryItem(name: "q", value: question)]
        // Form encoding: spaces as +, and a literal + escaped.
        c.percentEncodedQuery = c.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B").replacingOccurrences(of: "%20", with: "+")
        return c.url!
    }

    public static func question(product: String, url: String) -> String {
        "What does \(product) (\(url)) do, and who is it best for? Keep it concise."
    }
}

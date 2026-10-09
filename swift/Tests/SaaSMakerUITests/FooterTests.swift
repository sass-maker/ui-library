import Foundation
import SwiftUI
import Testing
@testable import SaaSMakerUI

/// Records requests and answers with canned responses; never touches the network.
final class FakeTransport: SMHTTPTransport, @unchecked Sendable {
    private let lock = NSLock()
    private var _requests: [URLRequest] = []
    private let respond: @Sendable (URLRequest) -> (Int, Data)

    init(_ respond: @escaping @Sendable (URLRequest) -> (Int, Data) = { _ in (201, Data("{}".utf8)) }) {
        self.respond = respond
    }

    var requests: [URLRequest] { lock.withLock { _requests } }

    func send(_ request: URLRequest) async throws -> (Data, URLResponse) {
        lock.withLock { _requests.append(request) }
        let (status, data) = respond(request)
        return (data, HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: nil)!)
    }
}

private func json(_ data: Data?) throws -> [String: Any] {
    let data = try #require(data)
    return try #require(try JSONSerialization.jsonObject(with: data) as? [String: Any])
}

@Suite struct FooterRequestTests {
    @Test func consentCopyMatchesTheServerSnapshot() {
        #expect(SMCapture.newsletter.consentCopy == "I agree to receive newsletter emails about this product. I can unsubscribe at any time.")
        #expect(SMCapture.waitlist.consentCopy == "I agree to receive early-access and availability emails about this product. I can unsubscribe at any time.")
        #expect(SMCapture.off.consentCopy == nil)
        #expect(SMFooterClient.privacyURL.absoluteString == "https://sassmaker.com/privacy")
    }

    @Test func subscriptionRequest() throws {
        let r = SMFooterClient.subscriptionRequest(key: "pk_test", email: "a@b.co", kind: .waitlist)
        #expect(r.url?.absoluteString == "https://api.sassmaker.com/v1/subscriptions")
        #expect(r.httpMethod == "POST")
        #expect(r.value(forHTTPHeaderField: "X-Project-Key") == "pk_test")
        #expect(r.value(forHTTPHeaderField: "Content-Type") == "application/json")
        #expect(!r.httpShouldHandleCookies)
        let body = try json(r.httpBody)
        #expect(body["email"] as? String == "a@b.co")
        #expect(body["kind"] as? String == "waitlist")
        #expect(body["source"] as? String == "app")
        #expect(body["consent"] as? Bool == true)
        #expect(body.count == 4)
    }

    @Test func feedbackRequestIsMultipart() throws {
        let png = Data([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3])
        let draft = SMFeedbackDraft(type: .bug, title: " Crash on save ", description: "It quits when I save.", email: "me@x.io", screenshot: png)
        let r = try SMFooterClient.feedbackRequest(key: "pk", draft: draft, pageURL: "app://com.example.kith/settings", pageTitle: "Kith", clientVersion: "1.2 (34)", boundary: "B")
        #expect(r.url?.absoluteString == "https://api.sassmaker.com/v1/feedback")
        #expect(r.httpMethod == "POST")
        #expect(r.value(forHTTPHeaderField: "X-Project-Key") == "pk")
        #expect(r.value(forHTTPHeaderField: "Content-Type") == "multipart/form-data; boundary=B")
        let body = try #require(r.httpBody)
        let text = String(decoding: body, as: UTF8.self)
        #expect(text.hasPrefix("--B\r\nContent-Disposition: form-data; name=\"feedback\"\r\n\r\n"))
        #expect(text.contains("Content-Disposition: form-data; name=\"screenshot\"; filename=\"screenshot.png\"\r\nContent-Type: image/png\r\n\r\n"))
        #expect(text.hasSuffix("--B--\r\n"))
        #expect(body.range(of: png) != nil)

        // The feedback field's JSON.
        let start = try #require(text.range(of: "\r\n\r\n")).upperBound
        let end = try #require(text.range(of: "\r\n--B", range: start..<text.endIndex)).lowerBound
        let feedback = try json(Data(text[start..<end].utf8))
        #expect(feedback["type"] as? String == "bug")
        #expect(feedback["title"] as? String == "Crash on save")
        #expect(feedback["description"] as? String == "It quits when I save.")
        #expect(feedback["submitter_email"] as? String == "me@x.io")
        #expect(feedback["source"] as? String == "app")
        #expect(feedback["client_version"] as? String == "1.2 (34)")
        let page = try #require(feedback["page"] as? [String: String])
        #expect(page == ["url": "app://com.example.kith/settings", "title": "Kith"])
    }

    @Test func feedbackWithoutEmailOrScreenshot() throws {
        let draft = SMFeedbackDraft(title: "Idea", description: "Dark mode please")
        let r = try SMFooterClient.feedbackRequest(key: "pk", draft: draft, pageURL: "app://x/", pageTitle: "X", clientVersion: "1", boundary: "B")
        let text = String(decoding: try #require(r.httpBody), as: UTF8.self)
        #expect(!text.contains("submitter_email"))
        #expect(!text.contains("name=\"screenshot\""))
        #expect(text.contains("\"type\":\"feedback\""))
    }

    @Test func screenshotTypeFromMagicBytes() {
        #expect(SMFooterClient.imageType(Data([0xFF, 0xD8, 0xFF, 0xE0])) == ("jpg", "image/jpeg"))
        #expect(SMFooterClient.imageType(Data("RIFF\u{0}\u{0}\u{0}\u{0}WEBP".utf8)) == ("webp", "image/webp"))
        #expect(SMFooterClient.imageType(Data([0x89, 0x50])) == ("png", "image/png"))
    }

    @Test func pageURLDropsUserData() {
        #expect(SMFooterClient.pageURL(app: "com.example.Kith", screen: "settings") == "app://com.example.kith/settings")
        #expect(SMFooterClient.pageURL(app: "com.example.kith", screen: "people/detail?id=42&token=abc#notes") == "app://com.example.kith/people/detail")
        #expect(SMFooterClient.pageURL(app: "com.example.kith", screen: "#frag") == "app://com.example.kith/")
        #expect(SMFooterClient.pageURL(app: "com.example.kith", screen: "../../me@mail.com/ about") == "app://com.example.kith/memail.com/about")
        #expect(SMFooterClient.pageURL(app: "", screen: "home") == "app://app/home")
        #expect(SMFooterClient.pageURL(app: "evil.com/x?y", screen: "a") == "app://evil.comxy/a")
    }

    @Test func draftValidation() {
        #expect(!SMFeedbackDraft().isComplete)
        #expect(!SMFeedbackDraft(title: "Hi", description: "abc").isComplete, "details need four characters")
        #expect(SMFeedbackDraft(title: "Hi", description: "abcd").isComplete)
        #expect(!SMFeedbackDraft(title: "Hi", description: "abcd", email: "nope").isComplete)
        #expect(!SMFeedbackDraft(title: String(repeating: "a", count: 121), description: "abcd").isComplete)
    }

    @Test func assistantURLsMatchTheWeb() {
        let q = SMAssistant.question(product: "Kith", url: "https://kith.significanthobbies.com")
        #expect(q == "What does Kith (https://kith.significanthobbies.com) do, and who is it best for? Keep it concise.")
        #expect(SMAssistant.claude.url(asking: "a b+c&d=e?").absoluteString == "https://claude.ai/new?q=a+b%2Bc%26d%3De?")
        #expect(SMAssistant.chatgpt.url(asking: "hi").absoluteString == "https://chatgpt.com/?q=hi")
        #expect(SMAssistant.perplexity.url(asking: "hi").absoluteString == "https://www.perplexity.ai/search?q=hi")
        #expect(SMAssistant.grok.url(asking: "hi").absoluteString == "https://grok.com/?q=hi")
        let back = URLComponents(url: SMAssistant.claude.url(asking: q), resolvingAgainstBaseURL: false)?.percentEncodedQuery
        #expect(back?.removingPercentEncoding?.replacingOccurrences(of: "+", with: " ") == "q=" + q)
    }

    @Test func assistantMarksParse() {
        for a in SMAssistant.allCases {
            let box = SVGPath.parse(a.markPath).boundingRect
            #expect(box.width > 18 && box.height > 18, "\(a.rawValue) mark spans the icon box")
            #expect(box.minX >= -0.5 && box.minY >= -0.5 && box.maxX <= 24.5 && box.maxY <= 24.5, "\(a.rawValue) stays in its 24pt box")
        }
    }

    @Test func studioStripLeavesOutTheCurrentProduct() {
        let others = SMStudioLink.siblings(of: "kith", in: SMStudioLink.studio)
        #expect(others.map(\.label) == ["CodeVetter", "HeyPace", "PostTrainLLM", "Live"])
    }

    @Test func studioLinksCarryTheReferringProduct() {
        let live = SMStudioLink("Live", url: URL(string: "https://live.significanthobbies.com/?ref=old")!)
        #expect(live.referred(by: "kith").absoluteString == "https://live.significanthobbies.com/?ref=kith")
        #expect(live.referred(by: nil) == live.url)
        #expect(SMStudioLink.allProjects.absoluteString == "https://sassmaker.com/projects")
    }
}

@Suite struct FooterClientTests {
    @Test func consentIsRequired() async {
        let fake = FakeTransport()
        let client = SMFooterClient(projectKey: "pk", transport: fake)
        await #expect(throws: SMFooterError.consentRequired) {
            try await client.subscribe(email: "a@b.co", kind: .newsletter, consent: false)
        }
        await #expect(throws: SMFooterError.consentRequired) {
            try await client.sendFeedback(SMFeedbackDraft(title: "Hi", description: "abcd"), screen: "about", title: "X", consent: false)
        }
        #expect(fake.requests.isEmpty)
    }

    @Test func previewModeSendsNothing() async throws {
        let fake = FakeTransport()
        let client = SMFooterClient(projectKey: "  ", transport: fake)
        #expect(try await client.subscribe(email: "a@b.co", kind: .newsletter, consent: true) == .preview)
        #expect(try await client.sendFeedback(SMFeedbackDraft(title: "Hi", description: "abcd"), screen: "about", title: "X", consent: true) == .preview)
        #expect(fake.requests.isEmpty)
        #expect(SMFooterCopy.preview == "Preview only: this demo has no project key, so nothing was sent.")
    }

    @Test func previewWhenTheCatalogHasNoKey() async throws {
        let fake = FakeTransport { _ in (404, Data()) }
        let client = SMFooterClient(catalogId: "kith", transport: fake)
        #expect(try await client.subscribe(email: "a@b.co", kind: .newsletter, consent: true) == .preview)
        #expect(fake.requests.count == 1, "only the capture-config lookup")
    }

    @Test func resolvesTheKeyOnceFromTheCatalog() async throws {
        let fake = FakeTransport { r in
            r.url?.path == "/v1/capture-config/kith" ? (200, Data(#"{"api_key":"pk_resolved"}"#.utf8)) : (201, Data())
        }
        let client = SMFooterClient(catalogId: "kith", transport: fake, appIdentifier: "com.example.kith", clientVersion: "2.0")
        #expect(try await client.subscribe(email: "a@b.co", kind: .newsletter, consent: true) == .sent)
        #expect(try await client.sendFeedback(SMFeedbackDraft(title: "Hi", description: "abcd"), screen: "settings?x=1", title: "Kith", consent: true) == .sent)
        let requests = fake.requests
        #expect(requests.map { $0.url!.path } == ["/v1/capture-config/kith", "/v1/subscriptions", "/v1/feedback"])
        #expect(requests[0].httpMethod == "GET")
        #expect(requests[1].value(forHTTPHeaderField: "X-Project-Key") == "pk_resolved")
        #expect(requests[2].value(forHTTPHeaderField: "X-Project-Key") == "pk_resolved")
        let text = String(decoding: try #require(requests[2].httpBody), as: UTF8.self)
        #expect(text.contains(#""url":"app:\/\/com.example.kith\/settings""#) || text.contains(#""url":"app://com.example.kith/settings""#))
    }

    @Test func serverErrorsThrow() async {
        let client = SMFooterClient(projectKey: "pk", transport: FakeTransport { _ in (500, Data()) })
        await #expect(throws: SMFooterError.http(500)) {
            try await client.subscribe(email: "a@b.co", kind: .newsletter, consent: true)
        }
    }

    @Test func rejectsBadInputBeforeSending() async {
        let fake = FakeTransport()
        let client = SMFooterClient(projectKey: "pk", transport: fake)
        await #expect(throws: SMFooterError.invalidInput) {
            try await client.subscribe(email: "not-an-email", kind: .newsletter, consent: true)
        }
        await #expect(throws: SMFooterError.invalidInput) {
            try await client.subscribe(email: "a@b.co", kind: .off, consent: true)
        }
        #expect(fake.requests.isEmpty)
    }
}

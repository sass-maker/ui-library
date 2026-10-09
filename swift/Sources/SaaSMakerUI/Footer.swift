import SwiftUI
#if os(iOS)
import PhotosUI
import UIKit
#else
import UniformTypeIdentifiers
#endif

// Footer family: the native twin of the web StudioFooter
// (packages/ui/src/blocks/footer.tsx). Updates sign-up, feedback, Ask AI, the
// studio strip and a legal line, sending to SaaS Maker through SMFooterClient.
// Without a key it runs in preview mode and sends nothing.

/// A sibling product in the studio strip.
public struct SMStudioLink: Sendable, Hashable {
    public var label: String
    public var url: URL
    public init(_ label: String, url: URL) {
        self.label = label
        self.url = url
    }

    /// The web footer's default studio list.
    public static let studio: [SMStudioLink] = [
        SMStudioLink("CodeVetter", url: URL(string: "https://codevetter.com")!),
        SMStudioLink("HeyPace", url: URL(string: "https://heypace.app")!),
        SMStudioLink("PostTrainLLM", url: URL(string: "https://posttrainllm.com")!),
        SMStudioLink("Live", url: URL(string: "https://live.significanthobbies.com")!),
        SMStudioLink("Kith", url: URL(string: "https://kith.significanthobbies.com")!),
    ]
    public static let allProjects = URL(string: "https://sassmaker.com")!

    /// The strip for a product: every sibling except itself.
    public static func siblings(of product: String, in studio: [SMStudioLink]) -> [SMStudioLink] {
        studio.filter { $0.label.caseInsensitiveCompare(product) != .orderedSame }
    }
}

/// The studio footer for an app's About or Settings screen: updates sign-up,
/// a feedback sheet, Ask AI, the studio strip and a legal line.
public struct SMStudioFooter: View {
    @Environment(\.smPalette) private var p
    @State private var client: SMFooterClient
    @State private var showFeedback = false
    private let product: String
    private let url: String
    private let summary: String?
    private let capture: SMCapture
    private let studio: [SMStudioLink]
    private let legal: String?
    private let screen: String

    /// - Parameters:
    ///   - product: Product name, as in the catalog.
    ///   - url: The product's public address, used in the Ask AI question.
    ///   - projectKey: SaaS Maker publishable project key.
    ///   - catalogId: Fleet catalog id; resolves the key once when none is given.
    ///   - capture: Sign-up kind from the catalog capture policy, or `.off`.
    ///   - studio: Sibling products; the current product is left out.
    ///   - screen: Where the footer lives (for feedback's `app://<bundle>/<screen>`).
    ///   - transport: Network transport; inject a fake in tests and previews.
    public init(
        product: String,
        url: String,
        summary: String? = nil,
        projectKey: String? = nil,
        catalogId: String? = nil,
        capture: SMCapture = .newsletter,
        studio: [SMStudioLink] = SMStudioLink.studio,
        legal: String? = nil,
        screen: String = "about",
        transport: any SMHTTPTransport = URLSession.shared
    ) {
        self.product = product
        self.url = url
        self.summary = summary
        self.capture = capture
        self.studio = studio
        self.legal = legal
        self.screen = screen
        _client = State(initialValue: SMFooterClient(projectKey: projectKey, catalogId: catalogId, transport: transport))
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 36) {
            if capture != .off {
                SMSubscribeCard(product: product, kind: capture, client: client)
            }
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(product)
                        .font(.custom(p.displayFont, size: 18).weight(.bold))
                        .tracking(-0.5)
                    if let summary {
                        Text(summary)
                            .font(SMType.text(16).font(p))
                            .foregroundStyle(p.mutedForeground)
                            .lineSpacing(3)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                Button { showFeedback = true } label: {
                    Label("Send feedback", systemImage: "bubble.left")
                }
                .buttonStyle(.smOutline)
            }
            SMAskAI(product: product, url: url)
            VStack(alignment: .leading, spacing: 14) {
                Rectangle().fill(p.hairline).frame(height: 1)
                SMStudioStrip(product: product, studio: studio)
                if let legal {
                    Text(legal)
                        .font(.custom(p.displayFont, size: 13))
                        .foregroundStyle(p.mutedForeground)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .sheet(isPresented: $showFeedback) {
            SMFeedbackForm(product: product, screen: screen, client: client) { showFeedback = false }
                .smTheme(p)
            #if os(macOS)
                .frame(width: 500)
            #endif
        }
    }
}

// MARK: - Shared pieces

/// Where a send stands; the text is the web footer's status copy.
enum SMSendState: Equatable {
    case idle, sending, done(String)

    var message: String? {
        switch self {
        case .idle: nil
        case .sending: SMFooterCopy.sending
        case .done(let text): text
        }
    }
}

/// A rounded input surface matching the web field.
private struct SMField: ViewModifier {
    @Environment(\.smPalette) private var p
    var capsule = false
    func body(content: Content) -> some View {
        content
            .textFieldStyle(.plain)
            .font(.custom(p.sansFont, size: 15))
            .padding(.horizontal, capsule ? 18 : 12)
            .padding(.vertical, 11)
            .background(p.background, in: .rect(cornerRadius: capsule ? 999 : p.radius * 0.6))
            .overlay(RoundedRectangle(cornerRadius: capsule ? 999 : p.radius * 0.6).strokeBorder(p.input))
    }
}

/// The consent checkbox with its exact copy and a Privacy link. Consent is
/// never preselected.
struct SMConsentCheck: View {
    @Environment(\.smPalette) private var p
    @Binding var isOn: Bool
    let copy: String

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            Button { isOn.toggle() } label: {
                Image(systemName: isOn ? "checkmark.square.fill" : "square")
                    .font(.system(size: 16))
                    .foregroundStyle(isOn ? p.brand : p.mutedForeground)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(copy)
            .accessibilityValue(isOn ? "Checked" : "Unchecked")
            .accessibilityAddTraits(.isToggle)
            Text(consentLine)
                .font(.custom(p.sansFont, size: 12))
                .foregroundStyle(p.mutedForeground)
                .lineSpacing(2)
                .fixedSize(horizontal: false, vertical: true)
                .tint(p.mutedForeground)
        }
    }

    private var consentLine: AttributedString {
        var line = AttributedString(copy + " ")
        var link = AttributedString("Privacy")
        link.link = SMFooterClient.privacyURL
        link.underlineStyle = .single
        line += link
        return line
    }
}

private struct SMStatusLine: View {
    @Environment(\.smPalette) private var p
    let state: SMSendState
    var body: some View {
        if let message = state.message {
            Text(message)
                .font(.custom(p.sansFont, size: 13))
                .foregroundStyle(p.foreground)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.updatesFrequently)
        }
    }
}

// MARK: - Subscribe

/// Product updates sign-up: the most visible action in the footer.
struct SMSubscribeCard: View {
    @Environment(\.smPalette) private var p
    let product: String
    let kind: SMCapture
    let client: SMFooterClient
    @State private var email = ""
    @State private var consent = false
    @State private var state = SMSendState.idle

    var body: some View {
        SMCard(padding: 24) {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 8) {
                    SMDisplay(kind == .waitlist ? "Get early access to \(product)" : "Get \(product) updates", size: 26)
                    Text(kind == .waitlist
                        ? "One email when it's ready for you. No spam, and you can leave with one click."
                        : "A short note when something new ships. No spam, and you can leave with one click.")
                        .font(SMType.text(16).font(p))
                        .foregroundStyle(p.mutedForeground)
                        .lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                }
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 10) { field; button }
                    VStack(alignment: .leading, spacing: 10) { field; button.frame(maxWidth: .infinity) }
                }
                SMConsentCheck(isOn: $consent, copy: kind.consentCopy ?? "")
                SMStatusLine(state: state)
            }
        }
    }

    private var field: some View {
        TextField("Email", text: $email, prompt: Text(verbatim: "you@example.com").foregroundStyle(p.mutedForeground))
            .textContentType(.emailAddress)
            #if os(iOS)
            .keyboardType(.emailAddress)
            .textInputAutocapitalization(.never)
            #endif
            .autocorrectionDisabled()
            .onSubmit(submit)
            .modifier(SMField(capsule: true))
            .frame(minWidth: 200)
            .accessibilityLabel("Email")
    }

    private var button: some View {
        Button("Subscribe", action: submit)
            .buttonStyle(.smSolid)
            .disabled(!consent || !SMFooterClient.isEmail(email.trimmingCharacters(in: .whitespaces)) || state == .sending)
            .opacity(consent && SMFooterClient.isEmail(email.trimmingCharacters(in: .whitespaces)) ? 1 : 0.6)
    }

    private func submit() {
        guard state != .sending else { return }
        state = .sending
        Task {
            do {
                switch try await client.subscribe(email: email, kind: kind, consent: consent) {
                case .preview:
                    state = .done(SMFooterCopy.preview)
                case .sent:
                    email = ""
                    consent = false
                    state = .done(SMFooterCopy.subscribed)
                }
            } catch {
                state = .done(SMFooterCopy.failed)
            }
        }
    }
}

// MARK: - Ask AI

/// Ask AI: the question goes straight to the assistant the person picks.
struct SMAskAI: View {
    @Environment(\.smPalette) private var p
    @Environment(\.openURL) private var openURL
    let product: String
    @State private var question: String

    init(product: String, url: String) {
        self.product = product
        _question = State(initialValue: SMAssistant.question(product: product, url: url))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: "sparkles")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(p.brand)
                    .frame(width: 26, height: 26)
                    .background(p.brandSoft, in: .rect(cornerRadius: 8))
                Text("Ask AI about \(product)")
                    .font(.custom(p.sansFont, size: 14).weight(.medium))
            }
            TextField("Your question", text: $question, axis: .vertical)
                .lineLimit(2...5)
                .modifier(SMField())
                .accessibilityLabel("Question for the assistant")
            HStack(spacing: 8) {
                ForEach(SMAssistant.allCases) { assistant in
                    Button { openURL(assistant.url(asking: question)) } label: {
                        SMAssistantMark(assistant)
                            .fill(p.foreground, style: FillStyle(eoFill: true))
                            .frame(width: 18, height: 18)
                            .frame(width: 40, height: 40)
                            .background(p.background, in: .circle)
                            .overlay(Circle().strokeBorder(p.border))
                            .contentShape(.circle)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Ask \(assistant.rawValue)")
                    .help("Ask \(assistant.rawValue)")
                }
                Spacer(minLength: 8)
                Text("Opens in your browser")
                    .font(.custom(p.sansFont, size: 11))
                    .foregroundStyle(p.mutedForeground)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(p.card, in: .rect(cornerRadius: p.radius))
        .overlay(RoundedRectangle(cornerRadius: p.radius).strokeBorder(p.hairline))
    }
}

// MARK: - Studio strip

struct SMStudioStrip: View {
    @Environment(\.smPalette) private var p
    let product: String
    let studio: [SMStudioLink]

    var body: some View {
        SMFlow(spacing: 18, lineSpacing: 8) {
            Text("From the studio").foregroundStyle(p.mutedForeground)
            ForEach(SMStudioLink.siblings(of: product, in: studio), id: \.self) { link in
                Link(link.label, destination: link.url).foregroundStyle(p.foreground)
            }
            Link(destination: SMStudioLink.allProjects) {
                HStack(spacing: 2) {
                    Text("All projects")
                    Image(systemName: "arrow.up.right").font(.system(size: 10, weight: .semibold))
                }
            }
            .foregroundStyle(p.foreground)
        }
        .font(.custom(p.sansFont, size: 14).weight(.medium))
        .accessibilityElement(children: .contain)
        .accessibilityLabel("From the studio")
    }
}

/// Wraps children onto new lines when the row is full.
struct SMFlow: Layout {
    var spacing: CGFloat
    var lineSpacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(width: proposal.width ?? .infinity, subviews: subviews)
        let width = rows.map(\.width).max() ?? 0
        let height = rows.map(\.height).reduce(0, +) + lineSpacing * CGFloat(max(rows.count - 1, 0))
        return CGSize(width: proposal.width ?? width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in arrange(width: bounds.width, subviews: subviews) {
            var x = bounds.minX
            for i in row.items {
                let size = subviews[i].sizeThatFits(.unspecified)
                subviews[i].place(at: CGPoint(x: x, y: y + (row.height - size.height) / 2), proposal: .unspecified)
                x += size.width + spacing
            }
            y += row.height + lineSpacing
        }
    }

    private struct Row { var items: [Int] = []; var width: CGFloat = 0; var height: CGFloat = 0 }

    private func arrange(width: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = [Row()]
        for i in subviews.indices {
            let size = subviews[i].sizeThatFits(.unspecified)
            let extra = rows[rows.count - 1].items.isEmpty ? size.width : rows[rows.count - 1].width + spacing + size.width
            if extra > width, !rows[rows.count - 1].items.isEmpty {
                rows.append(Row())
            }
            var row = rows[rows.count - 1]
            row.width = row.items.isEmpty ? size.width : row.width + spacing + size.width
            row.height = max(row.height, size.height)
            row.items.append(i)
            rows[rows.count - 1] = row
        }
        return rows.filter { !$0.items.isEmpty }
    }
}

// MARK: - Feedback

private struct SMScreenshotChip: View {
    @Environment(\.smPalette) private var p
    let name: String?
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "photo").font(.system(size: 12))
            Text(name ?? "Add a screenshot").lineLimit(1)
        }
        .font(.custom(p.sansFont, size: 13).weight(.medium))
        .foregroundStyle(p.foreground)
        .padding(.horizontal, 14)
        .frame(height: 34)
        .background(p.background, in: .capsule)
        .overlay(Capsule().strokeBorder(p.border))
        .contentShape(.capsule)
    }
}

/// The feedback form shown in the footer's sheet: type, summary, details, an
/// optional screenshot and email, and required consent.
struct SMFeedbackForm: View {
    @Environment(\.smPalette) private var p
    let product: String
    let screen: String
    let client: SMFooterClient
    var close: () -> Void
    @State private var draft = SMFeedbackDraft()
    @State private var consent = false
    @State private var state = SMSendState.idle
    @State private var screenshotName: String?
    #if os(iOS)
    @State private var photo: PhotosPickerItem?
    #else
    @State private var importing = false
    #endif

    init(product: String, screen: String, client: SMFooterClient, draft: SMFeedbackDraft = SMFeedbackDraft(), close: @escaping () -> Void) {
        self.product = product
        self.screen = screen
        self.client = client
        self.close = close
        _draft = State(initialValue: draft)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        SMDisplay("Send feedback", size: 26)
                        Text("Read by the person who builds \(product).")
                            .font(.custom(p.sansFont, size: 14))
                            .foregroundStyle(p.mutedForeground)
                    }
                    Spacer()
                    Button(action: close) {
                        Image(systemName: "xmark")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(p.mutedForeground)
                            .frame(width: 32, height: 32)
                            .contentShape(.circle)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Close")
                    .keyboardShortcut(.cancelAction)
                }

                VStack(alignment: .leading, spacing: 8) {
                    label("What is it about?")
                    Picker("What is it about?", selection: $draft.type) {
                        ForEach(SMFeedbackType.allCases) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .labelsHidden()
                }

                VStack(alignment: .leading, spacing: 6) {
                    label("Summary")
                    TextField("Summary", text: $draft.title, prompt: Text("One line").foregroundStyle(p.mutedForeground))
                        .modifier(SMField())
                        .accessibilityLabel("Summary")
                }
                VStack(alignment: .leading, spacing: 6) {
                    label("Details")
                    TextField("Details", text: $draft.description, prompt: Text("What happened, or what would make it better?").foregroundStyle(p.mutedForeground), axis: .vertical)
                        .lineLimit(4...10)
                        .modifier(SMField())
                        .accessibilityLabel("Details")
                }

                screenshotRow

                SMConsentCheck(isOn: $consent, copy: SMFooterCopy.feedbackConsent)

                VStack(alignment: .leading, spacing: 6) {
                    label("Email, if you want a reply")
                    TextField("Email", text: $draft.email, prompt: Text(verbatim: "you@example.com").foregroundStyle(p.mutedForeground))
                        .textContentType(.emailAddress)
                        #if os(iOS)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        #endif
                        .autocorrectionDisabled()
                        .modifier(SMField())
                        .accessibilityLabel("Email, if you want a reply")
                }

                HStack {
                    SMStatusLine(state: state)
                    Spacer()
                    Button(action: submit) {
                        Label("Send", systemImage: "paperplane")
                    }
                    .buttonStyle(.smSolid)
                    .disabled(!canSend)
                    .opacity(canSend ? 1 : 0.6)
                    .keyboardShortcut(.defaultAction)
                }

                Text(SMFooterCopy.feedbackNote)
                    .font(.custom(p.sansFont, size: 11))
                    .foregroundStyle(p.mutedForeground)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(24)
        }
        .background(p.card)
        #if os(macOS)
        .fileImporter(isPresented: $importing, allowedContentTypes: [.png, .jpeg, .webP]) { result in
            guard case .success(let url) = result else { return }
            let scoped = url.startAccessingSecurityScopedResource()
            defer { if scoped { url.stopAccessingSecurityScopedResource() } }
            if let data = try? Data(contentsOf: url) {
                draft.screenshot = data
                screenshotName = url.lastPathComponent
            }
        }
        #else
        .onChange(of: photo) { _, item in
            guard let item else { return }
            Task {
                guard let data = try? await item.loadTransferable(type: Data.self) else { return }
                // Photos may be HEIC; send a JPEG the server accepts.
                draft.screenshot = UIImage(data: data)?.jpegData(compressionQuality: 0.85)
                screenshotName = draft.screenshot == nil ? nil : "Screenshot attached"
            }
        }
        #endif
    }

    private var canSend: Bool { consent && draft.isComplete && state != .sending }

    private func label(_ text: String) -> some View {
        Text(text)
            .font(.custom(p.sansFont, size: 12).weight(.medium))
            .foregroundStyle(p.mutedForeground)
    }

    private var screenshotRow: some View {
        HStack(spacing: 10) {
            #if os(iOS)
            let name = screenshotName
            PhotosPicker(selection: $photo, matching: .images) { SMScreenshotChip(name: name) }
                .buttonStyle(.plain)
            #else
            Button { importing = true } label: { SMScreenshotChip(name: screenshotName) }
                .buttonStyle(.plain)
            #endif
            if screenshotName != nil {
                Button("Remove") {
                    draft.screenshot = nil
                    screenshotName = nil
                    #if os(iOS)
                    photo = nil
                    #endif
                }
                .buttonStyle(.plain)
                .font(.custom(p.sansFont, size: 12))
                .foregroundStyle(p.mutedForeground)
                .underline()
            }
        }
    }

    private func submit() {
        guard canSend else { return }
        state = .sending
        Task {
            do {
                switch try await client.sendFeedback(draft, screen: screen, title: product, consent: consent) {
                case .preview:
                    state = .done(SMFooterCopy.preview)
                case .sent:
                    draft = SMFeedbackDraft()
                    consent = false
                    screenshotName = nil
                    state = .done(SMFooterCopy.feedbackSent(product))
                }
            } catch {
                state = .done(SMFooterCopy.failed)
            }
        }
    }
}

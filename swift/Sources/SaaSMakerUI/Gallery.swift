import SwiftUI

// Gallery family: the quiet, image-led consumer layout from the web
// (packages/ui/src/blocks/gallery.tsx). One idea per section, a monumental
// centered headline, and real screens or art at full scale. Pair with
// `.smTheme(.gallery)`.

// MARK: - Device

/// A phone whose bezel, corners and island scale with its width, like the web Device.
/// The screen image fills the glass; pass the screenshot's aspect ratio
/// (width / height) so the frame matches it.
public struct SMDevice: View {
    private let screen: Image
    private let width: CGFloat
    private let aspectRatio: CGFloat
    private let shadow: Color
    private let label: Text?

    /// - Parameters:
    ///   - screen: The screenshot shown on the glass.
    ///   - width: Outer width of the phone; bezel, corners and island scale from it.
    ///   - aspectRatio: Screen width / height (default: a modern iPhone, 9 : 19.5).
    ///   - shadow: Color of the soft drop shadow (default: the web's warm umber).
    ///   - label: Accessibility description of the screen.
    public init(_ screen: Image, width: CGFloat = 280, aspectRatio: CGFloat = 9 / 19.5, shadow: Color = Color(red: 40 / 255, green: 20 / 255, blue: 10 / 255).opacity(0.42), label: Text? = nil) {
        self.screen = screen
        self.width = width
        self.aspectRatio = aspectRatio
        self.shadow = shadow
        self.label = label
    }

    /// Outer height for a given width and screen aspect ratio.
    public static func height(forWidth width: CGFloat, aspectRatio: CGFloat = 9 / 19.5) -> CGFloat {
        let bezel = width * 0.03
        return (width - bezel * 2) / aspectRatio + bezel * 2
    }

    public var body: some View {
        let bezel = width * 0.03
        let glass = width - bezel * 2
        let height = Self.height(forWidth: width, aspectRatio: aspectRatio)
        let body = Color(red: 13 / 255, green: 10 / 255, blue: 8 / 255)
        ZStack(alignment: .top) {
            RoundedRectangle(cornerRadius: width * 0.135, style: .continuous)
                .fill(body)
                .overlay(RoundedRectangle(cornerRadius: width * 0.135, style: .continuous).strokeBorder(.white.opacity(0.07), lineWidth: max(0.5, width * 0.003)))
            screen
                .resizable()
                .scaledToFill()
                .frame(width: glass, height: glass / aspectRatio)
                .clipShape(.rect(cornerRadius: glass * 0.115, style: .continuous))
                .padding(.top, bezel)
            Capsule()
                .fill(body)
                .frame(width: width * 0.27, height: height * 0.025)
                .padding(.top, height * 0.033)
        }
        .frame(width: width, height: height)
        .shadow(color: shadow.opacity(0.75), radius: width * 0.1, y: width * 0.16)
        .shadow(color: shadow.opacity(0.5), radius: width * 0.035, y: width * 0.05)
        .accessibilityElement()
        .accessibilityAddTraits(.isImage)
        .accessibilityLabel(label ?? Text("App screen"))
    }
}

// MARK: - Text roles

/// Caption under a plate: a bold sans lead-in, then text in the theme's text face.
public struct SMCaption: View {
    @Environment(\.smPalette) private var p
    private let lead: String?
    private let text: String

    public init(lead: String? = nil, _ text: String) {
        self.lead = lead
        self.text = text
    }

    public var body: some View {
        var line = AttributedString()
        if let lead {
            var l = AttributedString(lead + " ")
            l.font = .custom(p.displayFont, size: 16).weight(.semibold)
            l.foregroundColor = p.foreground
            line += l
        }
        var t = AttributedString(text)
        t.font = SMType.text(16).font(p)
        t.foregroundColor = p.mutedForeground
        line += t
        return Text(line).lineSpacing(3).fixedSize(horizontal: false, vertical: true)
    }
}

/// Small quiet note under actions or a plate (availability, credits).
public struct SMNote: View {
    @Environment(\.smPalette) private var p
    private let text: String
    public init(_ text: String) { self.text = text }
    public var body: some View {
        Text(text)
            .font(.custom(p.displayFont, size: 13))
            .foregroundStyle(p.mutedForeground.opacity(0.85))
            .fixedSize(horizontal: false, vertical: true)
    }
}

/// Centered eyebrow, display title and lede, shared by the Gallery sections.
private struct GalleryHeader: View {
    var eyebrow: String?
    var title: String
    var accent: String?
    var lede: String?
    var size: CGFloat
    var alignment: HorizontalAlignment = .center

    var body: some View {
        VStack(alignment: alignment, spacing: 0) {
            if let eyebrow { SMEyebrow(eyebrow).padding(.bottom, 14) }
            SMDisplay(title, accent: accent, size: size)
            if let lede { SMLede(lede).padding(.top, 18) }
        }
        .multilineTextAlignment(alignment == .center ? .center : .leading)
        .frame(maxWidth: 640, alignment: Alignment(horizontal: alignment, vertical: .top))
    }
}

/// A full-bleed image that fills its frame without changing layout.
private struct FillImage: View {
    let image: Image?
    @Environment(\.smPalette) private var p
    var body: some View {
        Color.clear
            .overlay {
                if let image {
                    image.resizable().scaledToFill()
                } else {
                    LinearGradient(colors: [p.brandSoft, p.brand.opacity(0.85)], startPoint: .top, endPoint: .bottom)
                }
            }
            .clipped()
            .accessibilityHidden(true)
    }
}

extension SMPalette {
    /// The deep Showcase section: warm light ink on `toneInk`.
    var showcase: SMPalette {
        var p = self
        p.background = toneInk
        p.foreground = Color(red: 0.957, green: 0.922, blue: 0.878)
        p.mutedForeground = Color(red: 0.706, green: 0.647, blue: 0.588)
        p.accentInk = Color(red: 0.561, green: 0.498, blue: 0.439)
        p.brand = Color(red: 0.914, green: 0.541, blue: 0.373)
        p.border = .white.opacity(0.12)
        p.hairline = .white.opacity(0.08)
        p.isDark = true
        return p
    }

    /// White type over a photograph.
    var overPhoto: SMPalette {
        var p = self
        p.foreground = .white
        p.mutedForeground = .white.opacity(0.86)
        p.accentInk = .white.opacity(0.72)
        p.brand = Color(red: 1, green: 0.851, blue: 0.761)
        p.isDark = true
        return p
    }
}

// MARK: - Hero

/// Centered monumental hero: eyebrow, display title with an accent phrase,
/// lede, actions and a note, then the device rising out of a full-bleed backdrop.
public struct SMHero<Actions: View>: View {
    @Environment(\.smPalette) private var p
    private let eyebrow: String?
    private let title: String
    private let accent: String?
    private let lede: String?
    private let note: String?
    private let screen: Image
    private let screenLabel: Text?
    private let aspectRatio: CGFloat
    private let backdrop: Image?
    private let deviceWidth: CGFloat
    private let titleSize: CGFloat
    private let actions: Actions

    /// - Parameters:
    ///   - backdrop: Full-bleed texture or art behind the device; `nil` uses a soft brand gradient.
    ///   - deviceWidth: Outer phone width (web: 248–392 pt).
    ///   - titleSize: Display size of the title.
    ///   - actions: Buttons, usually `.smBrand` then `.smLink`.
    public init(eyebrow: String? = nil, _ title: String, accent: String? = nil, lede: String? = nil, note: String? = nil, screen: Image, screenLabel: Text? = nil, aspectRatio: CGFloat = 9 / 19.5, backdrop: Image? = nil, deviceWidth: CGFloat = 260, titleSize: CGFloat = 52, @ViewBuilder actions: () -> Actions) {
        self.eyebrow = eyebrow
        self.title = title
        self.accent = accent
        self.lede = lede
        self.note = note
        self.screen = screen
        self.screenLabel = screenLabel
        self.aspectRatio = aspectRatio
        self.backdrop = backdrop
        self.deviceWidth = deviceWidth
        self.titleSize = titleSize
        self.actions = actions()
    }

    public var body: some View {
        let deviceHeight = SMDevice.height(forWidth: deviceWidth, aspectRatio: aspectRatio)
        let rise = deviceHeight * 0.26
        VStack(spacing: 0) {
            VStack(spacing: 0) {
                GalleryHeader(eyebrow: eyebrow, title: title, accent: accent, lede: lede, size: titleSize)
                HStack(spacing: 14) { actions }.padding(.top, 28)
                if let note { SMNote(note).multilineTextAlignment(.center).padding(.top, 14) }
            }
            .padding(.horizontal, 24)
            ZStack(alignment: .top) {
                FillImage(image: backdrop)
                    .padding(.top, rise)
                SMDevice(screen, width: deviceWidth, aspectRatio: aspectRatio, label: screenLabel)
            }
            .frame(height: deviceHeight * 0.9, alignment: .top)
            .frame(maxWidth: .infinity)
            // Crop the sides and bottom only, so the device's shadow can fall upward.
            .mask(Rectangle().padding(.top, -deviceWidth))
            .padding(.top, 52)
        }
        .padding(.top, 56)
    }
}

extension SMHero where Actions == EmptyView {
    /// A hero without actions.
    public init(eyebrow: String? = nil, _ title: String, accent: String? = nil, lede: String? = nil, note: String? = nil, screen: Image, screenLabel: Text? = nil, aspectRatio: CGFloat = 9 / 19.5, backdrop: Image? = nil, deviceWidth: CGFloat = 260, titleSize: CGFloat = 52) {
        self.init(eyebrow: eyebrow, title, accent: accent, lede: lede, note: note, screen: screen, screenLabel: screenLabel, aspectRatio: aspectRatio, backdrop: backdrop, deviceWidth: deviceWidth, titleSize: titleSize) { EmptyView() }
    }
}

// MARK: - Showcase

/// Deep section: centered headline on `toneInk`, then one screen at the size
/// of a room, cropped by a warm plate. The device grows into place on scroll
/// (`smZoom`), so place it inside a ScrollView.
public struct SMShowcase: View {
    @Environment(\.smPalette) private var p
    private let eyebrow: String?
    private let title: String
    private let accent: String?
    private let lede: String?
    private let screen: Image
    private let screenLabel: Text?
    private let aspectRatio: CGFloat
    private let captionLead: String?
    private let caption: String?
    private let note: String?
    private let deviceWidth: CGFloat
    private let plateHeight: CGFloat
    private let titleSize: CGFloat

    /// - Parameters:
    ///   - deviceWidth: Outer phone width; make it big (web: 336–600 pt).
    ///   - plateHeight: Height of the warm plate that crops the device.
    ///   - captionLead: Bold lead-in of the caption under the plate.
    ///   - note: Quiet note beside the caption (e.g. "actual screen").
    public init(eyebrow: String? = nil, _ title: String, accent: String? = nil, lede: String? = nil, screen: Image, screenLabel: Text? = nil, aspectRatio: CGFloat = 9 / 19.5, captionLead: String? = nil, caption: String? = nil, note: String? = nil, deviceWidth: CGFloat = 340, plateHeight: CGFloat = 540, titleSize: CGFloat = 42) {
        self.eyebrow = eyebrow
        self.title = title
        self.accent = accent
        self.lede = lede
        self.screen = screen
        self.screenLabel = screenLabel
        self.aspectRatio = aspectRatio
        self.captionLead = captionLead
        self.caption = caption
        self.note = note
        self.deviceWidth = deviceWidth
        self.plateHeight = plateHeight
        self.titleSize = titleSize
    }

    public var body: some View {
        let ink = p.showcase
        let deviceHeight = SMDevice.height(forWidth: deviceWidth, aspectRatio: aspectRatio)
        VStack(spacing: 0) {
            GalleryHeader(eyebrow: eyebrow, title: title, accent: accent, lede: lede, size: titleSize)
                .padding(.horizontal, 24)
            ZStack(alignment: .top) {
                RadialGradient(
                    colors: [Color(red: 0.227, green: 0.165, blue: 0.122), Color(red: 0.09, green: 0.067, blue: 0.051)],
                    center: UnitPoint(x: 0.5, y: 0.4), startRadius: 0, endRadius: plateHeight * 0.85
                )
                SMDevice(screen, width: deviceWidth, aspectRatio: aspectRatio, shadow: .black.opacity(0.6), label: screenLabel)
                    .smZoom()
                    .offset(y: -deviceHeight * 0.1)
            }
            .frame(height: plateHeight)
            .frame(maxWidth: .infinity)
            .clipped()
            .padding(.top, 64)
            if caption != nil || note != nil {
                VStack(alignment: .leading, spacing: 6) {
                    if let caption { SMCaption(lead: captionLead, caption) }
                    if let note { SMNote(note) }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)
                .padding(.top, 18)
            }
        }
        .padding(.top, 96)
        .padding(.bottom, 72)
        .frame(maxWidth: .infinity)
        .background(ink.background)
        .foregroundStyle(ink.foreground)
        .environment(\.smPalette, ink)
        .environment(\.colorScheme, .dark)
    }
}

// MARK: - Cover

/// Full-bleed photograph with a warm gradient and the story set bottom-leading in white.
public struct SMCover: View {
    @Environment(\.smPalette) private var p
    private let eyebrow: String?
    private let title: String
    private let accent: String?
    private let lede: String?
    private let image: Image?
    private let credit: String?
    private let height: CGFloat
    private let titleSize: CGFloat

    /// - Parameters:
    ///   - image: The photograph; `nil` uses a brand gradient placeholder.
    ///   - credit: Small credit set bottom-trailing (e.g. "Illustrative artwork").
    ///   - height: Height of the plate.
    public init(eyebrow: String? = nil, _ title: String, accent: String? = nil, lede: String? = nil, image: Image?, credit: String? = nil, height: CGFloat = 600, titleSize: CGFloat = 42) {
        self.eyebrow = eyebrow
        self.title = title
        self.accent = accent
        self.lede = lede
        self.image = image
        self.credit = credit
        self.height = height
        self.titleSize = titleSize
    }

    public var body: some View {
        let white = p.overPhoto
        let shade = Color(red: 20 / 255, green: 12 / 255, blue: 6 / 255)
        ZStack(alignment: .bottomLeading) {
            FillImage(image: image)
            LinearGradient(stops: [.init(color: shade.opacity(0.62), location: 0), .init(color: shade.opacity(0.25), location: 0.45), .init(color: .clear, location: 0.7)], startPoint: .leading, endPoint: .trailing)
            LinearGradient(stops: [.init(color: shade.opacity(0.7), location: 0), .init(color: .clear, location: 0.55)], startPoint: .bottom, endPoint: .top)
            GalleryHeader(eyebrow: eyebrow, title: title, accent: accent, lede: lede, size: titleSize, alignment: .leading)
                .padding(.horizontal, 24)
                .padding(.bottom, credit == nil ? 48 : 56)
            if let credit {
                Text(credit)
                    .font(.custom(p.displayFont, size: 12))
                    .foregroundStyle(.white.opacity(0.8))
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 16)
            }
        }
        .frame(height: height)
        .frame(maxWidth: .infinity)
        .clipped()
        .foregroundStyle(.white)
        .environment(\.smPalette, white)
        .environment(\.colorScheme, .dark)
    }
}

// MARK: - Statement rows

/// One ruled row: a title, a sentence, and an optional status (brand-colored when `on`).
public struct SMStatementRow: Identifiable, Sendable, Hashable {
    public var id: String { title }
    public var title: String
    public var body: String
    public var status: String?
    public var on: Bool

    public init(_ title: String, body: String, status: String? = nil, on: Bool = false) {
        self.title = title
        self.body = body
        self.status = status
        self.on = on
    }
}

/// Quiet ruled rows under a statement: title, body and status. Three columns
/// when there is room (Mac, iPad), stacked on a phone.
public struct SMStatementRows: View {
    @Environment(\.smPalette) private var p
    private let rows: [SMStatementRow]

    public init(_ rows: [SMStatementRow]) { self.rows = rows }

    public var body: some View {
        VStack(spacing: 0) {
            Rectangle().fill(p.border).frame(height: 1)
            ForEach(rows) { row in
                ViewThatFits(in: .horizontal) {
                    wide(row).frame(minWidth: 620)
                    compact(row)
                }
                .padding(.vertical, 22)
                .overlay(alignment: .bottom) { Rectangle().fill(p.border).frame(height: 1) }
                .accessibilityElement(children: .combine)
            }
        }
    }

    private func title(_ row: SMStatementRow) -> some View {
        Text(row.title)
            .font(.custom(p.displayFont, size: 22).weight(.semibold))
            .tracking(-0.55)
    }

    private func text(_ row: SMStatementRow) -> some View {
        Text(row.body)
            .font(SMType.text(18).font(p))
            .foregroundStyle(p.mutedForeground)
            .lineSpacing(3)
            .fixedSize(horizontal: false, vertical: true)
    }

    @ViewBuilder private func status(_ row: SMStatementRow) -> some View {
        if let status = row.status {
            Text(status)
                .font(.custom(p.displayFont, size: 13).weight(.semibold))
                .foregroundStyle(row.on ? p.brand : p.mutedForeground.opacity(0.8))
        }
    }

    private func wide(_ row: SMStatementRow) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 24) {
            title(row).frame(width: 200, alignment: .leading)
            text(row).frame(maxWidth: .infinity, alignment: .leading)
            status(row).frame(width: 120, alignment: .trailing)
        }
    }

    private func compact(_ row: SMStatementRow) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                title(row)
                Spacer(minLength: 12)
                status(row)
            }
            text(row)
        }
    }
}

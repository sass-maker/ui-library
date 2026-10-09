import SwiftUI

// MARK: - Buttons

/// Button styles matching the web: brand pill (primary call to action),
/// solid (primary color), outline, and link.
public struct SMButtonStyle: ButtonStyle {
    public enum Kind: Sendable { case brand, solid, outline, link }
    @Environment(\.smPalette) private var p
    private let kind: Kind

    public init(_ kind: Kind = .brand) { self.kind = kind }

    public func makeBody(configuration: Configuration) -> some View {
        let label = configuration.label
            .font(.custom(p.displayFont, size: 16).weight(.semibold))
            .textCase(p.uiLowercase ? .lowercase : nil)
            .padding(.horizontal, kind == .link ? 4 : 22)
            .frame(minHeight: kind == .link ? 32 : 46)
        return Group {
            switch kind {
            case .brand: label.foregroundStyle(p.brandForeground).background(p.brand, in: .capsule)
            case .solid: label.foregroundStyle(p.primaryForeground).background(p.primary, in: .capsule)
            case .outline: label.foregroundStyle(p.foreground).overlay(Capsule().strokeBorder(p.border))
            case .link: label.foregroundStyle(p.brand)
            }
        }
        .contentShape(.capsule)
        .scaleEffect(configuration.isPressed ? 0.98 : 1)
        .opacity(configuration.isPressed ? 0.9 : 1)
        .animation(SMMotion.press, value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == SMButtonStyle {
    public static var smBrand: SMButtonStyle { SMButtonStyle(.brand) }
    public static var smSolid: SMButtonStyle { SMButtonStyle(.solid) }
    public static var smOutline: SMButtonStyle { SMButtonStyle(.outline) }
    public static var smLink: SMButtonStyle { SMButtonStyle(.link) }
}

// MARK: - Surfaces

/// The card: a quiet raised surface with the theme radius and a hairline.
public struct SMCard<Content: View>: View {
    @Environment(\.smPalette) private var p
    private let padding: CGFloat
    private let content: Content

    public init(padding: CGFloat = 20, @ViewBuilder content: () -> Content) {
        self.padding = padding
        self.content = content()
    }

    public var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(p.card, in: .rect(cornerRadius: p.radius + 4))
            .overlay(RoundedRectangle(cornerRadius: p.radius + 4).strokeBorder(p.hairline))
            .shadow(color: .black.opacity(p.isDark ? 0.3 : 0.06), radius: 18, y: 8)
    }
}

/// Eyebrow, headline and lede as one block: the native SectionHeader.
public struct SMSectionHeader: View {
    private let eyebrow: String?
    private let title: String
    private let accent: String?
    private let lede: String?
    private let alignment: HorizontalAlignment
    private let size: CGFloat

    public init(eyebrow: String? = nil, _ title: String, accent: String? = nil, lede: String? = nil, alignment: HorizontalAlignment = .leading, size: CGFloat = 34) {
        self.eyebrow = eyebrow
        self.title = title
        self.accent = accent
        self.lede = lede
        self.alignment = alignment
        self.size = size
    }

    public var body: some View {
        VStack(alignment: alignment, spacing: 12) {
            if let eyebrow { SMEyebrow(eyebrow) }
            SMDisplay(title, accent: accent, size: size)
            if let lede { SMLede(lede).padding(.top, 4) }
        }
        .multilineTextAlignment(alignment == .center ? .center : .leading)
        .frame(maxWidth: .infinity, alignment: Alignment(horizontal: alignment, vertical: .top))
    }
}

/// Small status label (success, danger, warning, brand, neutral), like the web StatusPill.
public struct SMStatusPill: View {
    public enum Tone: Sendable { case neutral, success, danger, warning, brand }
    @Environment(\.smPalette) private var p
    private let text: String
    private let tone: Tone

    public init(_ text: String, tone: Tone = .neutral) {
        self.text = text
        self.tone = tone
    }

    public var body: some View {
        let color: Color = switch tone {
        case .neutral: p.mutedForeground
        case .success: p.success
        case .danger: p.destructive
        case .warning: p.warning
        case .brand: p.brand
        }
        HStack(spacing: 5) {
            Circle().fill(color).frame(width: 5, height: 5)
            Text(text).font(.custom(p.monoFont, size: 11).weight(.medium))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(color.opacity(0.12), in: .capsule)
    }
}

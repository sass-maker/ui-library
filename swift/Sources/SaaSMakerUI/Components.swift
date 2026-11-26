import SwiftUI

// MARK: - Buttons

/// Button styles matching the web: brand pill (primary call to action),
/// solid (primary color), outline, and link.
public struct SMButtonStyle: ButtonStyle {
    public enum Kind: Sendable { case brand, solid, outline, link }
    /// Compact uses the shared small-control rhythm (14pt type, 12pt inset,
    /// 32pt minimum). Keep regular for primary actions and add a 44pt label
    /// hit area for compact controls used on touch devices.
    /// Planner is label-sized by default, with a 28pt Mac face or a 34pt touch
    /// face inside a 44pt target. Its text follows the subheadline type scale.
    public enum Size: Sendable { case regular, compact, planner }
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.smPalette) private var p
    let kind: Kind
    let size: Size
    private let expands: Bool
    private let isDestructive: Bool

    public init(_ kind: Kind = .brand, size: Size = .regular) {
        self.init(kind, size: size, expands: false)
    }

    public init(_ kind: Kind = .brand, size: Size = .regular, expands: Bool, isDestructive: Bool = false) {
        self.kind = kind
        self.size = size
        self.expands = expands
        self.isDestructive = isDestructive
    }

    var metrics: Metrics { Metrics(kind: kind, size: size) }
    struct Metrics: Equatable {
        let fontSize: CGFloat
        let horizontalPadding: CGFloat
        let minimumHeight: CGFloat
        init(kind: Kind, size: Size) {
            if size == .planner {
                fontSize = 13
                horizontalPadding = 12
                #if os(macOS)
                minimumHeight = 28
                #else
                minimumHeight = 34
                #endif
                return
            }
            fontSize = size == .compact ? 14 : 16
            horizontalPadding = kind == .link ? 4 : size == .compact ? 12 : 22
            minimumHeight = kind == .link || size == .compact ? 32 : 46
        }
    }

    static func pressScale(_ pressed: Bool) -> CGFloat { pressed ? 0.98 : 1 }
    static func pressOpacity(_ pressed: Bool) -> Double { pressed ? 0.9 : 1 }

    public func makeBody(configuration: Configuration) -> some View {
        let planner = size == .planner
        let destructive = isDestructive || (planner && configuration.role == .destructive)
        let font: Font = planner
            ? .custom(p.displayFont, size: metrics.fontSize, relativeTo: .subheadline)
            : .custom(p.displayFont, size: metrics.fontSize)
        let shape = Capsule(style: .circular)
        let label = configuration.label
            .font(font.weight(.semibold))
            .textCase(p.uiLowercase ? .lowercase : nil)
            .padding(.horizontal, metrics.horizontalPadding)
            .padding(.vertical, planner ? 4 : 0)
            .frame(maxWidth: expands ? .infinity : nil, minHeight: metrics.minimumHeight)
        return Group {
            switch kind {
            case .brand: label.foregroundStyle(p.brandForeground).background(destructive ? p.destructive : p.brand, in: .capsule)
            case .solid: label.foregroundStyle(p.primaryForeground).background(destructive ? p.destructive : p.primary, in: .capsule)
            // Circular, not the default continuous capsule: a continuous capsule's
            // stroke draws stray vertical hairlines at its ends.
            case .outline:
                label.foregroundStyle(destructive ? p.destructive : p.foreground)
                    .background(planner ? p.surface : Color.clear, in: shape)
                    .overlay(shape.strokeBorder(p.border))
            case .link: label.foregroundStyle(destructive ? p.destructive : p.brand)
            }
        }
        #if !os(macOS)
        .frame(minHeight: planner ? 44 : nil)
        #endif
        .contentShape(planner ? AnyShape(Rectangle()) : AnyShape(Capsule()))
        .scaleEffect(planner && reduceMotion ? 1 : Self.pressScale(configuration.isPressed))
        .opacity(planner && !isEnabled ? 0.4 : Self.pressOpacity(configuration.isPressed))
        .animation(planner && reduceMotion ? nil : SMMotion.press, value: configuration.isPressed)
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

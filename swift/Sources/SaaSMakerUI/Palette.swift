import SwiftUI

/// A theme preset: the same color roles, radius and display type settings as
/// the web `data-theme` presets. Generated presets live in Tokens.generated.swift.
public struct SMPalette: Sendable, Equatable {
    public var background: Color
    public var foreground: Color
    public var surface: Color
    public var card: Color
    public var primary: Color
    public var primaryForeground: Color
    public var secondary: Color
    public var muted: Color
    public var mutedForeground: Color
    public var accent: Color
    public var border: Color
    public var hairline: Color
    public var input: Color
    public var brand: Color
    public var brandForeground: Color
    public var brandSoft: Color
    /// Color of the accent phrase in display type.
    public var accentInk: Color
    /// Deep color for inverse sections.
    public var toneInk: Color
    public var destructive: Color
    public var success: Color
    public var warning: Color
    public var radius: CGFloat
    public var displayWeight: Double
    /// Letter spacing in em.
    public var displayTracking: Double
    public var accentItalic: Bool
    public var displaySerif: Bool
    public var accentSerif: Bool
    /// Long-form text (ledes, captions) in a serif, like the web --font-text.
    public var textSerif: Bool
    /// Font families (bundled; see SMFonts). Same faces as the web theme.
    public var displayFont: String
    public var accentFont: String
    public var textFont: String
    public var sansFont: String
    public var monoFont: String
    /// Fleet voice: headings and buttons/nav in lowercase.
    public var displayLowercase: Bool
    public var uiLowercase: Bool
    public var isDark: Bool

    /// Dark variant of the preset, preserving its typography and radius.
    public var dark: SMPalette {
        if self == .ink || self == .workbench { return .inkDark }
        if isDark { return self }
        switch self {
        case .base: return .baseDark
        case .paper: return .paperDark
        case .hearth: return .hearthDark
        case .signal: return .signalDark
        case .gallery: return .galleryDark
        default:
            var p = self
            let d = SMPalette.baseDark
            p.background = d.background; p.foreground = d.foreground
            p.surface = d.surface; p.card = d.card
            p.primary = d.primary; p.primaryForeground = d.primaryForeground
            p.secondary = d.secondary; p.muted = d.muted; p.mutedForeground = d.mutedForeground
            p.accent = d.accent; p.border = d.border; p.hairline = d.hairline; p.input = d.input
            p.brandForeground = d.brandForeground; p.brandSoft = p.brand.opacity(0.18)
            p.accentInk = p.brand; p.toneInk = d.toneInk
            p.destructive = d.destructive; p.success = d.success; p.warning = d.warning
            p.isDark = true
            return p
        }
    }

    /// Copy the app's semantic colors in sRGB; use the same values in page.fromApp.
    /// Radius is in points (web px). Fonts use bundled Apple family names or system.
    public static func fromApp(
        background: Color, foreground: Color, card: Color, border: Color, brand: Color,
        brandForeground: Color, surface: Color? = nil, muted: Color? = nil,
        mutedForeground: Color? = nil, destructive: Color? = nil, radius: CGFloat = 12,
        sansFont: String = "Geist", displayFont: String = "Figtree", monoFont: String = "Geist Mono",
        isDark: Bool = true
    ) -> SMPalette {
        var p = isDark ? SMPalette.baseDark : SMPalette.base
        p.background = background; p.foreground = foreground; p.card = card
        p.surface = surface ?? card; p.muted = muted ?? p.surface
        p.mutedForeground = mutedForeground ?? foreground
        p.border = border; p.hairline = border; p.input = border
        p.primary = foreground; p.primaryForeground = background
        p.secondary = p.surface; p.accent = p.surface
        p.brand = brand; p.brandForeground = brandForeground
        p.brandSoft = brand.opacity(0.18); p.accentInk = brand
        if let destructive { p.destructive = destructive }
        p.radius = radius; p.sansFont = sansFont; p.textFont = sansFont
        p.displayFont = displayFont; p.accentFont = displayFont; p.monoFont = monoFont
        p.displaySerif = ["Newsreader", "Fraunces", "Instrument Serif"].contains(displayFont)
        p.accentSerif = p.displaySerif
        p.textSerif = ["Newsreader", "Fraunces", "Instrument Serif"].contains(sansFont)
        p.displayWeight = displayFont == "Instrument Serif" ? 400 : 600
        p.accentItalic = false
        return p
    }

    /// The product identity override, like the web `--brand` tokens.
    public func brand(_ brand: Color, foreground: Color? = nil, soft: Color? = nil) -> SMPalette {
        var p = self
        // Presets whose accent phrase follows the brand (like the web's
        // --accent-ink: var(--brand)) keep following it.
        if accentInk == self.brand { p.accentInk = brand }
        p.brand = brand
        if let foreground { p.brandForeground = foreground }
        p.brandSoft = soft ?? brand.opacity(isDark ? 0.14 : 0.12)
        return p
    }
}

private struct SMPaletteKey: EnvironmentKey {
    static let defaultValue = SMPalette.baseDark
}

extension EnvironmentValues {
    public var smPalette: SMPalette {
        get { self[SMPaletteKey.self] }
        set { self[SMPaletteKey.self] = newValue }
    }
}

extension View {
    /// Apply a preset to a view tree: sets the palette, background, tint and color scheme.
    public func smTheme(_ palette: SMPalette) -> some View {
        SMFonts.register()
        return environment(\.smPalette, palette)
            .tint(palette.brand)
            .foregroundStyle(palette.foreground)
            .font(.custom(palette.sansFont, size: 16, relativeTo: .body))
            .background(palette.background.ignoresSafeArea())
            .preferredColorScheme(palette.isDark ? .dark : .light)
    }
}

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
    public var isDark: Bool

    /// The product identity override, like the web `--brand` tokens.
    public func brand(_ brand: Color, foreground: Color? = nil, soft: Color? = nil) -> SMPalette {
        var p = self
        p.brand = brand
        if let foreground { p.brandForeground = foreground }
        p.brandSoft = soft ?? brand.opacity(isDark ? 0.14 : 0.12)
        return p
    }
}

private struct SMPaletteKey: EnvironmentKey {
    static let defaultValue = SMPalette.base
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
        environment(\.smPalette, palette)
            .tint(palette.brand)
            .foregroundStyle(palette.foreground)
            .background(palette.background.ignoresSafeArea())
            .preferredColorScheme(palette.isDark ? .dark : .light)
    }
}

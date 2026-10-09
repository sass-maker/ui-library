import CoreText
import Foundation

/// The web theme's fonts, bundled (SIL Open Font License; see Fonts/Licenses).
/// `smTheme` registers them; call `SMFonts.register()` yourself only if you
/// use the families before applying a theme.
public enum SMFonts {
    public static let files = [
        "Figtree", "Figtree-Italic", "Newsreader", "Newsreader-Italic", "Geist", "GeistMono",
        "InstrumentSerif-Regular", "InstrumentSerif-Italic", "Fraunces", "Fraunces-Italic",
    ]

    private static let once: Void = {
        for name in files {
            guard let url = Bundle.module.url(forResource: name, withExtension: "ttf", subdirectory: "Fonts") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }()

    public static func register() { _ = once }
}

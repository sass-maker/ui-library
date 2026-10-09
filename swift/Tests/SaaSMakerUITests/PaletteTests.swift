import CoreText
import SwiftUI
import Testing
@testable import SaaSMakerUI

@Suite struct PaletteTests {
    @Test func presetsMatchTheWebTheme() {
        #expect(SMPalette.gallery.textSerif)
        #expect(!SMPalette.gallery.displaySerif)
        #expect(SMPalette.paper.displaySerif)
        #expect(SMPalette.ink.isDark && SMPalette.ink.accentSerif)
        #expect(SMPalette.gallery.radius == 20)
    }

    @Test func brandOverrideKeepsTheRest() {
        let amber = SMPalette.ink.brand(.orange)
        #expect(amber.brand == .orange)
        #expect(amber.background == SMPalette.ink.background)
        #expect(amber.accentInk == .orange, "ink's accent phrase follows the brand")
        #expect(SMPalette.gallery.brand(.orange).accentInk == .orange, "gallery's accent phrase follows the brand too")
    }
}

@Suite struct FontTests {
    @Test func bundledFamiliesRegister() {
        SMFonts.register()
        for family in ["Figtree", "Newsreader", "Geist", "Geist Mono", "Instrument Serif", "Fraunces"] {
            let font = CTFontCreateWithName(family as CFString, 20, nil)
            #expect(CTFontCopyFamilyName(font) as String == family, "\(family) is not registered")
        }
    }

    @Test func themesUseTheWebFaces() {
        #expect(SMPalette.gallery.displayFont == "Figtree")
        #expect(SMPalette.gallery.textFont == "Newsreader")
        #expect(SMPalette.ink.accentFont == "Instrument Serif")
        #expect(SMPalette.gallery.displayLowercase && SMPalette.ink.uiLowercase)
    }
}

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

    @Test func darkVariantsMatchGeneratedPalettes() {
        #expect(SMPalette.base.dark == .baseDark)
        #expect(SMPalette.paper.dark == .paperDark)
        #expect(SMPalette.hearth.dark == .hearthDark)
        #expect(SMPalette.signal.dark == .signalDark)
        #expect(SMPalette.gallery.dark == .galleryDark)
        #expect(SMPalette.ink.dark == .inkDark)
        #expect(SMPalette.workbench.dark == .workbenchDark)
        #expect(SMPalette.gallery.dark.dark == .galleryDark)
    }

    @Test func appPaletteUsesCopiedRoles() {
        let p = SMPalette.fromApp(background: .black, foreground: .white, card: .gray,
            border: .orange, brand: .blue, brandForeground: .white, surface: .brown,
            muted: .purple, mutedForeground: .yellow, destructive: .red, radius: 10,
            sansFont: "Geist", displayFont: "Instrument Serif", monoFont: "Geist Mono")
        #expect(p.isDark && p.background == .black && p.foreground == .white)
        #expect(p.card == .gray && p.surface == .brown && p.muted == .purple)
        #expect(p.mutedForeground == .yellow && p.border == .orange && p.input == .orange)
        #expect(p.brand == .blue && p.accentInk == .blue && p.brandForeground == .white)
        #expect(p.primary == .white && p.primaryForeground == .black && p.radius == 10)
        #expect(p.displayFont == "Instrument Serif" && p.displaySerif && p.displayWeight == 400)
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

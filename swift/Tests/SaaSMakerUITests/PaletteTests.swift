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
    }
}

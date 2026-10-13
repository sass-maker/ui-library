import AppKit
import SwiftUI
import Testing
@testable import SaaSMakerUI

@MainActor @Suite struct ButtonTests {
    @Test func preservesExistingAPIAndMetrics() {
        let styles: [SMButtonStyle] = [.smBrand, .smSolid, .smOutline, .smLink, SMButtonStyle()]
        for style in styles {
            #expect(style.size == .regular)
            #expect(style.metrics.fontSize == 16)
            #expect(style.metrics.horizontalPadding == (style.kind == .link ? 4 : 22))
            #expect(style.metrics.minimumHeight == (style.kind == .link ? 32 : 46))
            #expect(style.metrics == SMButtonStyle(style.kind, size: .regular).metrics)
        }
    }

    @Test(arguments: [SMButtonStyle.Kind.brand, .solid, .outline, .link])
    func compactMetricsAndPressCompatibility(kind: SMButtonStyle.Kind) {
        let style = SMButtonStyle(kind, size: .compact)
        #expect(style.metrics.fontSize == 14)
        #expect(style.metrics.horizontalPadding == (kind == .link ? 4 : 12))
        #expect(style.metrics.minimumHeight == 32)
        #expect(SMButtonStyle.pressScale(false) == 1)
        #expect(SMButtonStyle.pressScale(true) == 0.98)
        #expect(SMButtonStyle.pressOpacity(false) == 1)
        #expect(SMButtonStyle.pressOpacity(true) == 0.9)
    }

    private func bitmap<V: View>(_ view: V) throws -> NSBitmapImageRep {
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2
        let image = try #require(renderer.nsImage)
        let data = try #require(image.tiffRepresentation)
        return try #require(NSBitmapImageRep(data: data))
    }

    @Test(arguments: [SMButtonStyle.Kind.brand, .solid, .outline, .link])
    func rendersCompactSmallerWithoutClipping(kind: SMButtonStyle.Kind) throws {
        let regular = try bitmap(Button("Inspect") {}.buttonStyle(SMButtonStyle(kind)).smTheme(.baseDark))
        let compact = try bitmap(Button("Inspect") {}.buttonStyle(SMButtonStyle(kind, size: .compact)).smTheme(.baseDark))
        #expect(compact.pixelsHigh == 64)
        #expect(regular.pixelsHigh == (kind == .link ? 64 : 92))
        #expect(compact.pixelsWide < regular.pixelsWide)
        let long = try bitmap(Button("Inspect selected item") {}.buttonStyle(SMButtonStyle(kind, size: .compact)).smTheme(.baseDark))
        #expect(long.pixelsWide > compact.pixelsWide)
        #expect(long.pixelsHigh >= compact.pixelsHigh)
    }


    // Frozen pre-size-API layout: catches accidental default appearance changes,
    // including disabled rendering, independently of the new metrics helpers.
    private struct LegacyButtonStyle: ButtonStyle {
        let kind: SMButtonStyle.Kind
        @Environment(\.smPalette) private var p
        func makeBody(configuration: Configuration) -> some View {
            let label = configuration.label
                .font(.custom(p.displayFont, size: 16).weight(.semibold))
                .textCase(p.uiLowercase ? .lowercase : nil)
                .padding(.horizontal, kind == .link ? 4 : 22)
                .frame(minHeight: kind == .link ? 32 : 46)
            return Group {
                switch kind {
                case .brand: label.foregroundStyle(p.brandForeground).background(p.brand, in: .capsule)
                case .solid: label.foregroundStyle(p.primaryForeground).background(p.primary, in: .capsule)
                case .outline: label.foregroundStyle(p.foreground).overlay(Capsule(style: .circular).strokeBorder(p.border))
                case .link: label.foregroundStyle(p.brand)
                }
            }
            .contentShape(.capsule)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .opacity(configuration.isPressed ? 0.9 : 1)
            .animation(SMMotion.press, value: configuration.isPressed)
        }
    }

    @Test(arguments: [SMButtonStyle.Kind.brand, .solid, .outline, .link])
    func defaultAppearanceMatchesPreSizeAPI(kind: SMButtonStyle.Kind) throws {
        for disabled in [false, true] {
            let current = try bitmap(Button("Inspect") {}.buttonStyle(SMButtonStyle(kind)).disabled(disabled).smTheme(.baseDark))
            let legacy = try bitmap(Button("Inspect") {}.buttonStyle(LegacyButtonStyle(kind: kind)).disabled(disabled).smTheme(.baseDark))
            #expect(current.pixelsWide == legacy.pixelsWide)
            #expect(current.pixelsHigh == legacy.pixelsHigh)
            #expect(current.representation(using: .png, properties: [:]) == legacy.representation(using: .png, properties: [:]))
        }
    }

    @Test func nativeExamples() throws {
        guard let dir = ProcessInfo.processInfo.environment["SM_SNAPSHOT_DIR"] else { return }
        for width: CGFloat in [390, 768] {
            let view = VStack(alignment: .leading, spacing: 16) {
                Text("Shared buttons · regular / compact").font(.headline)
                ForEach(0..<4) { index in
                    let kind: SMButtonStyle.Kind = [.brand, .solid, .outline, .link][index]
                    HStack(spacing: 12) {
                        Button("Inspect") {}.buttonStyle(SMButtonStyle(kind))
                        Button("Inspect") {}.buttonStyle(SMButtonStyle(kind, size: .compact))
                        Button("Inspect") {}.buttonStyle(SMButtonStyle(kind, size: .compact)).disabled(true)
                    }
                }
                Text("Larger text · compact").font(.headline)
                Button {} label: {
                    Text("Inspect selected item").font(.custom(SMPalette.baseDark.displayFont, size: 22).weight(.semibold))
                }.buttonStyle(SMButtonStyle(.outline, size: .compact))
                Text("Touch label retains a 44pt target").font(.headline)
                Button {} label: { Label("Video", systemImage: "play.rectangle.fill").frame(minHeight: 44) }
                    .buttonStyle(SMButtonStyle(.outline, size: .compact))
            }
            .padding(20).frame(width: width, alignment: .leading).smTheme(.baseDark)
            let rep = try bitmap(view)
            #expect(rep.pixelsWide == Int(width * 2))
            try #require(rep.representation(using: .png, properties: [:]))
                .write(to: URL(fileURLWithPath: "\(dir)/buttons-\(Int(width)).png"))
        }
    }
}

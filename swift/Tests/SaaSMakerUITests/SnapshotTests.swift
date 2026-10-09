import SwiftUI
import Testing
@testable import SaaSMakerUI

/// Renders sample screens to PNG when SM_SNAPSHOT_DIR is set, for visual review.
@Suite struct SnapshotTests {
    @MainActor @Test func renderSamples() throws {
        guard let dir = ProcessInfo.processInfo.environment["SM_SNAPSHOT_DIR"] else { return }
        let samples: [(String, SMPalette, String, String, String)] = [
            ("gallery", .gallery, "Remember the people you want to stay", "close to.", "Kith for iPhone"),
            ("workbench", .ink.brand(Color(red: 0.95, green: 0.68, blue: 0.24)), "AI writes code fast. It leaves it", "unverified.", "Execution-backed verification"),
        ]
        for (name, palette, title, accent, eyebrow) in samples {
            let view = VStack(alignment: .leading, spacing: 18) {
                SMSectionHeader(eyebrow: eyebrow, title, accent: accent, lede: "A place for how you met, what matters now, and the moments you do not want to forget.", size: 44)
                HStack(spacing: 12) {
                    Button("See TestFlight status") {}.buttonStyle(.smBrand)
                    Button("See the real app") {}.buttonStyle(.smLink)
                }
                SMCard {
                    HStack {
                        Text("pnpm test auth/session").font(SMType.mono(13).font(palette))
                        Spacer()
                        SMStatusPill("exit 1", tone: .danger)
                    }
                }
            }
            .padding(36)
            .frame(width: 560)
            .smTheme(palette)
            let renderer = ImageRenderer(content: view)
            renderer.scale = 2
            let image = try #require(renderer.nsImage)
            let rep = NSBitmapImageRep(data: try #require(image.tiffRepresentation))
            try #require(rep?.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: "\(dir)/\(name).png"))
        }
    }
}

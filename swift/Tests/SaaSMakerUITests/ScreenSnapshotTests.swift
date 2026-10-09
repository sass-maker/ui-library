import AppKit
import SwiftUI
import Testing
@testable import SaaSMakerUI

/// Renders whole app screens built only from the package (a Gallery screen and
/// a dashboard) to PNG when SM_SNAPSHOT_DIR is set, for visual review.
@Suite struct ScreenSnapshotTests {
    private static func fixture(_ name: String) -> Image? {
        guard let url = Bundle.module.url(forResource: name, withExtension: nil, subdirectory: "Fixtures"),
              let image = NSImage(contentsOf: url) else { return nil }
        return Image(nsImage: image)
    }

    @MainActor @Test func galleryScreen() throws {
        guard let dir = ProcessInfo.processInfo.environment["SM_SNAPSHOT_DIR"] else { return }
        let screen = Self.fixture("constellation.webp") ?? Image(systemName: "person.3")
        let aspect: CGFloat = 603 / 1311
        let view = VStack(spacing: 0) {
            SMHero(
                eyebrow: "Kith for iPhone",
                "Remember the people you want to stay",
                accent: "close to.",
                lede: "A place for how you met, what matters now, and the dated moments you do not want to forget.",
                note: "Internal TestFlight only.",
                screen: screen,
                screenLabel: Text("Kith on iPhone showing a constellation of people"),
                aspectRatio: aspect,
                backdrop: Self.fixture("book-stage.jpg"),
                deviceWidth: 250,
                titleSize: 46
            ) {
                Button("See TestFlight status") {}.buttonStyle(.smBrand)
                Button("The real app ›") {}.buttonStyle(.smLink)
            }
            SMShowcase(
                eyebrow: "Constellation",
                "See closeness the way",
                accent: "you chose it.",
                lede: "Every person becomes a warm lantern, sized only by the closeness you set.",
                screen: screen,
                aspectRatio: aspect,
                captionLead: "The real home screen, at the size of a room.",
                caption: "A searchable list stays one tap away.",
                note: "Kith · iPhone · actual screen",
                deviceWidth: 330,
                plateHeight: 500,
                titleSize: 38
            )
            VStack(spacing: 44) {
                SMSectionHeader(eyebrow: "Useful before sign-in", "The iPhone stays", accent: "the working copy.", lede: "Edits save on your iPhone first, so Kith works offline.", alignment: .center, size: 38)
                SMStatementRows([
                    SMStatementRow("iPhone", body: "The full document. People, closeness, search and notes all work here.", status: "Always", on: true),
                    SMStatementRow("iCloud", body: "A private CloudKit mirror during the sync transition.", status: "Private"),
                    SMStatementRow("Hub", body: "Person fields and dated notes, only if you connect an account.", status: "Optional", on: true),
                ])
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 96)
            SMCover(
                eyebrow: "Begin",
                "Start with one real person,",
                accent: "not an import.",
                lede: "A name, their circle and one thing worth remembering.",
                image: Self.fixture("coastal-walk-v2.webp"),
                credit: "Illustrative artwork",
                height: 560,
                titleSize: 38
            )
        }
        .frame(width: 430)
        .smTheme(.gallery)
        // ImageRenderer draws shadows the right way up (cacheDisplay flips them);
        // this screen has no AppKit-backed views, so it does not need a window.
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2
        let image = try #require(renderer.nsImage)
        let rep = NSBitmapImageRep(data: try #require(image.tiffRepresentation))
        try #require(rep?.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: "\(dir)/gallery-screen.png"))
    }

    @MainActor @Test func dashboardScreen() throws {
        guard let dir = ProcessInfo.processInfo.environment["SM_SNAPSHOT_DIR"] else { return }
        let palette = SMPalette.ink.brand(Color(red: 0.506, green: 0.549, blue: 0.973))
        let days: [SMUptimeStrip.Day] = (0..<60).map { i in i == 23 ? .degraded : i == 41 ? .down : .up }
        let view = SMAppShell(
            brand: "Signal",
            sections: [
                SMNavSection(items: [
                    SMNavItem("Overview", systemImage: "square.grid.2x2"),
                    SMNavItem("Events", systemImage: "waveform.path.ecg", count: 12),
                    SMNavItem("Monitors", systemImage: "dot.radiowaves.left.and.right", count: 3),
                ]),
                SMNavSection("Workspace", items: [
                    SMNavItem("Projects", systemImage: "folder"),
                    SMNavItem("Settings", systemImage: "gearshape"),
                ]),
            ],
            selection: .constant("Overview"),
            user: ("Sample User", "Illustrative workspace")
        ) {
            SMPage("Overview", description: "Last 14 days. Illustrative numbers, not real data.") {
                SMStatusPill("illustrative", tone: .warning)
            } content: {
                VStack(alignment: .leading, spacing: 20) {
                    HStack(spacing: 16) {
                        SMStatCard("Requests", value: "48.2k", delta: SMDelta("12%", .up), trend: [31, 34, 33, 38, 36, 41, 40, 44, 43, 48])
                        SMStatCard("p95 latency", value: "182 ms", delta: SMDelta("8%", .down, good: true), trend: [240, 236, 228, 230, 214, 205, 210, 196, 188, 182])
                        SMStatCard("Error rate", value: "0.41%", delta: SMDelta("0.1 pt", .flat), trend: [0.5, 0.42, 0.46, 0.38, 0.44, 0.4, 0.43, 0.39, 0.42, 0.41])
                    }
                    SMCard(padding: 24) {
                        VStack(alignment: .leading, spacing: 20) {
                            HStack(alignment: .firstTextBaseline) {
                                Text("Traffic").font(.custom(palette.displayFont, size: 17).weight(.semibold))
                                Spacer()
                                Text("illustrative").font(SMType.mono(11).font(palette)).foregroundStyle(palette.mutedForeground)
                            }
                            SMAreaChart([
                                SMChartSeries("Requests", values: [3100, 3400, 3300, 3900, 3700, 4200, 4100, 4500, 4300, 4900, 4700, 5200, 5000, 5400]),
                                SMChartSeries("Last period", values: [2900, 3000, 3200, 3100, 3300, 3500, 3400, 3600, 3500, 3800, 3700, 3900, 4000, 4100]),
                            ], labels: (1...14).map { "Oct \($0)" }, height: 200)
                        }
                    }
                    SMCard(padding: 24) {
                        VStack(alignment: .leading, spacing: 22) {
                            Text("Uptime").font(.custom(palette.displayFont, size: 17).weight(.semibold))
                            SMUptimeStrip("api.example.com", days: days, summary: "99.93% · illustrative")
                            SMUptimeStrip("app.example.com", days: Array(repeating: .up, count: 60), summary: "100% · illustrative")
                        }
                    }
                }
            }
        }
        .smTheme(palette)
        try Self.render(view, size: CGSize(width: 1280, height: 860), to: "\(dir)/dashboard-screen.png")
    }

    /// Renders through a real NSHostingView in an offscreen window so AppKit-backed
    /// views (NavigationSplitView, ScrollView) draw. Height 0 means "fit the content".
    /// cacheDisplay flips shadow offsets and leaves hairlines beside capsule
    /// strokes, so screens rendered this way avoid relying on either.
    @MainActor static func render(_ view: some View, size: CGSize, to path: String) throws {
        _ = NSApplication.shared
        let host = NSHostingView(rootView: view)
        var frame = CGRect(origin: .zero, size: size)
        if size.height == 0 {
            host.frame = CGRect(x: 0, y: 0, width: size.width, height: 100)
            frame.size.height = host.fittingSize.height
        }
        let window = NSWindow(contentRect: frame, styleMask: [.borderless], backing: .buffered, defer: false)
        window.contentView = host
        host.frame = frame
        host.layoutSubtreeIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(0.6))
        host.layoutSubtreeIfNeeded()
        let rep = try #require(host.bitmapImageRepForCachingDisplay(in: host.bounds))
        host.cacheDisplay(in: host.bounds, to: rep)
        try #require(rep.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: path))
    }
}

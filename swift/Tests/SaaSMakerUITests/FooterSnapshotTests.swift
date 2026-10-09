import AppKit
import SwiftUI
import Testing
@testable import SaaSMakerUI

/// Renders the studio footer and its feedback form to PNG when SM_SNAPSHOT_DIR
/// is set, for visual review. The fake transport keeps them off the network.
@Suite struct FooterSnapshotTests {
    @MainActor @Test func footerScreens() throws {
        guard let dir = ProcessInfo.processInfo.environment["SM_SNAPSHOT_DIR"] else { return }
        let samples: [(String, SMPalette, SMCapture)] = [
            ("footer-gallery", .gallery, .newsletter),
            ("footer-ink", .ink.brand(Color(red: 0.95, green: 0.68, blue: 0.24)), .waitlist),
        ]
        for (name, palette, capture) in samples {
            let view = SMStudioFooter(
                product: "Kith",
                url: "https://kith.significanthobbies.com",
                summary: "A private place to remember the people you want to stay close to.",
                capture: capture,
                legal: "© 2026 Significant Hobbies",
                transport: FakeTransport()
            )
            .padding(24)
            .frame(width: 430, height: 880, alignment: .top)
            .smTheme(palette)
            try ScreenSnapshotTests.render(view, size: CGSize(width: 430, height: 880), to: "\(dir)/\(name).png")
        }
    }

    @MainActor @Test func feedbackSheet() throws {
        guard let dir = ProcessInfo.processInfo.environment["SM_SNAPSHOT_DIR"] else { return }
        let view = SMFeedbackForm(
            product: "Kith",
            screen: "about",
            client: SMFooterClient(transport: FakeTransport()),
            draft: SMFeedbackDraft(type: .feature, title: "Birthday reminders", description: "A gentle nudge the week before someone's birthday would help me reach out in time.")
        ) {}
        .frame(width: 500, height: 660)
        .smTheme(.gallery)
        try ScreenSnapshotTests.render(view, size: CGSize(width: 500, height: 660), to: "\(dir)/footer-feedback.png")
    }
}

import AppKit
import SwiftUI
import Testing
@testable import SaaSMakerUI

@MainActor @Suite(.serialized) struct SelectionTests {
    private final class SelectionModel: ObservableObject {
        @Published var value = "today"
    }

    private struct InteractiveSample: View {
        @ObservedObject var model: SelectionModel
        var disabled = false
        var laterEnabled = false
        var disabledChoiceEnabled = false
        var body: some View {
            VStack(spacing: 16) {
                SMSegmentedControl("When to follow up", selection: $model.value, segments: [
                    SMSegment("today", title: "Today", systemImage: "sun.max"),
                    SMSegment("week", title: "This week", systemImage: "calendar"),
                    SMSegment("later", title: "Later", isEnabled: laterEnabled),
                ])
                SMChoiceCard("A quiet reminder", value: "reminder", selection: $model.value,
                             description: "Choose when to reconnect.", systemImage: "bell",
                             detail: "The reminder stays in your list until you decide to reach out.")
                SMChoiceCard("Disabled choice", value: "disabled", selection: $model.value).disabled(!disabledChoiceEnabled)
            }
            .padding(24).frame(width: 390).frame(maxHeight: .infinity, alignment: .top).disabled(disabled).smTheme(.gallery)
        }
    }

    // Window focus and RunLoop pumping must run apart from bitmap comparisons.
    @Test(.enabled(if: ProcessInfo.processInfo.environment["SM_NATIVE_MOUSE_TESTS"] == "1"))
    func nativeMouseActivationAndExternalSelection() throws {
        _ = NSApplication.shared
        let model = SelectionModel()
        let host = NSHostingView(rootView: InteractiveSample(model: model))
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 390, height: 600), styleMask: [.borderless], backing: .buffered, defer: false)
        window.isReleasedWhenClosed = false
        window.contentView = host
        window.makeKeyAndOrderFront(nil)
        host.layoutSubtreeIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(0.1))
        defer { window.close() }
        func settle() {
            RunLoop.main.run(until: Date().addingTimeInterval(0.4))
            host.layoutSubtreeIfNeeded()
        }
        func click(_ x: CGFloat, top: CGFloat) throws {
            for type: NSEvent.EventType in [.leftMouseDown, .leftMouseUp] {
                let event = try #require(NSEvent.mouseEvent(with: type, location: NSPoint(x: x, y: 600 - top), modifierFlags: [], timestamp: ProcessInfo.processInfo.systemUptime, windowNumber: window.windowNumber, context: nil, eventNumber: 0, clickCount: 1, pressure: 1))
                window.sendEvent(event)
            }
            settle()
        }
        func rendered() throws -> Data {
            let image = try #require(host.bitmapImageRepForCachingDisplay(in: host.bounds))
            host.cacheDisplay(in: host.bounds, to: image)
            return try #require(image.representation(using: .png, properties: [:]))
        }
        try click(195, top: 51)
        #expect(model.value == "week")
        try click(325, top: 51)
        #expect(model.value == "week")
        host.rootView = InteractiveSample(model: model, laterEnabled: true)
        settle()
        try click(325, top: 51)
        #expect(model.value == "later")
        host.rootView = InteractiveSample(model: model)
        model.value = "week"
        settle()
        try click(180, top: 230)
        #expect(model.value == "week")
        host.rootView = InteractiveSample(model: model, disabledChoiceEnabled: true)
        settle()
        try click(180, top: 230)
        #expect(model.value == "disabled")
        host.rootView = InteractiveSample(model: model)
        settle()
        try click(180, top: 134)
        #expect(model.value == "reminder")
        let selectedCard = try rendered()
        model.value = "today"
        settle()
        #expect(try rendered() != selectedCard)
        #expect(model.value == "today")
        host.rootView = InteractiveSample(model: model, disabled: true)
        settle()
        try click(195, top: 51)
        #expect(model.value == "today")
        try click(180, top: 134)
        #expect(model.value == "today")
    }

    private func bitmap<V: View>(_ view: V) throws -> NSBitmapImageRep {
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2
        let image = try #require(renderer.nsImage)
        let data = try #require(image.tiffRepresentation)
        return try #require(NSBitmapImageRep(data: data))
    }

    @Test func selectedDetailAndLargeTypeGrowWithoutClipping() throws {
        func card(_ selected: Bool, large: Bool = false) -> some View {
            SMChoiceCard("Keep the next conversation in mind", value: "reminder", selection: .constant(selected ? "reminder" : "other"),
                         description: "A little context makes it easier to reach out again.", systemImage: "bubble.left.and.bubble.right",
                         detail: "Add a note about what matters now. You decide when a reminder is useful.")
                .frame(width: 342)
                .environment(\.dynamicTypeSize, large ? .accessibility3 : .large)
                .smTheme(.gallery)
        }
        let resting = try bitmap(card(false))
        let selected = try bitmap(card(true))
        let large = try bitmap(card(true, large: true))
        #expect(resting.pixelsWide == 684)
        #expect(selected.pixelsHigh > resting.pixelsHigh)
        #expect(large.pixelsHigh >= selected.pixelsHigh)
        #expect(large.pixelsWide == selected.pixelsWide)
    }

    @Test func longSegmentsFallbackAndMissingSelectionDoesNotMutate() throws {
        var selection = "missing"
        let binding = Binding(get: { selection }, set: { selection = $0 })
        let segments = [SMSegment("one", title: "People to reconnect with"), SMSegment("two", title: "Reminders for a quieter week")]
        let narrow = try bitmap(SMSegmentedControl("Follow up", selection: binding, segments: segments).frame(width: 220).smTheme(.gallery))
        let wide = try bitmap(SMSegmentedControl("Follow up", selection: binding, segments: segments).frame(width: 820).smTheme(.gallery))
        #expect(narrow.pixelsHigh > wide.pixelsHigh)
        #expect(narrow.pixelsWide == 440)
        #expect(selection == "missing")
        let empty = try bitmap(SMSegmentedControl("Empty", selection: binding, segments: []).frame(width: 220).smTheme(.gallery))
        #expect(empty.pixelsWide == 440)
        #expect(selection == "missing")
    }

    @Test func renderInteractionExamples() throws {
        guard let directory = ProcessInfo.processInfo.environment["SM_INTERACTION_SNAPSHOT_DIR"] else { return }
        try FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)
        for width: CGFloat in [390, 820, 1440] {
            for dark in [false, true] {
                let name = "selection-\(Int(width))-\(dark ? "dark" : "light")"
                let image = try bitmap(SelectionSnapshot().padding(24).frame(width: width).smTheme(dark ? .galleryDark : .gallery))
                #expect(image.pixelsWide == Int(width * 2))
                try #require(image.representation(using: .png, properties: [:]))
                    .write(to: URL(fileURLWithPath: "\(directory)/\(name).png"))
            }
        }
        for (name, large, rtl, disabled) in [("large-text", true, false, false), ("rtl", false, true, false), ("disabled", false, false, true)] {
            let image = try bitmap(SelectionSnapshot().padding(24).frame(width: 390)
                .environment(\.dynamicTypeSize, large ? .accessibility3 : .large)
                .environment(\.layoutDirection, rtl ? .rightToLeft : .leftToRight)
                .disabled(disabled).smTheme(.galleryDark))
            try #require(image.representation(using: .png, properties: [:]))
                .write(to: URL(fileURLWithPath: "\(directory)/selection-\(name).png"))
        }
    }

    private struct SelectionSnapshot: View {
        @State private var timing = "week"
        @State private var intention = "note"

        var body: some View {
            VStack(alignment: .leading, spacing: 24) {
                SMSectionHeader(eyebrow: "Kith", "Make room for", accent: "the next conversation.",
                                lede: "Keep a little context. Reach out when it feels right.", size: 34)
                VStack(alignment: .leading, spacing: 10) {
                    Text("When to follow up").font(.headline)
                    SMSegmentedControl("When to follow up", selection: $timing, segments: [
                        SMSegment("today", title: "Today", systemImage: "sun.max"),
                        SMSegment("week", title: "This week", systemImage: "calendar"),
                        SMSegment("later", title: "Later", systemImage: "clock"),
                    ])
                }
                VStack(spacing: 12) {
                    SMChoiceCard("Keep a note", value: "note", selection: $intention,
                                 description: "Remember what matters to them.", systemImage: "text.bubble",
                                 detail: "A name, a shared moment, a detail from your last conversation. Keep only what helps you reconnect.")
                    SMChoiceCard("Set a reminder", value: "reminder", selection: $intention,
                                 description: "Leave yourself a gentle nudge.", systemImage: "bell",
                                 detail: "Pick a time that gives the conversation room to breathe.")
                }
                Text("Choose a follow-up time and what you want to remember.").font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 560)
            .frame(maxWidth: .infinity)
        }
    }
}

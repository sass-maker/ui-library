import SwiftUI

private struct SMSelectionPreview: View {
    @State private var period = "today"
    @State private var choice = "note"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                SMSectionHeader(eyebrow: "Kith", "Leave room to", accent: "reconnect.", size: 34)
                SMSegmentedControl("Follow-up timing", selection: $period, segments: [
                    SMSegment("today", title: "Today", systemImage: "sun.max"),
                    SMSegment("week", title: "This week", systemImage: "calendar"),
                    SMSegment("later", title: "Later", systemImage: "clock"),
                ])
                SMChoiceCard("Keep a note", value: "note", selection: $choice,
                             description: "Remember what matters to them.", systemImage: "text.bubble",
                             detail: "A shared moment or a detail from your last conversation can make it easier to reach out.")
                SMChoiceCard("Set a reminder", value: "reminder", selection: $choice,
                             description: "Leave yourself a gentle nudge.", systemImage: "bell",
                             detail: "Choose a time that gives the conversation room to breathe.")
            }
            .padding(24)
            .frame(maxWidth: 560)
            .frame(maxWidth: .infinity)
        }
    }
}

#Preview("Selection · light") {
    SMSelectionPreview().frame(width: 390, height: 740).smTheme(.gallery)
}

#Preview("Selection · dark") {
    SMSelectionPreview().frame(width: 390, height: 740).smTheme(.galleryDark)
}

#Preview("Selection · larger text") {
    SMSelectionPreview().frame(width: 390, height: 900)
        .environment(\.dynamicTypeSize, .accessibility3).smTheme(.gallery)
}

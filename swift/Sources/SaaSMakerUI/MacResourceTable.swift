#if os(macOS)
import SwiftUI

/// A compact native inventory with sortable name, group, and measurement columns.
/// Use one comparable unit per measurement column. Formatting belongs to the app.
public struct SMMacResourceTable<Item: Identifiable, Measurement: Comparable>: View {
    private let items: [Item]
    private let name: KeyPath<Item, String> & Sendable
    private let group: KeyPath<Item, String> & Sendable
    private let measurement: KeyPath<Item, Measurement> & Sendable
    private let groupTitle: String
    private let measurementTitle: String
    private let format: (Measurement) -> String
    @Binding private var selection: Set<Item.ID>
    @State private var sortOrder: [KeyPathComparator<Item>]

    public init(_ items: [Item], selection: Binding<Set<Item.ID>>,
                name: KeyPath<Item, String> & Sendable, group: KeyPath<Item, String> & Sendable,
                groupTitle: String, measurement: KeyPath<Item, Measurement> & Sendable,
                measurementTitle: String, format: @escaping (Measurement) -> String) {
        self.items = items
        self._selection = selection
        self.name = name
        self.group = group
        self.groupTitle = groupTitle
        self.measurement = measurement
        self.measurementTitle = measurementTitle
        self.format = format
        self._sortOrder = State(initialValue: [KeyPathComparator(measurement, order: .reverse)])
    }

    public var body: some View {
        Table(items.sorted(using: sortOrder), selection: $selection, sortOrder: $sortOrder) {
            TableColumn("Name", value: name)
            TableColumn(groupTitle, value: group)
            TableColumn(measurementTitle, value: measurement) { item in
                Text(format(item[keyPath: measurement]))
                    .monospacedDigit()
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
        }
        .controlSize(.small)
    }
}
#endif

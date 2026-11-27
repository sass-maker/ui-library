#if os(macOS)
import SwiftUI

/// A compact leaf in a hierarchical sidebar. The host owns routing and selection.
public struct SMSidebarTool: View {
    @Environment(\.smPalette) private var palette
    @Environment(\.isEnabled) private var enabled
    @State private var hovered = false
    @FocusState private var focused: Bool
    private let title: String
    private let selected: Bool
    private let action: () -> Void

    public init(_ title: String, selected: Bool, action: @escaping () -> Void) {
        self.title = title
        self.selected = selected
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(title)
                .font(.callout.weight(selected ? .medium : .regular))
                .foregroundStyle(selected ? palette.foreground : palette.mutedForeground)
                .lineLimit(1)
                .padding(.horizontal, 10)
                .frame(maxWidth: .infinity, minHeight: 28, alignment: .leading)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .focused($focused)
        .background(selected ? palette.brandSoft : palette.foreground.opacity(hovered && enabled ? 0.06 : 0),
                    in: RoundedRectangle(cornerRadius: 6))
        .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(focused ? palette.brand : .clear, lineWidth: 2)
            .allowsHitTesting(false))
        .onHover { hovered = $0 }
        .opacity(enabled ? 1 : 0.45)
        .accessibilityAddTraits(selected ? .isSelected : [])
        .help(title)
    }
}
#endif

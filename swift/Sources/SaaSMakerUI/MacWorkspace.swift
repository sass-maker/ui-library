#if os(macOS)
import SwiftUI

/// Compact desktop actions. Native Button retains keyboard and accessibility behavior.
public struct SMMacButtonStyle: ButtonStyle {
    public enum Kind { case primary, secondary, quiet }
    @Environment(\.smPalette) private var p
    @Environment(\.isEnabled) private var enabled
    @Environment(\.isFocused) private var focused
    private let kind: Kind

    public init(_ kind: Kind = .secondary) { self.kind = kind }

    public func makeBody(configuration: Configuration) -> some View {
        MacButtonBody(label: configuration.label, kind: kind, pressed: configuration.isPressed,
                      enabled: enabled, focused: focused, palette: p)
    }
}

private struct MacButtonBody<Label: View>: View {
    let label: Label
    let kind: SMMacButtonStyle.Kind
    let pressed: Bool
    let enabled: Bool
    let focused: Bool
    let palette: SMPalette
    @State private var hovering = false

    var body: some View {
        label
            .font(.custom(palette.sansFont, size: 13).weight(.medium))
            .padding(.horizontal, 12)
            .frame(minHeight: 32)
            .foregroundStyle(kind == .primary ? palette.brandForeground : palette.foreground)
            .background(fill, in: RoundedRectangle(cornerRadius: 7))
            .overlay(RoundedRectangle(cornerRadius: 7)
                .strokeBorder(kind == .secondary ? palette.border : .clear))
            .overlay(RoundedRectangle(cornerRadius: 9)
                .strokeBorder(focused ? palette.brand : .clear, lineWidth: 2).padding(-3))
            .contentShape(RoundedRectangle(cornerRadius: 7))
            .opacity(enabled ? (pressed ? 0.72 : 1) : 0.4)
            .onHover { hovering = $0 }
    }

    private var fill: Color {
        if kind == .primary { return palette.brand }
        if hovering && enabled { return palette.foreground.opacity(0.08) }
        return kind == .secondary ? palette.surface : .clear
    }
}

/// A desktop heading with one consistent title, description and action rhythm.
public struct SMWorkspaceHeader<Actions: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let subtitle: String?
    private let actions: Actions

    public init(_ title: String, subtitle: String? = nil, @ViewBuilder actions: () -> Actions) {
        self.title = title; self.subtitle = subtitle; self.actions = actions()
    }

    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .center, spacing: 24) {
                heading
                Spacer(minLength: 24)
                actions.fixedSize(horizontal: true, vertical: false)
            }
            VStack(alignment: .leading, spacing: 16) { heading; actions }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var heading: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.custom(p.displayFont, size: 26).weight(.semibold))
                .tracking(-0.5).foregroundStyle(p.foreground).accessibilityAddTraits(.isHeader)
            if let subtitle {
                Text(subtitle).font(.custom(p.sansFont, size: 13))
                    .foregroundStyle(p.mutedForeground).fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

/// Native editable search with a visible focus boundary and a labelled clear action.
public struct SMSearchField: View {
    @Environment(\.smPalette) private var p
    @Environment(\.isEnabled) private var enabled
    @FocusState private var localFocus: Bool
    @Binding private var text: String
    private let prompt: String
    private let accessibilityLabel: String
    private let focus: FocusState<Bool>.Binding?
    private let submit: () -> Void

    public init(_ prompt: String, text: Binding<String>, focus: FocusState<Bool>.Binding? = nil,
                accessibilityLabel: String? = nil, onSubmit: @escaping () -> Void = {}) {
        self.prompt = prompt; self._text = text; self.focus = focus; self.submit = onSubmit
        self.accessibilityLabel = accessibilityLabel ?? prompt
    }

    public var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(p.mutedForeground).accessibilityHidden(true)
            ZStack(alignment: .leading) {
                if text.isEmpty {
                    Text(prompt).foregroundStyle(p.mutedForeground)
                        .allowsHitTesting(false).accessibilityHidden(true)
                }
                TextField("", text: $text)
                    .textFieldStyle(.plain).focused(focus ?? $localFocus)
                    .accessibilityLabel(accessibilityLabel).onSubmit(submit)
                    .onExitCommand {
                        if text.isEmpty { (focus ?? $localFocus).wrappedValue = false }
                        else { text = "" }
                    }
            }
            if !text.isEmpty {
                Button { text = ""; (focus ?? $localFocus).wrappedValue = true } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(p.mutedForeground)
                        .frame(width: 24, height: 24).contentShape(Rectangle())
                }
                .buttonStyle(.plain).accessibilityLabel("Clear search").help("Clear search")
            }
        }
        .font(.custom(p.sansFont, size: 13))
        .foregroundStyle(p.foreground)
        .padding(.leading, 10).padding(.trailing, text.isEmpty ? 10 : 4)
        .frame(minHeight: 34)
        .background(p.surface, in: RoundedRectangle(cornerRadius: 7))
        .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(
            (focus ?? $localFocus).wrappedValue ? p.brand : p.border,
            lineWidth: (focus ?? $localFocus).wrappedValue ? 2 : 1))
        .opacity(enabled ? 1 : 0.4)
    }
}

/// A quiet inset group. The caller owns row separators and product-specific content.
public struct SMSettingsGroup<Content: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String?
    private let footer: String?
    private let content: Content

    public init(_ title: String? = nil, footer: String? = nil, @ViewBuilder content: () -> Content) {
        self.title = title; self.footer = footer; self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let title {
                Text(title).font(.custom(p.sansFont, size: 13).weight(.semibold))
                    .foregroundStyle(p.foreground).accessibilityAddTraits(.isHeader)
            }
            VStack(alignment: .leading, spacing: 0) { content }
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(p.card, in: RoundedRectangle(cornerRadius: 10))
                .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(p.border))
            if let footer {
                Text(footer).font(.custom(p.sansFont, size: 12)).foregroundStyle(p.mutedForeground)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

/// Label and supporting copy stay together; controls reflow beneath at narrow widths.
public struct SMSettingsRow<Control: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let subtitle: String?
    private let control: Control

    public init(_ title: String, subtitle: String? = nil, @ViewBuilder control: () -> Control) {
        self.title = title; self.subtitle = subtitle; self.control = control()
    }

    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .center, spacing: 24) {
                label
                Spacer(minLength: 16)
                control.fixedSize(horizontal: true, vertical: false)
            }
            VStack(alignment: .leading, spacing: 12) { label; control }
        }
        .padding(16)
        .foregroundStyle(p.foreground)
    }

    private var label: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.custom(p.sansFont, size: 13).weight(.medium))
            if let subtitle {
                Text(subtitle).font(.custom(p.sansFont, size: 12)).foregroundStyle(p.mutedForeground)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

/// A file or folder row with a stable icon column and caller-owned selection and actions.
public struct SMResourceRow<Leading: View, Trailing: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let subtitle: String
    private let systemImage: String
    private let leading: Leading
    private let trailing: Trailing

    public init(_ title: String, subtitle: String, systemImage: String,
                @ViewBuilder leading: () -> Leading, @ViewBuilder trailing: () -> Trailing) {
        self.title = title; self.subtitle = subtitle; self.systemImage = systemImage
        self.leading = leading(); self.trailing = trailing()
    }

    public var body: some View {
        HStack(spacing: 12) {
            leading
            Image(systemName: systemImage)
                .font(.system(size: 19, weight: .regular)).foregroundStyle(p.brand)
                .frame(width: 28).accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 5) {
                Text(title).font(.custom(p.sansFont, size: 14).weight(.medium))
                    .lineLimit(1).truncationMode(.middle).help(title)
                Text(subtitle).font(.custom(p.sansFont, size: 12)).foregroundStyle(p.mutedForeground)
                    .lineLimit(1).truncationMode(.middle).help(subtitle)
            }
            Spacer(minLength: 16)
            trailing.fixedSize(horizontal: true, vertical: false)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
        .foregroundStyle(p.foreground)
        .accessibilityElement(children: .contain)
    }
}

/// Persistent selection feedback and actions, with a stacked fallback for narrow windows.
public struct SMSelectionBar<Actions: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let detail: String?
    private let horizontalPadding: CGFloat
    private let actions: Actions

    public init(_ title: String, detail: String? = nil, horizontalPadding: CGFloat = 24,
                @ViewBuilder actions: () -> Actions) {
        self.title = title; self.detail = detail; self.horizontalPadding = horizontalPadding
        self.actions = actions()
    }

    public var body: some View {
        VStack(spacing: 0) {
            Rectangle().fill(p.border).frame(height: 1).accessibilityHidden(true)
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 24) { summary; Spacer(minLength: 16); actions.fixedSize() }
                VStack(alignment: .leading, spacing: 12) { summary; actions }
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, horizontalPadding).padding(.vertical, 16)
        }
        .background(p.background)
    }

    private var summary: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.custom(p.sansFont, size: 13).weight(.medium))
                .monospacedDigit().foregroundStyle(p.foreground)
            if let detail {
                Text(detail).font(.custom(p.sansFont, size: 11)).foregroundStyle(p.mutedForeground)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}
#endif

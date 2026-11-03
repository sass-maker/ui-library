import SwiftUI

/// A stable selection identity. Titles may change or repeat without changing selection.
public struct SMSegment<Value: Hashable>: Identifiable {
    public let id: Value
    public var title: String
    public var systemImage: String?
    public var isEnabled: Bool

    public init(_ id: Value, title: String, systemImage: String? = nil, isEnabled: Bool = true) {
        self.id = id
        self.title = title
        self.systemImage = systemImage
        self.isEnabled = isEnabled
    }
}

/// A shared selection surface with a continuous, interruptible active indicator.
/// Values must be unique. An absent selection remains absent until the caller chooses one.
public struct SMSegmentedControl<Value: Hashable>: View {
    @Environment(\.smPalette) private var p
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Namespace private var indicator
    @Binding private var selection: Value
    private let title: String
    private let segments: [SMSegment<Value>]

    public init(_ title: String, selection: Binding<Value>, segments: [SMSegment<Value>]) {
        self.title = title
        self._selection = selection
        self.segments = segments
    }

    public var body: some View {
        Group {
            if dynamicTypeSize.isAccessibilitySize {
                column
            } else {
                ViewThatFits(in: .horizontal) {
                    row
                    column
                }
            }
        }
        .padding(5)
        .background(p.surface, in: .rect(cornerRadius: p.radius + 7))
        .overlay(RoundedRectangle(cornerRadius: p.radius + 7).strokeBorder(p.hairline))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(title)
        .animation(reduceMotion ? nil : SMMotion.state, value: selection)
    }

    private var row: some View {
        HStack(spacing: 4) {
            ForEach(segments) { segment in
                segmentButton(segment, horizontal: true)
            }
        }
    }

    private var column: some View {
        VStack(spacing: 4) {
            ForEach(segments) { segment in
                segmentButton(segment, horizontal: false)
            }
        }
    }

    private func segmentButton(_ segment: SMSegment<Value>, horizontal: Bool) -> some View {
        let selected = segment.id == selection
        return Button {
            if selection != segment.id { selection = segment.id }
        } label: {
            HStack(spacing: 7) {
                if let systemImage = segment.systemImage {
                    Image(systemName: systemImage).accessibilityHidden(true)
                }
                Text(segment.title)
                    .fixedSize(horizontal: horizontal, vertical: true)
                if !horizontal { Spacer(minLength: 0) }
                if !horizontal && selected {
                    Image(systemName: "checkmark").accessibilityHidden(true)
                }
            }
            .font(.custom(p.sansFont, size: 14, relativeTo: .subheadline).weight(selected ? .semibold : .medium))
            .foregroundStyle(selected ? p.foreground : p.mutedForeground)
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .frame(maxWidth: .infinity, minHeight: 44)
            .background {
                if selected {
                    RoundedRectangle(cornerRadius: p.radius + 2)
                        .fill(p.card)
                        .overlay(alignment: .bottom) {
                            Capsule().fill(p.brand).frame(width: 18, height: 2).padding(.bottom, 4)
                        }
                        .overlay(RoundedRectangle(cornerRadius: p.radius + 2).strokeBorder(p.border.opacity(0.65)))
                        .shadow(color: .black.opacity(p.isDark ? 0.18 : 0.06), radius: 3, y: 2)
                        .matchedGeometryEffect(id: horizontal ? "row" : "column", in: indicator)
                }
            }
            .contentShape(.rect(cornerRadius: p.radius + 2))
        }
        .buttonStyle(SMSelectionButtonStyle())
        .disabled(!segment.isEnabled)
        .opacity(isEnabled && segment.isEnabled ? 1 : 0.5)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}

/// A selectable card. The caller owns selection; selected detail is separate from the button.
public struct SMChoiceCard<Value: Hashable>: View {
    @Environment(\.smPalette) private var p
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Binding private var selection: Value
    private let title: String
    private let value: Value
    private let description: String?
    private let systemImage: String?
    private let detail: String?

    public init(_ title: String, value: Value, selection: Binding<Value>, description: String? = nil,
                systemImage: String? = nil, detail: String? = nil) {
        self.title = title
        self.value = value
        self._selection = selection
        self.description = description
        self.systemImage = systemImage
        self.detail = detail
    }

    private var selected: Bool { selection == value }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                if selection != value { selection = value }
            } label: {
                HStack(alignment: .top, spacing: 14) {
                    if let systemImage {
                        Image(systemName: systemImage)
                            .font(.system(size: 19, weight: .medium))
                            .foregroundStyle(selected ? p.brand : p.mutedForeground)
                            .frame(width: 44, height: 44)
                            .background(selected ? p.brandSoft : p.surface, in: .rect(cornerRadius: p.radius))
                            .overlay(RoundedRectangle(cornerRadius: p.radius).strokeBorder(p.hairline))
                            .accessibilityHidden(true)
                    }
                    VStack(alignment: .leading, spacing: 5) {
                        Text(title)
                            .font(.custom(p.displayFont, size: 17, relativeTo: .headline).weight(.semibold))
                            .foregroundStyle(p.foreground)
                        if let description {
                            Text(description)
                                .font(.custom(p.sansFont, size: 14, relativeTo: .subheadline))
                                .foregroundStyle(p.mutedForeground)
                                .lineSpacing(2)
                        }
                    }
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    ZStack {
                        Circle().strokeBorder(selected ? p.brand : p.border, lineWidth: selected ? 0 : 1.5)
                        if selected {
                            Circle().fill(p.brand)
                            Image(systemName: "checkmark")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundStyle(p.brandForeground)
                        }
                    }
                    .frame(width: 22, height: 22)
                    .padding(.top, 2)
                    .accessibilityHidden(true)
                }
                .padding(18)
                .frame(maxWidth: .infinity, minHeight: 80, alignment: .leading)
                .contentShape(.rect(cornerRadius: p.radius + 6))
            }
            .buttonStyle(SMSelectionButtonStyle())
            .accessibilityAddTraits(selected ? .isSelected : [])

            if selected, let detail {
                VStack(alignment: .leading, spacing: 12) {
                    Rectangle().fill(p.border.opacity(0.7)).frame(height: 1)
                    Text(detail)
                        .font(.custom(p.sansFont, size: 14, relativeTo: .subheadline))
                        .foregroundStyle(p.mutedForeground)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineSpacing(3)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 18)
                .transition(reduceMotion ? .identity : .opacity.combined(with: .offset(y: -4)))
            }
        }
        .background {
            RoundedRectangle(cornerRadius: p.radius + 6)
                .fill(p.card)
                .overlay {
                    if selected {
                        LinearGradient(colors: [p.brandSoft.opacity(0.6), .clear], startPoint: .topLeading, endPoint: .bottomTrailing)
                            .clipShape(.rect(cornerRadius: p.radius + 6))
                    }
                }
        }
        .overlay(RoundedRectangle(cornerRadius: p.radius + 6).strokeBorder(selected ? p.brand.opacity(0.65) : p.border))
        .opacity(isEnabled ? 1 : 0.5)
        .animation(reduceMotion ? nil : SMMotion.state, value: selected)
    }
}

private struct SMSelectionButtonStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.8 : 1)
            .scaleEffect(!reduceMotion && configuration.isPressed ? 0.985 : 1)
            .animation(reduceMotion ? nil : SMMotion.press, value: configuration.isPressed)
    }
}

import SwiftUI

/// Keeps actions at their natural widths and wraps them in source order as space narrows.
public struct SMAdaptiveActionBar<Content: View>: View {
    private let spacing: CGFloat
    private let content: Content

    public init(spacing: CGFloat = 8, @ViewBuilder content: () -> Content) {
        self.spacing = spacing
        self.content = content()
    }

    public var body: some View {
        SMFlow(spacing: spacing, lineSpacing: spacing, constrainsWideItems: true) { content }
    }
}

/// Wraps children onto new lines when the row is full.
struct SMFlow: Layout {
    var spacing: CGFloat
    var lineSpacing: CGFloat
    var constrainsWideItems = false

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(width: proposal.width ?? .infinity, subviews: subviews)
        let width = rows.map(\.width).max() ?? 0
        let height = rows.map(\.height).reduce(0, +) + lineSpacing * CGFloat(max(rows.count - 1, 0))
        let available = proposal.width.flatMap { $0.isFinite ? $0 : nil }
        return CGSize(width: available ?? width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in arrange(width: bounds.width, subviews: subviews) {
            var x = bounds.minX
            for i in row.items {
                let itemProposal = self.proposal(for: subviews[i], width: bounds.width)
                let size = subviews[i].sizeThatFits(itemProposal)
                subviews[i].place(at: CGPoint(x: x, y: y + (row.height - size.height) / 2), proposal: itemProposal)
                x += size.width + spacing
            }
            y += row.height + lineSpacing
        }
    }

    private func proposal(for item: LayoutSubview, width: CGFloat) -> ProposedViewSize {
        guard constrainsWideItems, width.isFinite, item.sizeThatFits(.unspecified).width > width else { return .unspecified }
        return ProposedViewSize(width: width, height: nil)
    }

    private struct Row { var items: [Int] = []; var width: CGFloat = 0; var height: CGFloat = 0 }

    private func arrange(width: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = [Row()]
        for i in subviews.indices {
            let size = subviews[i].sizeThatFits(proposal(for: subviews[i], width: width))
            let extra = rows[rows.count - 1].items.isEmpty ? size.width : rows[rows.count - 1].width + spacing + size.width
            if extra > width, !rows[rows.count - 1].items.isEmpty {
                rows.append(Row())
            }
            var row = rows[rows.count - 1]
            row.width = row.items.isEmpty ? size.width : row.width + spacing + size.width
            row.height = max(row.height, size.height)
            row.items.append(i)
            rows[rows.count - 1] = row
        }
        return rows.filter { !$0.items.isEmpty }
    }
}

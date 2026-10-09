import Charts
import SwiftUI

// Dashboard family: the internal-tool blocks from the web
// (packages/ui/src/blocks/app.tsx). Quiet cards, mono numerals for data,
// the brand color only on the line that matters.

// MARK: - Charts

/// A small trend line with a soft brand fill, like the web Sparkline. Decorative:
/// pair it with the number it illustrates.
public struct SMSparkline: View {
    @Environment(\.smPalette) private var p
    private let values: [Double]
    private let color: Color?
    private let height: CGFloat

    public init(_ values: [Double], color: Color? = nil, height: CGFloat = 32) {
        self.values = values
        self.color = color
        self.height = height
    }

    public var body: some View {
        let ink = color ?? p.brand
        let lo = values.min() ?? 0
        let hi = values.max() ?? 1
        let pad = max(hi - lo, 1) * 0.08
        Chart(Array(values.enumerated()), id: \.offset) { point in
            AreaMark(x: .value("Index", point.offset), yStart: .value("Floor", lo - pad), yEnd: .value("Value", point.element))
                .interpolationMethod(.monotone)
                .foregroundStyle(LinearGradient(colors: [ink.opacity(0.18), ink.opacity(0)], startPoint: .top, endPoint: .bottom))
            LineMark(x: .value("Index", point.offset), y: .value("Value", point.element))
                .interpolationMethod(.monotone)
                .foregroundStyle(ink)
                .lineStyle(StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round))
        }
        .chartXAxis(.hidden)
        .chartYAxis(.hidden)
        .chartLegend(.hidden)
        .chartXScale(domain: 0...max(values.count - 1, 1))
        .chartYScale(domain: (lo - pad)...(hi + pad))
        .frame(height: height)
        .accessibilityHidden(true)
    }
}

/// One line in an `SMAreaChart`.
public struct SMChartSeries: Identifiable, Sendable {
    public var id: String { name }
    public var name: String
    public var values: [Double]
    /// Line color; `nil` uses the brand for the first series and quiet ink for the rest.
    public var color: Color?

    public init(_ name: String, values: [Double], color: Color? = nil) {
        self.name = name
        self.values = values
        self.color = color
    }
}

/// Area chart with dashed gridlines, mono axis labels and a legend, like the
/// web AreaChart. `labels` name the x positions (one per value).
public struct SMAreaChart: View {
    @Environment(\.smPalette) private var p
    private let series: [SMChartSeries]
    private let labels: [String]
    private let height: CGFloat

    public init(_ series: [SMChartSeries], labels: [String], height: CGFloat = 220) {
        self.series = series
        self.labels = labels
        self.height = height
    }

    private func color(_ index: Int) -> Color {
        series[index].color ?? (index == 0 ? p.brand : p.foreground.opacity(0.42))
    }

    public var body: some View {
        let top = (series.flatMap(\.values).max() ?? 1) * 1.15
        let count = series.map(\.values.count).max() ?? 0
        let every = max(1, Int((Double(labels.count) / 6).rounded(.up)))
        VStack(alignment: .leading, spacing: 14) {
            Chart {
                ForEach(Array(series.enumerated()), id: \.element.id) { si, s in
                    ForEach(Array(s.values.enumerated()), id: \.offset) { i, v in
                        AreaMark(x: .value("Position", i), yStart: .value("Zero", 0), yEnd: .value(s.name, v), series: .value("Series", s.name))
                            .interpolationMethod(.monotone)
                            .foregroundStyle(LinearGradient(colors: [color(si).opacity(si == 0 ? 0.24 : 0.1), color(si).opacity(0)], startPoint: .top, endPoint: .bottom))
                        LineMark(x: .value("Position", i), y: .value(s.name, v), series: .value("Series", s.name))
                            .interpolationMethod(.monotone)
                            .foregroundStyle(color(si))
                            .lineStyle(StrokeStyle(lineWidth: si == 0 ? 2 : 1.5, lineCap: .round, lineJoin: .round))
                    }
                }
            }
            .chartLegend(.hidden)
            .chartXScale(domain: 0...max(count - 1, 1))
            .chartYScale(domain: 0...top)
            .chartYAxis {
                AxisMarks(position: .leading, values: .automatic(desiredCount: 4)) { value in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 1, dash: value.index == 0 ? [] : [3, 4]))
                        .foregroundStyle(p.border)
                    AxisValueLabel {
                        if let v = value.as(Double.self) {
                            Text(v, format: .number.notation(.compactName)).font(SMType.mono(11).font(p)).foregroundStyle(p.mutedForeground)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks(values: Array(stride(from: 0, to: labels.count, by: every))) { value in
                    AxisValueLabel(anchor: .top) {
                        if let i = value.as(Int.self), labels.indices.contains(i) {
                            Text(labels[i]).font(SMType.mono(11).font(p)).foregroundStyle(p.mutedForeground)
                        }
                    }
                }
            }
            .frame(height: height)
            .accessibilityLabel(Text(series.map(\.name).joined(separator: " and ") + " over time"))

            HStack(spacing: 18) {
                ForEach(Array(series.enumerated()), id: \.element.id) { si, s in
                    HStack(spacing: 6) {
                        Circle().fill(color(si)).frame(width: 7, height: 7)
                        Text(s.name).font(.custom(p.sansFont, size: 12)).foregroundStyle(p.mutedForeground)
                    }
                }
            }
            .accessibilityHidden(true)
        }
    }
}

// MARK: - Stat card

/// Change against the previous period, shown as a small pill.
public struct SMDelta: Sendable, Hashable {
    public enum Direction: Sendable { case up, down, flat }
    public var value: String
    public var direction: Direction
    /// Whether the change is good news; defaults to `direction == .up`.
    public var good: Bool

    public init(_ value: String, _ direction: Direction, good: Bool? = nil) {
        self.value = value
        self.direction = direction
        self.good = good ?? (direction == .up)
    }
}

/// A metric: quiet label, big display number, delta pill and an optional
/// sparkline, like the web StatCard.
public struct SMStatCard: View {
    @Environment(\.smPalette) private var p
    private let label: String
    private let value: String
    private let delta: SMDelta?
    private let trend: [Double]?
    private let hint: String?

    public init(_ label: String, value: String, delta: SMDelta? = nil, trend: [Double]? = nil, hint: String? = nil) {
        self.label = label
        self.value = value
        self.delta = delta
        self.trend = trend
        self.hint = hint
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center) {
                Text(label).font(.custom(p.sansFont, size: 13)).foregroundStyle(p.mutedForeground)
                Spacer(minLength: 8)
                if let delta { pill(delta) }
            }
            Text(value)
                .font(SMType.display(34).font(p))
                .tracking(34 * p.displayTracking * 0.6)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            if let trend { SMSparkline(trend, height: 36).padding(.top, 4) }
            if let hint {
                Text(hint).font(.custom(p.sansFont, size: 12)).foregroundStyle(p.mutedForeground)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(p.card, in: .rect(cornerRadius: p.radius + 4, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: p.radius + 4, style: .continuous).strokeBorder(p.border))
        .accessibilityElement(children: .combine)
    }

    private func pill(_ d: SMDelta) -> some View {
        let tint: Color = d.direction == .flat ? p.mutedForeground : d.good ? p.success : p.destructive
        let arrow = switch d.direction { case .up: "↑" case .down: "↓" case .flat: "→" }
        return Text("\(arrow) \(d.value)")
            .font(SMType.mono(11).font(p))
            .monospacedDigit()
            .foregroundStyle(tint)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(d.direction == .flat ? p.muted : tint.opacity(0.14), in: .rect(cornerRadius: 6))
    }
}

// MARK: - Uptime

/// Status-page uptime strip: one bar per day, oldest first, colored by health.
public struct SMUptimeStrip: View {
    public enum Day: Sendable { case up, degraded, down }
    @Environment(\.smPalette) private var p
    private let label: String
    private let days: [Day]
    private let summary: String?

    public init(_ label: String, days: [Day], summary: String? = nil) {
        self.label = label
        self.days = days
        self.summary = summary
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(label).font(SMType.mono(13).font(p))
                Spacer(minLength: 12)
                if let summary {
                    Text(summary).font(SMType.mono(12).font(p)).monospacedDigit().foregroundStyle(p.mutedForeground)
                }
            }
            HStack(spacing: 2) {
                ForEach(Array(days.enumerated()), id: \.offset) { _, day in
                    RoundedRectangle(cornerRadius: 2, style: .continuous)
                        .fill(color(day))
                }
            }
            .frame(height: 28)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(summary.map { "\(label): \($0)" } ?? label))
    }

    private func color(_ day: Day) -> Color {
        switch day {
        case .up: p.success.opacity(0.8)
        case .degraded: p.warning
        case .down: p.destructive
        }
    }
}

// MARK: - App shell

/// A sidebar destination.
public struct SMNavItem: Identifiable, Hashable, Sendable {
    public var id: String
    public var label: String
    /// SF Symbol name.
    public var systemImage: String?
    public var count: Int?

    public init(_ label: String, id: String? = nil, systemImage: String? = nil, count: Int? = nil) {
        self.id = id ?? label
        self.label = label
        self.systemImage = systemImage
        self.count = count
    }
}

/// A group of sidebar destinations with an optional small heading.
public struct SMNavSection: Identifiable, Sendable {
    public var id: String { title ?? items.first?.id ?? "" }
    public var title: String?
    public var items: [SMNavItem]

    public init(_ title: String? = nil, items: [SMNavItem]) {
        self.title = title
        self.items = items
    }
}

/// Internal-tool shell for Mac and iPad: a NavigationSplitView with a quiet
/// sidebar (brand row, grouped destinations, signed-in user) and the detail
/// view. Put an `SMPage` in the detail for the page header.
public struct SMAppShell<Detail: View>: View {
    @Environment(\.smPalette) private var p
    private let brand: String
    private let mark: Image?
    private let sections: [SMNavSection]
    @Binding private var selection: String?
    private let user: (name: String, detail: String?)?
    private let detail: Detail

    /// - Parameters:
    ///   - brand: Product name shown at the top of the sidebar.
    ///   - mark: Product mark; `nil` shows the name's initial on the brand color.
    ///   - selection: The selected `SMNavItem.id`.
    ///   - user: Signed-in user shown at the foot of the sidebar.
    public init(brand: String, mark: Image? = nil, sections: [SMNavSection], selection: Binding<String?>, user: (name: String, detail: String?)? = nil, @ViewBuilder detail: () -> Detail) {
        self.brand = brand
        self.mark = mark
        self.sections = sections
        self._selection = selection
        self.user = user
        self.detail = detail()
    }

    public var body: some View {
        NavigationSplitView {
            sidebar
                .navigationSplitViewColumnWidth(min: 210, ideal: 240, max: 300)
        } detail: {
            detail
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .background(p.background)
        }
        .navigationSplitViewStyle(.balanced)
    }

    private var sidebar: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Group {
                    if let mark {
                        mark.resizable().scaledToFit()
                    } else {
                        Text(String(brand.prefix(1)))
                            .font(.custom(p.displayFont, size: 13).weight(.bold))
                            .foregroundStyle(p.brandForeground)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .background(p.brand)
                    }
                }
                .frame(width: 24, height: 24)
                .clipShape(.rect(cornerRadius: 7, style: .continuous))
                Text(brand)
                    .font(.custom(p.displayFont, size: 15).weight(.semibold))
                    .tracking(-0.15)
                    .textCase(p.uiLowercase ? .lowercase : nil)
            }
            .frame(height: 56)
            .padding(.horizontal, 18)

            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    ForEach(sections) { section in
                        VStack(alignment: .leading, spacing: 2) {
                            if let title = section.title {
                                Text(title)
                                    .font(.custom(p.sansFont, size: 11).weight(.medium))
                                    .tracking(p.uiLowercase ? 0 : 0.9)
                                    .textCase(p.uiLowercase ? .lowercase : .uppercase)
                                    .foregroundStyle(p.mutedForeground)
                                    .padding(.horizontal, 10)
                                    .padding(.bottom, 6)
                            }
                            ForEach(section.items) { row($0) }
                        }
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 12)
            }
            .scrollIndicators(.never)

            if let user {
                HStack(spacing: 10) {
                    Text(initials(user.name))
                        .font(.custom(p.sansFont, size: 11).weight(.semibold))
                        .foregroundStyle(p.brand)
                        .frame(width: 28, height: 28)
                        .background(p.brandSoft, in: .circle)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(user.name).font(.custom(p.sansFont, size: 12).weight(.medium))
                        if let detail = user.detail {
                            Text(detail).font(.custom(p.sansFont, size: 12)).foregroundStyle(p.mutedForeground)
                        }
                    }
                    .lineLimit(1)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .overlay(alignment: .top) { Rectangle().fill(p.border).frame(height: 1) }
            }
        }
        .frame(maxHeight: .infinity, alignment: .top)
        .background(p.surface)
    }

    private func row(_ item: SMNavItem) -> some View {
        let active = selection == item.id
        return Button {
            withAnimation(SMMotion.state) { selection = item.id }
        } label: {
            HStack(spacing: 10) {
                if let symbol = item.systemImage {
                    Image(systemName: symbol)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(active ? p.brand : p.mutedForeground)
                        .frame(width: 18)
                }
                Text(item.label)
                    .font(.custom(p.sansFont, size: 13).weight(active ? .medium : .regular))
                    .textCase(p.uiLowercase ? .lowercase : nil)
                    .foregroundStyle(active ? p.foreground : p.foreground.opacity(0.72))
                    .lineLimit(1)
                Spacer(minLength: 6)
                if let count = item.count {
                    Text("\(count)").font(SMType.mono(11).font(p)).monospacedDigit().foregroundStyle(p.mutedForeground)
                }
            }
            .padding(.horizontal, 10)
            .frame(height: 32)
            .background(active ? p.accent : .clear, in: .rect(cornerRadius: 7, style: .continuous))
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(active ? .isSelected : [])
    }

    private func initials(_ name: String) -> String {
        String(name.split(separator: " ").compactMap(\.first).prefix(2))
    }
}

/// Title, description and actions above a page, with a hairline beneath, like the web PageHeader.
public struct SMPageHeader<Actions: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let description: String?
    private let actions: Actions

    public init(_ title: String, description: String? = nil, @ViewBuilder actions: () -> Actions) {
        self.title = title
        self.description = description
        self.actions = actions()
    }

    public var body: some View {
        HStack(alignment: .bottom, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(SMType.display(30).font(p))
                    .tracking(30 * p.displayTracking)
                    .textCase(p.displayLowercase ? .lowercase : nil)
                    .accessibilityAddTraits(.isHeader)
                if let description {
                    Text(description).font(.custom(p.sansFont, size: 14)).foregroundStyle(p.mutedForeground)
                }
            }
            Spacer(minLength: 16)
            HStack(spacing: 8) { actions }
        }
        .padding(.horizontal, 32)
        .padding(.top, 30)
        .padding(.bottom, 22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlay(alignment: .bottom) { Rectangle().fill(p.border).frame(height: 1) }
    }
}

extension SMPageHeader where Actions == EmptyView {
    /// A header without actions.
    public init(_ title: String, description: String? = nil) {
        self.init(title, description: description) { EmptyView() }
    }
}

/// A detail page: `SMPageHeader` pinned on top, scrolling content beneath with page margins.
public struct SMPage<Content: View, Actions: View>: View {
    private let title: String
    private let description: String?
    private let actions: Actions
    private let content: Content

    public init(_ title: String, description: String? = nil, @ViewBuilder actions: () -> Actions, @ViewBuilder content: () -> Content) {
        self.title = title
        self.description = description
        self.actions = actions()
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 0) {
            SMPageHeader(title, description: description) { actions }
            ScrollView {
                content
                    .padding(32)
                    .frame(maxWidth: .infinity, alignment: .topLeading)
            }
        }
    }
}

extension SMPage where Actions == EmptyView {
    /// A page without header actions.
    public init(_ title: String, description: String? = nil, @ViewBuilder content: () -> Content) {
        self.init(title, description: description, actions: { EmptyView() }, content: content)
    }
}

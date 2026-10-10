import Observation
import SwiftUI

public enum SMLoadingState<Value> {
    case idle
    case loading
    case loaded(Value)
    case empty
    case failed(any Error)
}

/// A small cancellable loader. `value` stays available while the next request runs.
@MainActor @Observable
public final class SMResourceLoader<Value: Sendable> {
    public private(set) var state: SMLoadingState<Value> = .idle
    public private(set) var value: Value?
    public private(set) var isLoading = false
    @ObservationIgnored private var task: Task<Void, Never>?
    @ObservationIgnored private var generation = 0
    private let isEmpty: @Sendable (Value) -> Bool

    public init(initialValue: Value? = nil, isEmpty: @escaping @Sendable (Value) -> Bool = { _ in false }) {
        self.isEmpty = isEmpty
        value = initialValue
        if let initialValue { state = isEmpty(initialValue) ? .empty : .loaded(initialValue) }
    }

    /// Await the returned task's `value` when a caller needs completion.
    @discardableResult
    public func load(_ fetcher: @escaping @Sendable () async throws -> Value) -> Task<Void, Never> {
        task?.cancel()
        generation += 1
        let request = generation
        state = .loading
        isLoading = true
        let task = Task { [weak self] in
            do {
                let result = try await fetcher()
                try Task.checkCancellation()
                guard let self, self.generation == request else { return }
                self.value = result
                self.state = self.isEmpty(result) ? .empty : .loaded(result)
                self.isLoading = false
                self.task = nil
            } catch {
                guard let self, self.generation == request else { return }
                self.isLoading = false
                self.task = nil
                if Task.isCancelled || error is CancellationError {
                    self.restoreState()
                } else {
                    self.state = .failed(error)
                }
            }
        }
        self.task = task
        return task
    }

    public func cancel() {
        generation += 1
        task?.cancel()
        task = nil
        isLoading = false
        restoreState()
    }

    private func restoreState() {
        if let value { state = isEmpty(value) ? .empty : .loaded(value) }
        else { state = .idle }
    }

    deinit { task?.cancel() }
}

private struct SMPlaceholder: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.smPalette) private var p
    let isLoading: Bool

    func body(content: Content) -> some View {
        if isLoading {
            placeholder(content)
                .disabled(true)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("loading")
        } else {
            content
        }
    }

    private func placeholder(_ content: Content) -> some View {
        content
            .redacted(reason: isLoading ? .placeholder : [])
            .overlay {
                if isLoading && !reduceMotion {
                    TimelineView(.animation(minimumInterval: 1 / 30)) { context in
                        let phase = context.date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: 2.4) / 2.4
                        GeometryReader { geometry in
                            LinearGradient(colors: [.clear, p.foreground.opacity(0.035), .clear], startPoint: .leading, endPoint: .trailing)
                                .frame(width: geometry.size.width * 0.6)
                                .offset(x: geometry.size.width * (phase * 1.6 - 0.6))
                        }
                    }
                    .allowsHitTesting(false)
                    .clipped()
                }
            }
    }
}

extension View {
    public func smPlaceholder(_ isLoading: Bool) -> some View {
        modifier(SMPlaceholder(isLoading: isLoading))
    }
}

public struct SMSkeletonRow: View {
    @Environment(\.smPalette) private var p
    public init() {}
    public var body: some View {
        HStack(spacing: 12) {
            Circle().fill(p.muted).frame(width: 40, height: 40)
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 3).fill(p.muted).frame(height: 12)
                RoundedRectangle(cornerRadius: 3).fill(p.muted).frame(maxWidth: 160).frame(height: 12)
            }
        }
        .frame(minHeight: 56)
        .smPlaceholder(true)
    }
}

public struct SMSkeletonCard: View {
    @Environment(\.smPalette) private var p
    public init() {}
    public var body: some View {
        SMCard {
            VStack(alignment: .leading, spacing: 16) {
                RoundedRectangle(cornerRadius: p.radius).fill(p.muted).aspectRatio(16 / 9, contentMode: .fit)
                SMSkeletonRow()
            }
        }
        .smPlaceholder(true)
    }
}

public struct SMEmptyState: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let description: String?
    private let systemImage: String
    public init(_ title: String = "nothing here yet", description: String? = nil, systemImage: String = "tray") {
        self.title = title
        self.description = description
        self.systemImage = systemImage
    }
    public var body: some View {
        VStack(spacing: 12) {
            Image(systemName: systemImage).foregroundStyle(p.mutedForeground).accessibilityHidden(true)
            SMDisplay(title, size: 22)
            if let description { Text(description).font(SMType.text(16).font(p)).foregroundStyle(p.mutedForeground) }
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
        .padding(28)
    }
}

public struct SMErrorState: View {
    private let title: String
    private let description: String?
    private let retry: () -> Void
    public init(_ title: String = "could not load", description: String? = nil, retry: @escaping () -> Void) {
        self.title = title
        self.description = description
        self.retry = retry
    }
    public var body: some View {
        VStack(spacing: 12) {
            SMEmptyState(title, description: description, systemImage: "exclamationmark.circle")
            Button("try again", action: retry).buttonStyle(.smOutline)
        }
        .padding(.bottom, 28)
    }
}

/// Pass the loader's `value` as `previousValue` to keep content visible on reload.
public struct SMLoadable<Value, Content: View, Placeholder: View, Empty: View, Failure: View>: View {
    private let state: SMLoadingState<Value>
    private let previousValue: Value?
    private let content: (Value) -> Content
    private let placeholder: () -> Placeholder
    private let empty: () -> Empty
    private let error: (any Error) -> Failure

    public init(_ state: SMLoadingState<Value>, previousValue: Value? = nil,
                @ViewBuilder content: @escaping (Value) -> Content,
                @ViewBuilder placeholder: @escaping () -> Placeholder,
                @ViewBuilder empty: @escaping () -> Empty,
                @ViewBuilder error: @escaping (any Error) -> Failure) {
        self.state = state
        self.previousValue = previousValue
        self.content = content
        self.placeholder = placeholder
        self.empty = empty
        self.error = error
    }

    public var body: some View {
        switch state {
        case .idle: placeholder()
        case .loading:
            if let previousValue {
                content(previousValue).overlay(alignment: .topTrailing) {
                    Text("updating").font(.caption).padding(4).accessibilityLabel("updating")
                }
            } else { placeholder() }
        case .loaded(let value): content(value)
        case .empty: empty()
        case .failed(let failure): error(failure)
        }
    }
}

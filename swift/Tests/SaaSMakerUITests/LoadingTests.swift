import Testing
@testable import SaaSMakerUI

@MainActor @Suite struct LoadingTests {
    private struct Failure: Error {}

    @Test func transitionsFromIdleThroughLoadingToLoaded() async {
        let loader = SMResourceLoader<String>()
        guard case .idle = loader.state else { Issue.record("expected idle"); return }
        let task = loader.load { "ready" }
        #expect(loader.isLoading)
        guard case .loading = loader.state else { Issue.record("expected loading"); return }
        await task.value
        #expect(!loader.isLoading)
        #expect(loader.value == "ready")
        guard case .loaded("ready") = loader.state else { Issue.record("expected loaded"); return }
    }

    @Test func retainsPreviousValueDuringReloadAndFailure() async {
        let loader = SMResourceLoader(initialValue: "previous")
        let task = loader.load { throw Failure() }
        #expect(loader.value == "previous")
        #expect(loader.isLoading)
        await task.value
        #expect(loader.value == "previous")
        guard case .failed = loader.state else { Issue.record("expected failed"); return }
        await loader.load { "next" }.value
        #expect(loader.value == "next")
    }

    @Test func detectsEmptyResultsAndInitialValues() async {
        let loader = SMResourceLoader<[Int]>(initialValue: [], isEmpty: { $0.isEmpty })
        guard case .empty = loader.state else { Issue.record("expected empty initial value"); return }
        await loader.load { [1] }.value
        guard case .loaded = loader.state else { Issue.record("expected loaded"); return }
        await loader.load { [] }.value
        guard case .empty = loader.state else { Issue.record("expected empty"); return }
    }

    @Test func cancellationRestoresStaleValue() async {
        let loader = SMResourceLoader(initialValue: "previous")
        let task = loader.load {
            try await Task.sleep(for: .seconds(60))
            return "cancelled result"
        }
        loader.cancel()
        await task.value
        #expect(loader.value == "previous")
        #expect(!loader.isLoading)
        guard case .loaded("previous") = loader.state else { Issue.record("expected stale loaded state"); return }
    }

    @Test func cancelledRequestCannotOverwriteNewRequest() async {
        let loader = SMResourceLoader<String>()
        let first = loader.load {
            // A fetcher may swallow cancellation: generation still protects newer data.
            try? await Task.sleep(for: .seconds(60))
            return "old"
        }
        let second = loader.load { "new" }
        await second.value
        await first.value
        #expect(loader.value == "new")
        loader.cancel()
        #expect(!loader.isLoading)
    }

    @Test func cancellationWithoutDataReturnsToIdle() async {
        let loader = SMResourceLoader<String>()
        let task = loader.load {
            try await Task.sleep(for: .seconds(60))
            return "unused"
        }
        loader.cancel()
        await task.value
        guard case .idle = loader.state else { Issue.record("expected idle after cancellation"); return }
    }
}

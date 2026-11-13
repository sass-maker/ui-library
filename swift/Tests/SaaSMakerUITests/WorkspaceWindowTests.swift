import AppKit
import SwiftUI
import Testing
@testable import SaaSMakerUI

@MainActor @Suite(.serialized) struct WorkspaceWindowTests {
    private func content() -> some View {
        Text("Workspace").frame(width: 400, height: 260)
            .background(SMWorkspaceWindowChrome())
            .smTheme(.workbench)
    }

    @Test func windowReactivationRestoresTheWorkspaceCanvasAfterNativeConfiguration() {
        _ = NSApplication.shared
        let host = NSHostingView(rootView: content())
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 400, height: 260),
                              styleMask: [.titled, .closable], backing: .buffered, defer: false)
        window.isReleasedWhenClosed = false
        window.contentView = host
        host.layoutSubtreeIfNeeded()
        defer { window.close() }
        window.titlebarAppearsTransparent = false
        window.backgroundColor = .windowBackgroundColor
        NotificationCenter.default.post(name: NSWindow.didBecomeKeyNotification, object: window)
        #expect(window.titlebarAppearsTransparent)
        #expect(window.backgroundColor == NSColor(SMPalette.workbench.background))
        #expect(window.styleMask.contains(.titled))
        #expect(window.standardWindowButton(.closeButton) != nil)
    }

    @Test func detachedChromeDoesNotRestyleItsPreviousWindow() {
        _ = NSApplication.shared
        let host = NSHostingView(rootView: content())
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 400, height: 260),
                              styleMask: [.titled], backing: .buffered, defer: false)
        window.isReleasedWhenClosed = false
        window.contentView = host
        host.layoutSubtreeIfNeeded()
        window.contentView = nil
        window.titlebarAppearsTransparent = false
        NotificationCenter.default.post(name: NSWindow.didBecomeKeyNotification, object: window)
        #expect(!window.titlebarAppearsTransparent)
        window.close()
    }
}

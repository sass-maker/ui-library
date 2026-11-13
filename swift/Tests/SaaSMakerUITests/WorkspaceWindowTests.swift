import AppKit
import SwiftUI
import Testing
@testable import SaaSMakerUI

@MainActor @Suite(.serialized) struct WorkspaceWindowTests {
    private func content(_ palette: SMPalette = .workbench) -> some View {
        Text("Workspace").frame(width: 400, height: 260)
            .smWorkspaceWindowChrome()
            .smTheme(palette)
    }

    @Test func workspacePaletteUpdatesRetainTheStandardNativeWindowControls() {
        _ = NSApplication.shared
        let host = NSHostingView(rootView: content())
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 400, height: 260),
                              styleMask: [.titled, .closable], backing: .buffered, defer: false)
        window.isReleasedWhenClosed = false
        window.contentView = host
        host.layoutSubtreeIfNeeded()
        defer { window.close() }
        #expect(window.backgroundColor == NSColor(SMPalette.workbench.background))
        host.rootView = content(.workbenchDark)
        host.layoutSubtreeIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(0.02))
        #expect(window.titlebarAppearsTransparent)
        #expect(window.backgroundColor == NSColor(SMPalette.workbenchDark.background))
        #expect(window.styleMask.contains(.titled))
        #expect(window.standardWindowButton(.closeButton) != nil)
    }

    @Test func movingTheChromeStylesItsNewWindowWithoutRestylingTheOldOne() {
        _ = NSApplication.shared
        let host = NSHostingView(rootView: content())
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 400, height: 260),
                              styleMask: [.titled], backing: .buffered, defer: false)
        window.isReleasedWhenClosed = false
        window.contentView = host
        host.layoutSubtreeIfNeeded()
        window.contentView = nil
        let next = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 400, height: 260),
                            styleMask: [.titled], backing: .buffered, defer: false)
        next.isReleasedWhenClosed = false
        next.contentView = host
        host.layoutSubtreeIfNeeded()
        #expect(next.backgroundColor == NSColor(SMPalette.workbench.background))
        window.titlebarAppearsTransparent = false
        NotificationCenter.default.post(name: NSWindow.didBecomeKeyNotification, object: window)
        #expect(!window.titlebarAppearsTransparent)
        next.close()
        window.close()
    }
}

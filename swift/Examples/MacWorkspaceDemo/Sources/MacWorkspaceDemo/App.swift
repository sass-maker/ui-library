import AppKit
import SwiftUI
import SaaSMakerUI

enum Ink {
    static let light = CommandLine.arguments.contains("--light")
    static let canvas = light ? Color.white : Color.black
    static let pane = light ? Color(red: 0.97, green: 0.98, blue: 0.975) : Color(red: 0.025, green: 0.036, blue: 0.031)
    static let raised = light ? Color(red: 0.94, green: 0.96, blue: 0.95) : Color(red: 0.055, green: 0.071, blue: 0.062)
    static let primary = light ? Color(red: 0.08, green: 0.13, blue: 0.10) : Color(red: 0.92, green: 0.95, blue: 0.93)
    static let secondary = light ? Color(red: 0.32, green: 0.39, blue: 0.35) : Color(red: 0.57, green: 0.65, blue: 0.61)
    static let mint = light ? Color(red: 0.10, green: 0.43, blue: 0.29) : Color(red: 0.48, green: 0.83, blue: 0.67)
    static let line = light ? Color.black.opacity(0.12) : Color.white.opacity(0.10)
    static let selected = mint.opacity(0.10)
}

@MainActor enum DemoAssets {
    static let doodles = image("PageDoodles")
    static let icon = image("StorageDaddy")

    private static func image(_ name: String) -> NSImage? {
        Bundle.module.url(forResource: name, withExtension: "png", subdirectory: "Assets")
            .flatMap(NSImage.init(contentsOf:))
    }
}

@MainActor final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let width = argument("width").flatMap(Double.init) ?? 1240
        let height = argument("height").flatMap(Double.init) ?? 800
        let root = StorageCraft()
            .environment(\.layoutDirection, CommandLine.arguments.contains("--rtl") ? .rightToLeft : .leftToRight)
            .environment(\.dynamicTypeSize, CommandLine.arguments.contains("--large-text") ? .accessibility2 : .large)
        window = NSWindow(contentRect: NSRect(x: 100, y: 100, width: width, height: height),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Mac UI library · StorageDaddy preview"
        window.backgroundColor = Ink.light ? .white : .black
        window.appearance = NSAppearance(named: Ink.light ? .aqua : .darkAqua)
        window.contentMinSize = NSSize(width: 880, height: 650)
        window.isReleasedWhenClosed = false
        window.contentView = NSHostingView(rootView: root)
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
        configureMenu()
    }

    private func argument(_ name: String) -> String? {
        CommandLine.arguments.first { $0.hasPrefix("--\(name)=") }
            .map { String($0.dropFirst(name.count + 3)) }
    }

    private func configureMenu() {
        let menu = NSMenu()
        let application = NSMenuItem()
        application.submenu = NSMenu()
        application.submenu?.addItem(withTitle: "Quit Mac UI Demo", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        menu.addItem(application)
        let edit = NSMenuItem()
        edit.submenu = NSMenu(title: "Edit")
        for (title, action, key) in [
            ("Cut", #selector(NSText.cut(_:)), "x"),
            ("Copy", #selector(NSText.copy(_:)), "c"),
            ("Paste", #selector(NSText.paste(_:)), "v"),
            ("Select All", #selector(NSText.selectAll(_:)), "a")
        ] { edit.submenu?.addItem(withTitle: title, action: action, keyEquivalent: key) }
        edit.submenu?.addItem(.separator())
        let find = NSMenuItem(title: "Find", action: #selector(findFolders), keyEquivalent: "f")
        find.target = self
        edit.submenu?.addItem(find)
        menu.addItem(edit)
        NSApp.mainMenu = menu
    }

    @objc private func findFolders() {
        NotificationCenter.default.post(name: Notification.Name("MacLabFocusSearch"), object: nil)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

@main enum MacWorkspaceDemo {
    static func main() {
        let delegate = AppDelegate()
        let application = NSApplication.shared
        application.delegate = delegate
        withExtendedLifetime(delegate) { application.run() }
    }
}

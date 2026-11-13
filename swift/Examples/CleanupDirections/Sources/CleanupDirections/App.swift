import AppKit
import SwiftUI
import SaaSMakerUI

enum Tone {
    static let ink = Color(red: 0.94, green: 0.96, blue: 0.95)
    static let secondary = Color(red: 0.59, green: 0.64, blue: 0.61)
    static let mint = Color(red: 0.43, green: 0.80, blue: 0.64)
    static let hairline = Color.white.opacity(0.10)
    static let panel = Color(red: 0.025, green: 0.032, blue: 0.028)
    static let palette = SMPalette.fromApp(background: .black, foreground: ink, card: panel,
        border: hairline, brand: mint, brandForeground: .black, surface: panel,
        mutedForeground: secondary, radius: 8, sansFont: "Geist", displayFont: "Figtree", isDark: true)
    static func type(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
        .custom("Geist", size: size).weight(weight)
    }
    static func heading(_ size: CGFloat) -> Font { .custom("Figtree", size: size).weight(.semibold) }
}

struct Folder: Decodable, Identifiable {
    let id: Int
    let project: String
    let name: String
    let path: String
    let bytes: Int64
    let kind: String
    let description: String
    var size: String { ByteCountFormatter.string(fromByteCount: bytes, countStyle: .file) }
}
struct Snapshot: Decodable { let rows: [Folder]; let capacity: Int64; let available: Int64 }

@MainActor enum Input { static var snapshot: Snapshot! }

@MainActor final class Study: ObservableObject {
    let snapshot: Snapshot
    @Published var selected: Set<Int> = [0, 2]
    @Published var inspected: Int = 0
    @Published var query = ""
    @Published var review = false
    @Published var details = false
    @Published var notice = ""
    init() {
        snapshot = Input.snapshot
        selected = Set(snapshot.rows.map(\.id)).intersection([0, 2])
    }
    var rows: [Folder] { snapshot.rows.filter { query.isEmpty || ($0.project + $0.name).localizedCaseInsensitiveContains(query) } }
    var chosen: [Folder] { snapshot.rows.filter { selected.contains($0.id) } }
    var total: Int64 { chosen.reduce(0) { $0 + $1.bytes } }
    var size: String { ByteCountFormatter.string(fromByteCount: total, countStyle: .file) }
    var selectionSummary: String { "\(selected.count) \(selected.count == 1 ? "folder" : "folders")" }
    var inspectedFolder: Folder { snapshot.rows.first { $0.id == inspected } ?? snapshot.rows[0] }
    func toggle(_ id: Int) { if selected.contains(id) { selected.remove(id) } else { selected.insert(id) }; inspected = id }
    func explain(_ message: String) { notice = message }
}

@MainActor enum Art {
    static func image(_ name: String) -> NSImage {
        NSImage(contentsOf: Bundle.module.url(forResource: name, withExtension: "png", subdirectory: "Assets")!)!
    }
}

struct Brand: View {
    var compact = false
    var body: some View {
        HStack(spacing: 10) {
            Image(nsImage: Art.image("StorageDaddy")).resizable().scaledToFit().frame(width: compact ? 30 : 32, height: 32)
            if !compact { Text("storagedaddy").font(Tone.heading(18)).tracking(-0.5) }
        }
    }
}

struct Sidebar: View {
    @EnvironmentObject var study: Study
    var ledger = false
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Brand().padding(.bottom, 34)
            nav("Overview", "square.grid.2x2", selected: false)
            nav("Storage", "internaldrive", selected: true)
            nav("Applications", "square.stack.3d.up", selected: false)
            nav("AI sessions", "bubble.left.and.bubble.right", selected: false)
            nav("History", "clock.arrow.circlepath", selected: false)
            Spacer(minLength: 24)
            VStack(alignment: .leading, spacing: 9) {
                HStack { Image(systemName: "internaldrive"); Text("Macintosh HD"); Spacer() }.font(Tone.type(11, .medium))
                GeometryReader { g in
                    Capsule().fill(Tone.mint.opacity(0.10))
                    Capsule().fill(Tone.mint.opacity(0.65)).frame(width: g.size.width * CGFloat(1 - Double(study.snapshot.available) / Double(study.snapshot.capacity)))
                }.frame(height: 3)
                Text("\(ByteCountFormatter.string(fromByteCount: study.snapshot.available, countStyle: .file)) available")
                    .font(Tone.type(11)).foregroundStyle(Tone.secondary)
            }.padding(.horizontal, 8).padding(.bottom, 26)
            HStack {
                Button { study.explain("Other tools remain accessible here. This study changes only the cleanup composition.") } label: {
                    Label("Tools", systemImage: "ellipsis.circle")
                }
                Spacer()
                Button { study.explain("Settings are not changed in this design preview.") } label: { Image(systemName: "gearshape") }
                    .accessibilityLabel("Settings")
            }.font(Tone.type(12)).foregroundStyle(Tone.secondary).buttonStyle(.plain).padding(.horizontal, 8)
        }.padding(.horizontal, 18).padding(.top, 30).padding(.bottom, 24)
            .frame(width: ledger ? 188 : 198).background(Color.black)
    }
    private func nav(_ name: String, _ symbol: String, selected: Bool) -> some View {
        Button { if !selected { study.explain("This preview focuses on Storage → Cleanup. Other product destinations remain available in the app.") } } label: {
            HStack(spacing: 11) { Image(systemName: symbol).frame(width: 18); Text(name); Spacer() }
                .font(Tone.type(13, selected ? .medium : .regular))
                .foregroundStyle(selected ? Tone.mint : Tone.secondary)
                .padding(.horizontal, 10).frame(height: 39)
                .background(selected ? Tone.mint.opacity(0.10) : .clear, in: RoundedRectangle(cornerRadius: 7))
        }.buttonStyle(.plain).padding(.bottom, 4)
    }
}

struct ScopeBar: View {
    @EnvironmentObject var study: Study
    var ledger = false
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "internaldrive").foregroundStyle(Tone.secondary)
            Text("Storage").foregroundStyle(Tone.secondary)
            Image(systemName: "chevron.right").font(.system(size: 8, weight: .semibold)).foregroundStyle(Tone.secondary)
            Text(ledger ? "Fleet workspaces" : "Cleanup").foregroundStyle(Tone.ink)
            Spacer()
            Text("Read-only folder metadata").font(Tone.type(11)).foregroundStyle(Tone.secondary)
            Button { study.explain("This is a design preview. Rescanning is not started and no files are changed.") } label: { Image(systemName: "arrow.clockwise") }
                .buttonStyle(SMMacButtonStyle(.quiet)).accessibilityLabel("Refresh")
        }.font(Tone.type(12)).padding(.horizontal, 30).frame(height: 52)
            .overlay(alignment: .bottom) { Divider().overlay(Tone.hairline) }
    }
}

struct FolderCheck: View {
    @EnvironmentObject var study: Study
    let folder: Folder
    var body: some View {
        Toggle(folder.project + " " + folder.name, isOn: Binding(
            get: { study.selected.contains(folder.id) }, set: { _ in study.toggle(folder.id) }))
            .toggleStyle(.checkbox).labelsHidden().tint(Tone.mint)
            .accessibilityLabel("Select \(folder.project) \(folder.name)")
    }
}

struct FolderMark: View {
    var size: CGFloat = 38
    var body: some View {
        Image(systemName: "folder").font(.system(size: size * 0.5, weight: .regular))
            .foregroundStyle(Tone.mint).frame(width: size, height: size)
            .background(Tone.mint.opacity(0.07), in: RoundedRectangle(cornerRadius: 8))
    }
}

struct ReviewButton: View {
    @EnvironmentObject var study: Study
    var full = false
    var body: some View {
        Button { study.review = true } label: {
            HStack(spacing: 12) {
                Text("Review \(study.selected.count) \(study.selected.count == 1 ? "folder" : "folders")…")
                if full { Spacer(minLength: 4) }
                Image(systemName: "arrow.right").font(.system(size: 11, weight: .semibold))
            }.frame(maxWidth: full ? .infinity : nil).frame(height: 8)
        }.buttonStyle(SMMacButtonStyle(.primary)).disabled(study.selected.isEmpty)
            .keyboardShortcut(.return, modifiers: .command)
    }
}

struct ReviewDesk: View {
    @EnvironmentObject var study: Study
    @FocusState private var searching: Bool
    var body: some View {
        HStack(spacing: 0) {
            Sidebar()
            Divider().overlay(Tone.hairline)
            VStack(spacing: 0) {
                ScopeBar()
                GeometryReader { g in
                    if g.size.width >= 840 {
                        HStack(spacing: 0) { list; Divider().overlay(Tone.hairline); decision.frame(width: 262) }
                    } else {
                        list.safeAreaInset(edge: .bottom, spacing: 0) { compactDecision }
                    }
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .init("StudyFind"))) { _ in searching = true }
    }
    private var list: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Review cleanup").font(Tone.heading(27)).tracking(-0.6)
                    Text("Keep the work. Clear the build.").font(Tone.type(13)).foregroundStyle(Tone.secondary)
                }
                Spacer()
                Text("\(study.snapshot.rows.count) folders").font(Tone.type(11, .medium)).foregroundStyle(Tone.secondary).padding(.top, 9)
            }.padding(.top, 29).padding(.bottom, 23)
            SMSearchField("Find a project or folder", text: $study.query, focus: $searching)
            HStack { Text("FOLDER / PROJECT"); Spacer(); Text("ON DISK") }
                .font(Tone.type(10, .medium)).tracking(1.1).foregroundStyle(Tone.secondary)
                .padding(.top, 25).padding(.bottom, 12)
            Divider().overlay(Tone.hairline)
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(study.rows) { f in
                        HStack(spacing: 13) {
                            FolderCheck(folder: f)
                            FolderMark(size: 36)
                            Button { study.inspected = f.id; study.details = true } label: {
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(f.project).font(Tone.type(15, .medium)).foregroundStyle(Tone.ink).lineLimit(1).truncationMode(.middle)
                                    Text("\(f.name) · SwiftPM output").font(Tone.type(12)).foregroundStyle(Tone.secondary)
                                }.frame(maxWidth: .infinity, alignment: .leading)
                            }.buttonStyle(.plain).help(f.path)
                            VStack(alignment: .trailing, spacing: 5) {
                                Text(f.size).font(Tone.type(13, .medium)).monospacedDigit()
                                Text("To Trash").font(Tone.type(10)).foregroundStyle(Tone.secondary)
                            }
                        }.padding(.horizontal, 12).frame(height: 78)
                            .background(study.selected.contains(f.id) ? Tone.mint.opacity(0.055) : .clear)
                        Divider().overlay(Tone.hairline.opacity(0.6))
                    }
                }
                if study.rows.isEmpty { Text("No matching folders").foregroundStyle(Tone.secondary).padding(40) }
            }.scrollIndicators(.hidden)
            HStack(spacing: 7) {
                Image(systemName: "lock.shield")
                Text("Nothing is removed before you review.")
                Spacer()
            }.font(Tone.type(11)).foregroundStyle(Tone.secondary).padding(.vertical, 18)
        }.padding(.horizontal, 30)
    }
    private var decision: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("YOUR SELECTION").font(Tone.type(10, .medium)).tracking(1.5).foregroundStyle(Tone.secondary)
            Text(study.size).font(Tone.heading(42)).tracking(-1.3).monospacedDigit().padding(.top, 14)
            Text("On disk · \(study.selectionSummary) selected").font(Tone.type(12)).foregroundStyle(Tone.secondary).padding(.top, 5)
            Text("Shared allocation may overlap.").font(Tone.type(11)).foregroundStyle(Tone.secondary).padding(.top, 8)
            Divider().overlay(Tone.hairline).padding(.vertical, 27)
            Button { study.explain("Permanent cleanup remains limited to the app’s existing eligible dependencies and caches. These Swift build folders use Trash.") } label: {
                HStack { Label("Move to Trash", systemImage: "trash"); Spacer(); Image(systemName: "chevron.down").font(.system(size: 9)) }
            }.buttonStyle(SMMacButtonStyle(.secondary))
            Text("Restore from Trash until it’s emptied.").font(Tone.type(12)).foregroundStyle(Tone.secondary).lineSpacing(4).padding(.top, 10)
            Spacer(minLength: 25)
            Image(nsImage: Art.image("Welcome")).resizable().scaledToFit().frame(height: 112).accessibilityHidden(true)
                .padding(.bottom, 18)
            Text("Review checks allocation and recovery before anything moves.")
                .font(Tone.type(11)).foregroundStyle(Tone.secondary).lineSpacing(3)
            ReviewButton(full: true).padding(.top, 18)
            Text("⌘ Return to review").font(Tone.type(10)).foregroundStyle(Tone.secondary).frame(maxWidth: .infinity).padding(.top, 12)
        }.padding(.horizontal, 24).padding(.top, 32).padding(.bottom, 22).background(Color.black)
    }
    private var compactDecision: some View {
        HStack {
            VStack(alignment: .leading, spacing: 5) { Text("\(study.size) on disk").font(Tone.type(19, .semibold)); Text("\(study.selected.count) selected · To Trash after confirmation").font(Tone.type(11)).foregroundStyle(Tone.secondary) }
            Spacer(minLength: 16)
            ReviewButton()
        }.padding(24).background(Tone.panel).overlay(alignment: .top) { Divider().overlay(Tone.hairline) }
    }
}

struct StorageLedger: View {
    @EnvironmentObject var study: Study
    @FocusState private var searching: Bool
    var body: some View {
        HStack(spacing: 0) {
            Sidebar(ledger: true)
            Divider().overlay(Tone.hairline)
            VStack(alignment: .leading, spacing: 0) {
                ScopeBar(ledger: true)
                HStack(alignment: .firstTextBaseline) {
                    Text("Cleanup queue").font(Tone.heading(23)).tracking(-0.5)
                    Text("\(study.snapshot.rows.count)").font(Tone.type(12, .medium)).foregroundStyle(Tone.secondary)
                    Spacer()
                    Button("Explore storage") { study.explain("The storage map and developer views stay one step away, inside Storage.") }.buttonStyle(SMMacButtonStyle(.quiet))
                }.padding(.horizontal, 28).padding(.top, 25).padding(.bottom, 20)
                HStack(spacing: 14) {
                    SMSearchField("Search this queue", text: $study.query, focus: $searching)
                    Label("Build outputs", systemImage: "line.3.horizontal.decrease").font(Tone.type(12)).foregroundStyle(Tone.secondary)
                }.padding(.horizontal, 28).padding(.bottom, 23)
                HStack(spacing: 14) {
                    Text("FOLDER").frame(maxWidth: .infinity, alignment: .leading)
                    Text("ON DISK").frame(width: 88, alignment: .trailing)
                    Text("DESTINATION").frame(width: 108, alignment: .leading)
                    Image(systemName: "ellipsis").frame(width: 24)
                }.font(Tone.type(10, .medium)).tracking(1).foregroundStyle(Tone.secondary)
                    .padding(.leading, 94).padding(.trailing, 28).padding(.bottom, 12)
                Divider().overlay(Tone.hairline)
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(study.rows) { f in
                            HStack(spacing: 14) {
                                FolderCheck(folder: f)
                                Image(systemName: "folder").font(.system(size: 18)).foregroundStyle(Tone.mint).frame(width: 24)
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(f.project).font(Tone.type(14, .medium)).lineLimit(1)
                                    Text("\(f.name) · SwiftPM output").font(Tone.type(12)).foregroundStyle(Tone.secondary)
                                }.frame(maxWidth: .infinity, alignment: .leading).help(f.path)
                                Text(f.size).font(Tone.type(12, .medium)).monospacedDigit().frame(width: 88, alignment: .trailing)
                                Label("Trash", systemImage: "trash").font(Tone.type(11)).foregroundStyle(Tone.secondary).frame(width: 108, alignment: .leading)
                                Button { study.inspected = f.id; study.details = true } label: { Image(systemName: "ellipsis").frame(width: 24, height: 30) }
                                    .buttonStyle(.plain).foregroundStyle(Tone.secondary).accessibilityLabel("Inspect \(f.project)")
                            }.padding(.horizontal, 28).frame(height: 52)
                                .background(study.selected.contains(f.id) ? Tone.mint.opacity(0.075) : .clear)
                            Divider().overlay(Tone.hairline.opacity(0.65)).padding(.leading, 28)
                        }
                    }
                    if study.rows.isEmpty { Text("No matching folders").foregroundStyle(Tone.secondary).padding(40) }
                }.scrollIndicators(.hidden)
                HStack {
                    Label("Recovery: review local changes before rebuilding", systemImage: "info.circle")
                    Spacer()
                }.font(Tone.type(11)).foregroundStyle(Tone.secondary).padding(.horizontal, 28).padding(.vertical, 18)
                VStack(spacing: 15) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("\(study.selectionSummary) selected").font(Tone.type(13, .medium))
                        Spacer()
                        Text(study.size).font(Tone.heading(27)).tracking(-0.7).monospacedDigit()
                    }
                    HStack {
                        Text("Folder allocation · Shared storage can overlap").font(Tone.type(11)).foregroundStyle(Tone.secondary)
                        Spacer()
                        ReviewButton()
                    }
                }.padding(.horizontal, 28).padding(.vertical, 22).background(Tone.panel)
            }
        }.onReceive(NotificationCenter.default.publisher(for: .init("StudyFind"))) { _ in searching = true }
    }
}

struct FocusedCleanup: View {
    @EnvironmentObject var study: Study
    @FocusState private var searching: Bool
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button { study.explain("The full storage workspace remains behind this focused review.") } label: { Label("Back to Storage", systemImage: "arrow.left") }.buttonStyle(SMMacButtonStyle(.quiet))
                Spacer()
                Brand()
                Spacer()
                Button { study.explain("Overview, Applications, AI sessions, History and Settings remain accessible from the app menu.") } label: { Image(systemName: "ellipsis").frame(width: 100) }.buttonStyle(SMMacButtonStyle(.quiet)).accessibilityLabel("App menu")
            }.padding(.horizontal, 28).frame(height: 64)
            Divider().overlay(Tone.hairline)
            GeometryReader { g in
                VStack(alignment: .leading, spacing: 0) {
                    HStack(alignment: .center, spacing: 28) {
                        VStack(alignment: .leading, spacing: 11) {
                            HStack(spacing: 10) { Circle().fill(Tone.mint).frame(width: 5, height: 5); Text("A LITTLE ROOM TO BUILD").tracking(1.6) }.font(Tone.type(10, .medium)).foregroundStyle(Tone.mint)
                            Text("Keep your projects.\nClear the leftovers.").font(Tone.heading(g.size.width < 950 ? 31 : 36)).tracking(-0.8).lineSpacing(1).fixedSize(horizontal: false, vertical: true)
                            Text("Review the folders that can leave this workspace.")
                                .font(Tone.type(13)).foregroundStyle(Tone.secondary)
                        }
                        Spacer(minLength: 0)
                        Image(nsImage: Art.image("Welcome")).resizable().scaledToFit().frame(width: g.size.width < 950 ? 135 : 190, height: 144).accessibilityHidden(true)
                    }.padding(.top, 28).padding(.bottom, 26)
                    HStack {
                        Text("\(study.selected.count) selected").font(Tone.type(12, .medium))
                        Text("/ \(study.snapshot.rows.count) folders").font(Tone.type(12)).foregroundStyle(Tone.secondary)
                        Spacer()
                        Text("\(study.size) on disk").font(Tone.type(12, .medium)).monospacedDigit().foregroundStyle(Tone.mint)
                        SMSearchField("Find a folder", text: $study.query, focus: $searching).frame(width: 200).padding(.leading, 8)
                    }.padding(.bottom, 13)
                    Divider().overlay(Tone.hairline)
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(study.rows) { f in
                                HStack(spacing: 19) {
                                    FolderCheck(folder: f)
                                    Text(String(format: "%02d", f.id + 1)).font(Tone.type(11)).monospacedDigit().foregroundStyle(Tone.secondary).frame(width: 20)
                                    VStack(alignment: .leading, spacing: 5) {
                                        Text(f.project).font(Tone.type(17, .medium)).lineLimit(1)
                                        Text("\(f.name) · SwiftPM output").font(Tone.type(11)).foregroundStyle(Tone.secondary)
                                    }.frame(maxWidth: .infinity, alignment: .leading).help(f.path)
                                    Text(f.size).font(Tone.type(15, .medium)).monospacedDigit()
                                    Button { study.inspected = f.id; study.details = true } label: { Image(systemName: "arrow.up.right").font(.system(size: 12)).frame(width: 30, height: 30) }.buttonStyle(.plain).foregroundStyle(Tone.secondary).accessibilityLabel("Inspect \(f.project)")
                                }.frame(height: 79).padding(.horizontal, 7)
                                Divider().overlay(Tone.hairline.opacity(0.65))
                            }
                        }
                        if study.rows.isEmpty { Text("No matching folders").foregroundStyle(Tone.secondary).padding(40) }
                    }.scrollIndicators(.hidden)
                    HStack(alignment: .center, spacing: 24) {
                        VStack(alignment: .leading, spacing: 6) {
                            Label("To Trash, after your review", systemImage: "trash").font(Tone.type(13, .medium))
                            Text("You can restore folders until Trash is emptied.").font(Tone.type(11)).foregroundStyle(Tone.secondary)
                        }
                        Spacer(minLength: 0)
                        ReviewButton()
                    }.padding(.top, 24).padding(.bottom, 15)
                    Text("Folder sizes include allocation that may be shared. Reclaimed space is checked separately.")
                        .font(Tone.type(10)).foregroundStyle(Tone.secondary).padding(.bottom, 21)
                }.frame(maxWidth: 850).padding(.horizontal, 40).frame(maxWidth: .infinity)
            }
        }.onReceive(NotificationCenter.default.publisher(for: .init("StudyFind"))) { _ in searching = true }
    }
}

struct Root: View {
    @StateObject private var study = Study()
    let direction: String
    var body: some View {
        VStack(spacing: 0) {
            Group {
                switch direction {
                case "B": StorageLedger()
                case "C": FocusedCleanup()
                default: ReviewDesk()
                }
            }.frame(maxWidth: .infinity, maxHeight: .infinity)
            HStack {
                Image(systemName: "eye")
                Text("Design preview · Real folder metadata · Cleanup disabled")
                Spacer()
                Text("Local to this Mac")
            }.font(Tone.type(10)).foregroundStyle(Tone.secondary).padding(.horizontal, 25).frame(height: 30)
                .overlay(alignment: .top) { Divider().overlay(Tone.hairline) }
        }.foregroundStyle(Tone.ink).font(Tone.type(13)).background(Color.black)
            .smTheme(Tone.palette).environmentObject(study).preferredColorScheme(.dark)
            .sheet(isPresented: $study.review) {
                VStack(alignment: .leading, spacing: 18) {
                    Label("Review your selection", systemImage: "checklist").font(Tone.heading(24))
                    Text("\(study.selectionSummary) · \(study.size) of folder allocation").foregroundStyle(Tone.secondary)
                    ForEach(study.chosen) { f in HStack { Text(f.project); Spacer(); Text(f.size).monospacedDigit() } }
                    Divider()
                    Text("This is a design preview. No folders will be moved or deleted. The app’s identity checks, review and confirmation remain required.").font(Tone.type(12)).foregroundStyle(Tone.secondary).lineSpacing(4)
                    HStack { Spacer(); Button("Back to review") { study.review = false }.buttonStyle(SMMacButtonStyle(.primary)).keyboardShortcut(.defaultAction) }
                }.padding(30).frame(width: 480).background(Color.black)
            }
            .sheet(isPresented: $study.details) {
                VStack(alignment: .leading, spacing: 16) {
                    Label(study.inspectedFolder.project, systemImage: "folder").font(Tone.heading(22))
                    Text(study.inspectedFolder.path).font(Tone.type(12)).foregroundStyle(Tone.secondary).textSelection(.enabled)
                    HStack { Text("Folder allocation"); Spacer(); Text(study.inspectedFolder.size).monospacedDigit() }
                    Divider()
                    Text("Swift package build output. Review local changes and active builds before cleanup. Folder size is measured metadata, not a promise of freed volume space.").font(Tone.type(12)).foregroundStyle(Tone.secondary).lineSpacing(4)
                    HStack { Spacer(); Button("Done") { study.details = false }.buttonStyle(SMMacButtonStyle(.primary)).keyboardShortcut(.defaultAction) }
                }.padding(30).frame(width: 480).background(Color.black)
            }
            .alert("Design preview", isPresented: Binding(get: { !study.notice.isEmpty }, set: { if !$0 { study.notice = "" } })) {
                Button("OK") { study.notice = "" }
            } message: { Text(study.notice) }
    }
}

@MainActor final class Delegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    func applicationDidFinishLaunching(_ notification: Notification) {
        let direction = value("direction") ?? "A"
        let width = Double(value("width") ?? "") ?? 1240
        let height = Double(value("height") ?? "") ?? 820
        window = NSWindow(contentRect: NSRect(x: 100, y: 100, width: width, height: height), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "storagedaddy · \(direction == "A" ? "A — Review desk" : direction == "B" ? "B — Storage ledger" : "C — Focused cleanup")"
        window.backgroundColor = .black
        window.titlebarAppearsTransparent = true
        window.appearance = NSAppearance(named: .darkAqua)
        window.contentMinSize = NSSize(width: 880, height: 680)
        window.isReleasedWhenClosed = false
        window.contentView = NSHostingView(rootView: Root(direction: direction))
        window.center(); window.makeKeyAndOrderFront(nil)
        NSApp.applicationIconImage = Art.image("StorageDaddy")
        NSApp.setActivationPolicy(.regular); NSApp.activate(ignoringOtherApps: true)
        let menu = NSMenu(); let app = NSMenuItem(); app.submenu = NSMenu()
        app.submenu?.addItem(withTitle: "Quit design study", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"); menu.addItem(app)
        let edit = NSMenuItem(); edit.submenu = NSMenu(title: "Edit")
        for (title, action, key) in [("Cut", #selector(NSText.cut(_:)), "x"), ("Copy", #selector(NSText.copy(_:)), "c"), ("Paste", #selector(NSText.paste(_:)), "v"), ("Select All", #selector(NSText.selectAll(_:)), "a")] {
            edit.submenu?.addItem(withTitle: title, action: action, keyEquivalent: key)
        }
        let find = NSMenuItem(title: "Find folders", action: #selector(findFolders), keyEquivalent: "f"); find.target = self; edit.submenu?.addItem(find); menu.addItem(edit)
        let designs = NSMenuItem(); designs.submenu = NSMenu(title: "Design")
        for (index, title) in ["A — Review desk", "B — Storage ledger", "C — Focused cleanup"].enumerated() {
            let item = NSMenuItem(title: title, action: #selector(chooseDirection(_:)), keyEquivalent: String(index + 1))
            item.tag = index; item.target = self; designs.submenu?.addItem(item)
        }
        menu.addItem(designs); NSApp.mainMenu = menu
    }
    @objc func findFolders() { NotificationCenter.default.post(name: .init("StudyFind"), object: nil) }
    @objc func chooseDirection(_ item: NSMenuItem) {
        guard (0..<3).contains(item.tag) else { return }
        let direction = ["A", "B", "C"][item.tag]
        let title = ["A — Review desk", "B — Storage ledger", "C — Focused cleanup"][item.tag]
        window.contentView = NSHostingView(rootView: Root(direction: direction))
        window.title = "storagedaddy · \(title)"
    }
    func value(_ key: String) -> String? { CommandLine.arguments.first { $0.hasPrefix("--\(key)=") }.map { String($0.dropFirst(key.count + 3)) } }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

@main enum CleanupDirections {
    static func main() {
        // Deliberately require an explicit, local metadata file. Never bundle private paths.
        guard let argument = CommandLine.arguments.first(where: { $0.hasPrefix("--metadata=") }),
              let data = try? Data(contentsOf: URL(fileURLWithPath: String(argument.dropFirst(11)))),
              let snapshot = try? JSONDecoder().decode(Snapshot.self, from: data),
              !snapshot.rows.isEmpty, Set(snapshot.rows.map(\.id)).count == snapshot.rows.count,
              snapshot.rows.allSatisfy({ $0.bytes >= 0 }), snapshot.capacity > 0,
              (0...snapshot.capacity).contains(snapshot.available) else {
            FileHandle.standardError.write(Data("Provide --metadata=/absolute/path/to/folder-metadata.json with measured, nonempty folder metadata.\n".utf8))
            exit(2)
        }
        Input.snapshot = snapshot
        let app = NSApplication.shared; let delegate = Delegate(); app.delegate = delegate
        withExtendedLifetime(delegate) { app.run() }
    }
}

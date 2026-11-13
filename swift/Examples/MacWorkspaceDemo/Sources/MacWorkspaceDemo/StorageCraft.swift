import AppKit
import SwiftUI
import SaaSMakerUI

private struct DemoFolder: Identifiable {
    let id: String
    var folder: String
    var project: String
    let bytes: Int64
    let category: String
    var size: String { ByteCountFormatter.string(fromByteCount: bytes, countStyle: .file) }
}

@MainActor struct StorageCraft: View {
    @State private var query = CommandLine.arguments.contains("--empty-search") ? "nothing-matches" : ""
    @State private var selected: Set<String> = CommandLine.arguments.contains("--empty-selection") ? [] : ["website", "api"]
    @State private var details = false
    @State private var notice = ""
    @FocusState private var searching: Bool
    private var rows: [DemoFolder] {
        let examples: [DemoFolder] = [
            .init(id: "website", folder: "node_modules", project: "fleet / website", bytes: 1_200_000_000, category: "Dependencies"),
            .init(id: "api", folder: ".build", project: "fleet / api", bytes: 846_000_000, category: "Build output"),
            .init(id: "dashboard", folder: ".next", project: "fleet / dashboard", bytes: 312_000_000, category: "Build output"),
            .init(id: "tools", folder: "__pycache__", project: "fleet / tools", bytes: 24_000_000, category: "Python cache")
        ]
        return examples.map { row in
            var row = row
            if CommandLine.arguments.contains("--long-content"), row.id == "website" {
                row.folder = "node_modules_with_a_very_long_local_folder_name_for_layout_review"
                row.project = "fleet / website / packages / internationalized-application-and-component-library"
            }
            return row
        }
    }
    private var filteredRows: [DemoFolder] {
        rows.filter { query.isEmpty || ($0.folder + $0.project + $0.category).localizedCaseInsensitiveContains(query) }
    }
    private var selectedBytes: Int64 {
        rows.filter { selected.contains($0.id) }.reduce(0) { $0 + $1.bytes }
    }
    private var palette: SMPalette {
        .fromApp(background: Ink.canvas, foreground: Ink.primary, card: Ink.pane,
                 border: Ink.line, brand: Ink.mint, brandForeground: Ink.light ? .white : .black,
                 surface: Ink.raised, mutedForeground: Ink.secondary, radius: 7,
                 sansFont: "Geist", displayFont: "Figtree", isDark: !Ink.light)
    }

    var body: some View {
        HStack(spacing: 0) {
            sidebar.frame(width: 200)
            Rectangle().fill(Ink.line).frame(width: 1)
            VStack(spacing: 0) {
                HStack {
                    Label("Macintosh HD", systemImage: "internaldrive").font(.system(size: 12)).foregroundStyle(Ink.secondary)
                    Spacer()
                    Text("Component preview").font(.custom("Geist", size: 11)).foregroundStyle(Ink.secondary)
                }.padding(.horizontal, 32).frame(height: 48)
                Rectangle().fill(Ink.line).frame(height: 1)
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        SMWorkspaceHeader("Quick cleanup", subtitle: "Review caches, dependencies and build outputs.") {
                            artwork.frame(width: 92, height: 76)
                        }
                        HStack(spacing: 8) {
                            Image(systemName: "folder").foregroundStyle(Ink.mint)
                            Text("fleet").fontWeight(.medium)
                            Spacer()
                            Button { notice = "This preview uses sample folders. Open StorageDaddy to scan your files." } label: { Label("Scan a folder", systemImage: "folder.badge.plus") }
                        }.font(.custom("Geist", size: 12))
                        VStack(alignment: .leading, spacing: 14) {
                            HStack {
                                Text("Rebuildable folders").font(.custom("Geist", size: 14).weight(.semibold))
                                Text(query.isEmpty ? "\(rows.count)" : "\(filteredRows.count) of \(rows.count)")
                                    .font(.custom("Geist", size: 12).monospacedDigit()).foregroundStyle(Ink.secondary)
                                Spacer()
                                let visibleIDs = Set(filteredRows.map(\.id))
                                let allVisibleSelected = !visibleIDs.isEmpty && visibleIDs.isSubset(of: selected)
                                Button(allVisibleSelected ? "Deselect all" : "Select all") {
                                    if allVisibleSelected { selected.subtract(visibleIDs) }
                                    else { selected.formUnion(visibleIDs) }
                                }.buttonStyle(SMMacButtonStyle(.quiet)).disabled(visibleIDs.isEmpty)
                            }
                            SMSearchField("Filter folders or projects", text: $query, focus: $searching)
                            SMSettingsGroup {
                                if filteredRows.isEmpty {
                                    VStack(spacing: 8) {
                                        Image(systemName: "magnifyingglass").font(.system(size: 22)).foregroundStyle(Ink.secondary)
                                        Text("No matching folders").font(.system(size: 14, weight: .medium))
                                        Text("Try a project name or folder type.").font(.system(size: 12)).foregroundStyle(Ink.secondary)
                                    }.frame(maxWidth: .infinity).padding(32)
                                }
                                ForEach(Array(filteredRows.enumerated()), id: \.element.id) { index, row in
                                    candidate(row)
                                    if index < filteredRows.count - 1 { Rectangle().fill(Ink.line).frame(height: 1).padding(.leading, 56) }
                                }
                            }
                            Label("Review local changes before cleaning up. Downloads or rebuilds may be needed.", systemImage: "info.circle")
                                .font(.custom("Geist", size: 12)).foregroundStyle(Ink.secondary).fixedSize(horizontal: false, vertical: true)
                        }
                        SMSettingsGroup("Cleanup details", footer: "You’ll review the final selection before anything is moved.") {
                            SMSettingsRow("Recovery", subtitle: "Items moved to Trash can be restored until it is emptied.") {
                                Label("Trash", systemImage: "trash").font(.custom("Geist", size: 12)).foregroundStyle(Ink.secondary)
                            }
                            Rectangle().fill(Ink.line).frame(height: 1).padding(.leading, 16)
                            SMSettingsRow("Storage details", subtitle: "See how sizes are measured.") {
                                Button(details ? "Hide details" : "Show details") { details.toggle() }
                            }
                            if details {
                                Text("Folder sizes show allocated bytes. Shared APFS storage can make the space recovered smaller than the displayed total.")
                                    .font(.system(size: 12)).foregroundStyle(Ink.secondary)
                                    .padding(.horizontal, 16).padding(.bottom, 16).fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }.padding(32).frame(maxWidth: .infinity, alignment: .leading)
                }
                actionBar
            }
        }
        .buttonStyle(SMMacButtonStyle())
        .smTheme(palette)
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("MacLabFocusSearch"))) { _ in searching = true }
        .alert("Preview only", isPresented: Binding(get: { !notice.isEmpty }, set: { if !$0 { notice = "" } })) {
            Button("OK") { notice = "" }
        } message: { Text(notice) }
    }

    private var artwork: some View {
        GeometryReader { g in
            if let image = DemoAssets.doodles {
                Image(nsImage: image).resizable().interpolation(.high)
                    .frame(width: g.size.width * 3, height: g.size.height * 3)
                    .offset(y: -2 * g.size.height)
            }
        }.environment(\.layoutDirection, .leftToRight).clipped()
            .background(Ink.light ? Color.black : .clear, in: RoundedRectangle(cornerRadius: 8))
            .accessibilityHidden(true)
    }

    private func candidate(_ row: DemoFolder) -> some View {
        SMResourceRow(row.folder, subtitle: row.project, systemImage: "folder") {
            Toggle(row.folder, isOn: Binding(get: { selected.contains(row.id) }, set: {
                if $0 { selected.insert(row.id) } else { selected.remove(row.id) }
            })).labelsHidden().toggleStyle(.checkbox).accessibilityLabel("Select \(row.folder) in \(row.project)")
        } trailing: {
            VStack(alignment: .trailing, spacing: 5) {
                Text(row.size).font(.custom("Geist", size: 14).weight(.medium).monospacedDigit())
                Text(row.category).font(.custom("Geist", size: 11)).foregroundStyle(Ink.secondary)
            }
        }
    }

    private var actionBar: some View {
        let count = selected.count
        let size = ByteCountFormatter.string(fromByteCount: selectedBytes, countStyle: .file)
        return SMSelectionBar(count == 0 ? "No folders selected" : "\(count) \(count == 1 ? "folder" : "folders") selected · \(size)",
                              detail: "Illustrative preview · no files will be moved", horizontalPadding: 32) {
            Button { notice = "This is a visual preview. No files have been moved." } label: {
                HStack(spacing: 8) { Text("Review selection"); Image(systemName: "arrow.forward") }
            }.buttonStyle(SMMacButtonStyle(.primary)).keyboardShortcut(.defaultAction).disabled(selected.isEmpty)
        }
    }

    private var sidebar: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 9) {
                if let image = DemoAssets.icon {
                    Image(nsImage: image).resizable().scaledToFit().frame(width: 32, height: 32)
                }
                Text("storagedaddy").font(.custom("Figtree", size: 17).weight(.semibold)).tracking(-0.5)
            }.padding(.horizontal, 18).padding(.top, 24).padding(.bottom, 32)
            ForEach([( "Overview", "square.grid.2x2"), ("Explore storage", "internaldrive"), ("Quick cleanup", "sparkles"), ("Projects", "folder"), ("App data", "app.badge")], id: \.0) { title, icon in
                HStack(spacing: 11) {
                    Image(systemName: icon).frame(width: 18)
                    Text(title).font(.custom("Geist", size: 13).weight(title == "Quick cleanup" ? .medium : .regular))
                    Spacer()
                }.foregroundStyle(title == "Quick cleanup" ? Ink.mint : Ink.secondary)
                    .padding(.horizontal, 12).frame(height: 38)
                    .background(title == "Quick cleanup" ? Ink.selected : .clear, in: RoundedRectangle(cornerRadius: 7))
                    .padding(.horizontal, 10).padding(.bottom, 4)
            }
            Spacer()
            Label("On this Mac", systemImage: "lock")
                .font(.custom("Geist", size: 11)).foregroundStyle(Ink.secondary).padding(20)
        }.frame(maxHeight: .infinity).background(Ink.canvas)
    }
}

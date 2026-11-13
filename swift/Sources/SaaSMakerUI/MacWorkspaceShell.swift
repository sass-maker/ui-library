#if os(macOS)
import SwiftUI
import AppKit

extension View {
    /// Match a SwiftUI scene's native title bar and window canvas to its workspace palette.
    public func smWorkspaceWindowChrome() -> some View {
        modifier(WorkspaceWindowChromeModifier())
    }
}

private struct WorkspaceWindowChromeModifier: ViewModifier {
    @Environment(\.smPalette) private var p
    func body(content: Content) -> some View {
        content.background(SMWorkspaceWindowChrome())
            .toolbarBackground(p.background, for: .windowToolbar)
            .toolbarBackground(.visible, for: .windowToolbar)
    }
}

/// An AppKit canvas bridge. SwiftUI scenes should use `smWorkspaceWindowChrome()`
/// so the scene also receives its native toolbar background preferences.
public struct SMWorkspaceWindowChrome: NSViewRepresentable {
    @Environment(\.smPalette) private var p
    public init() {}
    public func makeNSView(context: Context) -> NSView { WorkspaceWindowView() }
    public func updateNSView(_ view: NSView, context: Context) {
        guard let view = view as? WorkspaceWindowView else { return }
        view.canvas = p.background
        view.apply()
    }
}

private final class WorkspaceWindowView: NSView {
    var canvas = Color(nsColor: .windowBackgroundColor)
    private var appliedCanvas: Color?
    private weak var appliedWindow: NSWindow?
    override func viewDidMoveToWindow() { super.viewDidMoveToWindow(); apply() }
    func apply() {
        guard let window else { return }
        if !window.titlebarAppearsTransparent { window.titlebarAppearsTransparent = true }
        if appliedWindow !== window || appliedCanvas != canvas {
            window.backgroundColor = NSColor(canvas)
            appliedWindow = window
            appliedCanvas = canvas
        }
    }
}

/// A persistent desktop rail. Product navigation, state and imagery belong to the caller.
public struct SMWorkspaceSidebar<Brand: View, Navigation: View, Footer: View>: View {
    @Environment(\.smPalette) private var p
    private let width: CGFloat
    private let brand: Brand
    private let navigation: Navigation
    private let footer: Footer

    public init(width: CGFloat = 198, @ViewBuilder brand: () -> Brand,
                @ViewBuilder navigation: () -> Navigation, @ViewBuilder footer: () -> Footer) {
        self.width = width
        self.brand = brand(); self.navigation = navigation(); self.footer = footer()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            brand.padding(.bottom, 34)
            ScrollView {
                VStack(alignment: .leading, spacing: 4) { navigation }
                    .frame(maxWidth: .infinity, alignment: .leading)
            }.scrollIndicators(.hidden)
            footer.padding(.top, 24)
        }
        .padding(.horizontal, 18).padding(.top, 30).padding(.bottom, 24)
        .frame(width: width).frame(maxHeight: .infinity)
        .background(p.background)
        .overlay(alignment: .trailing) { Rectangle().fill(p.border).frame(width: 1).accessibilityHidden(true) }
    }
}

/// Full-width native navigation with explicit selection and a quiet hover state.
public struct SMWorkspaceNavigationItem: View {
    @Environment(\.smPalette) private var p
    @Environment(\.isEnabled) private var enabled
    @State private var hovering = false
    @FocusState private var focused: Bool
    private let title: String
    private let systemImage: String
    private let isSelected: Bool
    private let badge: String?
    private let action: () -> Void

    public init(_ title: String, systemImage: String, isSelected: Bool,
                badge: String? = nil, action: @escaping () -> Void) {
        self.title = title; self.systemImage = systemImage; self.isSelected = isSelected
        self.badge = badge; self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: 11) {
                Image(systemName: systemImage).font(.system(size: 14)).frame(width: 18).accessibilityHidden(true)
                Text(title).font(.custom(p.sansFont, size: 13).weight(isSelected ? .medium : .regular))
                    .lineLimit(1).truncationMode(.tail)
                Spacer(minLength: 4)
                if let badge { Text(badge).font(.custom(p.sansFont, size: 11)).monospacedDigit() }
            }
            .foregroundStyle(isSelected ? p.brand : p.mutedForeground)
            .padding(.horizontal, 10).frame(minHeight: 39)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(isSelected ? p.brand.opacity(0.10) : hovering && enabled ? p.foreground.opacity(0.045) : .clear,
                        in: RoundedRectangle(cornerRadius: 7))
            .contentShape(RoundedRectangle(cornerRadius: 7))
        }
        .buttonStyle(.plain).focused($focused).onHover { hovering = $0 }
        .overlay(RoundedRectangle(cornerRadius: 9).strokeBorder(focused ? p.brand : .clear, lineWidth: 2).padding(-2))
        .opacity(enabled ? 1 : 0.4)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .help(title)
    }
}

/// A quiet scope line below the native title bar, with caller-owned actions.
public struct SMWorkspaceScopeBar<Actions: View>: View {
    @Environment(\.smPalette) private var p
    private let title: String
    private let systemImage: String?
    private let detail: String?
    private let actions: Actions

    public init(_ title: String, systemImage: String? = nil, detail: String? = nil,
                @ViewBuilder actions: () -> Actions) {
        self.title = title; self.systemImage = systemImage; self.detail = detail; self.actions = actions()
    }

    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) {
                label
                Spacer(minLength: 16)
                if let detail { Text(detail).font(.custom(p.sansFont, size: 11)).foregroundStyle(p.mutedForeground) }
                actions.fixedSize(horizontal: true, vertical: false)
            }
            VStack(alignment: .leading, spacing: 10) {
                HStack { label; Spacer(minLength: 12); actions }
                if let detail { Text(detail).font(.custom(p.sansFont, size: 11)).foregroundStyle(p.mutedForeground) }
            }
        }
        .padding(.horizontal, 30).padding(.vertical, 10).frame(minHeight: 52)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(p.background)
        .overlay(alignment: .bottom) { Rectangle().fill(p.border).frame(height: 1).accessibilityHidden(true) }
    }

    private var label: some View {
        HStack(spacing: 9) {
            if let systemImage { Image(systemName: systemImage).foregroundStyle(p.mutedForeground).accessibilityHidden(true) }
            Text(title).font(.custom(p.sansFont, size: 12).weight(.medium)).foregroundStyle(p.foreground)
        }
    }
}
#endif

import SwiftUI

/// Motion presets shared with the web (@saas-maker/motion): quiet, one move
/// per element, no bounce. All respect Reduce Motion.
public enum SMMotion {
    /// Entrances and reveals (web: 0.9s, ease [0.22, 0.8, 0.24, 1]).
    public static let reveal = Animation.timingCurve(0.22, 0.8, 0.24, 1, duration: 0.9)
    /// Small state changes: toggles, selection.
    public static let state = Animation.smooth(duration: 0.3)
    /// Button press feedback.
    public static let press = Animation.smooth(duration: 0.15)
}

private struct SMReveal: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduce
    func body(content: Content) -> some View {
        if reduce {
            content
        } else {
            // Like .motion-reveal: fades and rises as it scrolls into view.
            content.scrollTransition(.animated(SMMotion.reveal).threshold(.visible(0.15))) { view, phase in
                view.opacity(phase.isIdentity ? 1 : 0).offset(y: phase.isIdentity ? 0 : 32)
            }
        }
    }
}

private struct SMZoom: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduce
    func body(content: Content) -> some View {
        if reduce {
            content
        } else {
            // Like .motion-zoom: the scale jump, growing to full size as it centers.
            content.scrollTransition(.interactive, axis: .vertical) { view, phase in
                view.scaleEffect(phase.value < 0 ? 0.82 + 0.18 * (1 + phase.value) : 1, anchor: .top)
            }
        }
    }
}

extension View {
    /// Fade and rise into view on scroll. Use only on views inside a ScrollView:
    /// outside one there is no scroll phase and the view stays hidden.
    public func smReveal() -> some View { modifier(SMReveal()) }
    /// Grow from 82% to full size while scrolling into the center (inside a ScrollView).
    public func smZoom() -> some View { modifier(SMZoom()) }
}

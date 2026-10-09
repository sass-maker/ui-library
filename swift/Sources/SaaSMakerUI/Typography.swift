import SwiftUI

/// Type roles shared with the web: display (headlines), accent (the emphasized
/// phrase), text (ledes and captions), eyebrow and mono. System faces stand in
/// for the web fonts: SF for Instrument Sans and Geist, New York for Newsreader.
public enum SMType {
    case display(CGFloat)
    case text(CGFloat)
    case eyebrow
    case mono(CGFloat)

    func font(_ p: SMPalette) -> Font {
        switch self {
        case .display(let size):
            return .system(size: size, weight: Font.Weight(css: p.displayWeight), design: p.displaySerif ? .serif : .default)
        case .text(let size):
            return .system(size: size, design: p.textSerif ? .serif : .default)
        case .eyebrow:
            return .system(size: 13, weight: .semibold)
        case .mono(let size):
            return .system(size: size, design: .monospaced)
        }
    }
}

extension Font.Weight {
    init(css weight: Double) {
        switch weight {
        case ..<350: self = .light
        case ..<450: self = .regular
        case ..<550: self = .medium
        case ..<650: self = .semibold
        case ..<750: self = .bold
        default: self = .heavy
        }
    }
}

/// A headline with an optional accent phrase, the native twin of `*phrase*` in content files.
public struct SMDisplay: View {
    @Environment(\.smPalette) private var p
    private let text: String
    private let accent: String?
    private let size: CGFloat

    public init(_ text: String, accent: String? = nil, size: CGFloat = 40) {
        self.text = text
        self.accent = accent
        self.size = size
    }

    public var body: some View {
        var lead = AttributedString(text)
        lead.foregroundColor = p.foreground
        var line = lead
        if let accent {
            var tail = AttributedString(" " + accent)
            tail.foregroundColor = p.accentInk
            let accentFont: Font = p.accentSerif && !p.displaySerif
                ? .system(size: size, weight: .regular, design: .serif)
                : SMType.display(size).font(p)
            tail.font = p.accentItalic ? accentFont.italic() : accentFont
            line += tail
        }
        return Text(line)
            .font(SMType.display(size).font(p))
            .tracking(size * p.displayTracking)
            .lineSpacing(0)
            .fixedSize(horizontal: false, vertical: true)
    }
}

/// Small brand-colored label above a headline.
public struct SMEyebrow: View {
    @Environment(\.smPalette) private var p
    private let text: String
    public init(_ text: String) { self.text = text }
    public var body: some View {
        Text(text).font(SMType.eyebrow.font(p)).foregroundStyle(p.brand)
    }
}

/// Supporting paragraph under a headline.
public struct SMLede: View {
    @Environment(\.smPalette) private var p
    private let text: String
    public init(_ text: String) { self.text = text }
    public var body: some View {
        Text(text)
            .font(SMType.text(19).font(p))
            .foregroundStyle(p.mutedForeground)
            .lineSpacing(4)
            .fixedSize(horizontal: false, vertical: true)
    }
}

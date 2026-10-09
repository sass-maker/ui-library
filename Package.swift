// swift-tools-version: 6.0
// SaaS Maker UI for Mac and iOS: the same theme presets, type roles and motion
// as the web packages. Colors are generated from the web theme
// (pnpm tokens:build), so web and Apple stay one design system.
import PackageDescription

let package = Package(
    name: "SaaSMakerUI",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "SaaSMakerUI", targets: ["SaaSMakerUI"]),
    ],
    targets: [
        .target(name: "SaaSMakerUI", path: "swift/Sources/SaaSMakerUI"),
        .testTarget(name: "SaaSMakerUITests", dependencies: ["SaaSMakerUI"], path: "swift/Tests/SaaSMakerUITests"),
    ]
)

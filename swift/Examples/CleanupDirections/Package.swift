// swift-tools-version: 6.0
import PackageDescription

let package = Package(name: "CleanupDirections", platforms: [.macOS(.v14)],
    dependencies: [.package(name: "SharedUI", path: "../../..")],
    targets: [.executableTarget(name: "CleanupDirections", dependencies: [
        .product(name: "SaaSMakerUI", package: "SharedUI")
    ], resources: [.copy("Assets")])])

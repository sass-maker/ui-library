// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "MacWorkspaceDemo",
    platforms: [.macOS(.v14)],
    dependencies: [.package(name: "SharedUI", path: "../../..")],
    targets: [.executableTarget(name: "MacWorkspaceDemo", dependencies: [
        .product(name: "SaaSMakerUI", package: "SharedUI")
    ], resources: [.copy("Assets")])]
)

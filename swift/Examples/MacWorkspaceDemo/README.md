# Mac workspace example

A real SwiftUI window composing the shared Mac controls into StorageDaddy’s
cleanup screen. Folder names and sizes are illustrative. This example never
scans, moves or deletes files; selection and search stay in memory.

Run with XcodeBuildMCP’s `swift-package run`, using this directory as
`packagePath`, `MacWorkspaceDemo` as `executableName`, and `background: true`.

The default is the Daddy apps’ black and mint appearance. Optional launch
arguments support visual checks:

- `--width=880 --height=720`: minimum window composition.
- `--empty-selection`: disabled primary action.
- `--empty-search`: no matching folders.
- `--long-content`: long folder and project names.
- `--light`, `--large-text`, `--rtl`: library adaptation checks.

Cmd-F focuses search; Escape clears it. The native Edit menu supports normal
text editing. Checkboxes, Select all, Clear search and Show details work.
The scan and review actions explicitly report that they are preview actions.

`StorageCraft.swift` owns example data, selection, actions and composition.
`SaaSMakerUI/MacWorkspace.swift` owns the reusable components. The example uses
the existing StorageDaddy artwork and icon from the Fleet product, without
copying third-party source or assets. It is not an installed app or a release.

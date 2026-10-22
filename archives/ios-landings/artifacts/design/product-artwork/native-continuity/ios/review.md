# Current iPhone landing/app continuity

Reviewer: Codex root. Captured 2026-10-02. Design lane: preserve the selected
Living Memory Book direction. This is landing continuity verification, not an
App Store release, a physical-device acceptance test, or an invitation to a beta.

The exposed MCP session had no simulator workflows. The already-installed
official XcodeBuildMCP 2.7.0 CLI exposed those workflows and performed all four
build-and-run operations. No raw xcodebuild/simctl command was used. Its JSON
results, observed runtime UI snapshots, screenshots and current source SHAs are
retained here. All four native source worktrees were clean at capture time.
No native source was edited. CUA set the numeric native fields because the CLI
reported successful text injection without changing those fields; every actual
transition was verified from a subsequent runtime snapshot.

## Kith

- Current source: `8b85d555839f125237f3e00af79c49c2da775280`.
- Project/scheme: `kith/ios/Kith.xcodeproj`, Kith, Debug.
- Simulator: Anchor Evidence Stable iPhone 20260828, iOS 26.5,
  `28E413D9-B587-41D3-9D7C-3D903BC6F842`.
- Existing `--onboarding-demo` starts an empty synthetic document, suppresses
  cloud/account work and skips store writes. The native source explicitly guards
  saves with `isDemoLaunch`; this is an in-memory traversal, not persistence proof.
- Observed: current illustrated welcome; entered Demo Friend; retained the
  explicit closeness 3; placed the person; entered a synthetic note; saved it;
  reached “Your constellation has begun”; opened Kith.
- Evidence: `kith-onboarding.jpg`, `kith-note.jpg`, `kith-first-value.jpg`,
  `kith-enter-note.json`, `kith-save-note.json`, `kith-value-state.json`,
  `kith-open.json`. Build/run result is copied as `kith-build-run.json`.
- Continuity: clay lantern actions, warm paper surfaces, rounded native text,
  person/closeness/notes vocabulary and device-first language agree with the
  landing. The landing adds a coastal narrative photograph; the app uses its
  own illustrated lanterns and compact operational layout.

## Setline

- Current source: `ccc3815df4640e72a77e41b707364c9d2157bdfb`.
- Project/scheme: `setline/ios/Setline.xcodeproj`, Setline, Debug; same iPhone.
- Existing `--ui-persistent-fixture F20C972E-E8E2-42AA-A48F-0A9527DB08B0`
  creates its own temporary document/preferences and inert rest notifier.
  A launch-only UserDefaults argument sets the onboarding completion flag to
  NO, allowing the actual orientation on that fixture. No personal programme
  was changed and no notification permission was requested.
- Observed: “Follow the plan. Record the truth”; reviewed the bundled programme;
  returned to the fixture's existing authored programme; started Lower strength;
  entered synthetic actuals of 8 reps and 40 kg; recorded one set; reached the
  authored 60-second rest and the next exercise in authored order.
- Evidence: `setline-build-run.json`, `setline-onboarding.jpg`,
  `setline-programme.json`, `setline-start.json`, `setline-ready.json`,
  `setline-record-set.json`, `setline-first-value-state.json`,
  `setline-first-value.jpg`.
- Continuity: ink/chalk hierarchy, lime execution/rest signal and prominent
  numerals match the landing and training-bench illustration. The current app
  also uses blue supporting controls. The landing never presents the authored
  target as an actual result; this run visibly separates both.

## Calorie

- Current source: `1651e689472b500b89edebbc49175c1ffac7cae8`.
- Project/scheme: `calorie/ios/Calorie.xcodeproj`, Calorie, Debug.
- Simulator: Calorie Audit 20261002, iOS 26.5,
  `2D964895-251F-4FF5-A7BA-A3B1CE104C1E`.
- Existing `--persistent-ui-fixture E3CD79DF-CDE2-47D1-B5B0-287C83336745`
  gives this run its own document and preference suite.
- Observed: illustrated welcome; chose first log; explicitly left targets unset;
  entered “Synthetic test meal”, 1 serving, 300 kcal and explicit zero values for
  protein/carbs/fibre; saved; saw the resulting 300 kcal total; opened Today,
  which showed the one synthetic entry and an unavailable target-based score.
  These numbers are test input, not nutrition advice or measured food values.
- Evidence: `calorie-build-run.json`, `calorie-onboarding.jpg`,
  `calorie-no-target.json`, `calorie-save-ready.json`, `calorie-first-log.json`,
  `calorie-first-value.jpg`, `calorie-today.json`, `calorie-today.jpg`.
- Continuity: moss/leaf action colours, rounded readable journal surfaces and
  kcal/gram vocabulary match the ordinary-meal illustration and landing. The
  photograph carries no health outcome or nutritional measurement claim.

## Motion

- Current source: `9e18903e0f5b6388019899a2f2160f2ef3a38b73`.
- Workspace/scheme: `motion/ios/Motion.xcworkspace`, Motion, Debug.
- Simulator: Maestro_IOS_iPhone-17-Pro_26, iOS 26.5,
  `127D7C7E-7BE8-4E38-BA9B-778770E01577`.
- Existing `--synthetic-pose` supplies fabricated moving joints without camera
  frames or permissions. It automatically enters the bundled game initially.
  Closed the game, observed native “Tracking you / Synthetic test pose / Start”,
  then tapped Start and observed the native WKWebView game again. The synthetic
  clap can also advance setup rapidly; the file named `motion-setup.jpg` captures
  the subsequent game, not the brief setup screen. `motion-close.json` is the
  actual observed setup UI; no setup screenshot is claimed.
- Evidence: `motion-build-run.json`, `motion-close.json`,
  `motion-start-game.json`, `motion-first-value.jpg`, `motion-running-game.jpg`.
- Continuity: dark arcade canvas and teal signal/actions match the landing. The
  current bundled default is a slicing game; the retained landing capture is
  explicitly Motion Maker in an internal build, and the native source retains
  Motion Maker. The material arcade scene illustrates trajectory and obstacles,
  not a claimed capture of the current default game. Current synthetic game
  output reached a results state. No synthetic score is used as marketing proof.
- Remaining limitation: simulator evidence cannot qualify physical camera
  tracking, movement control feel, recording, or TV mirroring. Those are native
  product acceptance checks, not newly completed capabilities in this change.

## Public availability and handoff boundary

The four actual landing CTA clicks are separately retained in
`../../cta-handoff.json`: each reaches its honest native beta-status page.
There is no public invitation to follow further. This is the complete currently
applicable public route, not a broken install link. Native onboarding/first-value
verification above uses current independently buildable internal apps and named
safe fixtures; it does not claim that an anonymous landing visitor can install
these beta builds. Calorie's existing Worker remains outside factory deployment.

No new identity, vocabulary or capability contradiction was found. The current
paired render comparison closes the old missing-current-native-evidence finding
for these four products. The availability and physical-device limitations remain
explicit, and do not become fabricated public release or device acceptance proof.

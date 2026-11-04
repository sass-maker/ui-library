# Shared native interactions

Native Cook (https://github.com/Native-Cook/native-cook) is the owner's craft
reference for Fleet Swift work going forward. Aim for the same care in the
rendered result: deliberate visual hierarchy, continuous interruptible motion,
tactile feedback and complete interaction states. A source import or passing
build does not establish comparable visual quality.

- Start with `SaaSMakerUI` components. Put reusable interactions here so future
  Fleet apps can adopt them through the shared package. Product-specific copy,
  data, selection and persistence stay in the app.
- Preserve each product's established direction. Use `smPalette`, bundled type
  roles and `SMMotion`; avoid hardcoded product colors or per-app component forks.
- `SMSegmentedControl` handles compact mode selection. `SMChoiceCard` handles
  choices with explanatory detail. Both use caller-owned bindings and stable
  identities. Extend these before creating another selection implementation.
- Study reference Swift implementations selectively. Before copying source or
  assets, check the exact upstream license and preserve required attribution.
  The initial selection components are original implementations, with no
  vendored Native Cook source or artwork.
- Use native buttons and expose labels, selected and disabled states. Support
  long labels, right-to-left layout, Dynamic Type, keyboard and VoiceOver use.
  Respect Reduce Motion and avoid idle animation loops.
- Review real native renders at phone, tablet and desktop sizes in light/dark
  appearances, including larger text and disabled states. Exercise interaction
  behavior in a native host. Report device, keyboard or VoiceOver checks that
  were not actually performed.
- Keep additions compatible with iOS 17 and macOS 14. A library change does not
  upgrade apps pinned to older versions. Adopt a reviewed revision when working
  on the relevant app; verify that app before claiming rollout.

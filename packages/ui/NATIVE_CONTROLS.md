# Native controls

Use the existing React `Button`, `Input`, `Textarea` and `Table` components by
default. When a consumer needs the browser interface, import from
`@saas-maker/ui/components/native-controls` (also `atoms/native-controls`):

- `NativeSelect`: native options, multiple selection, validation and change events.
- `NativeDisclosure` with a first-child `NativeSummary`: native details/open behavior.
- `NativeDialog`: an `HTMLDialogElement` ref with `showModal()`, `close()`, native
  cancel/close events and `method="dialog"` forms. The consumer provides labels.
- `NativeProgress`: native `max` and `value`; omit `value` for indeterminate state.
- `NativeInput`: alias of `Input`, including native checkbox/radio/file interfaces.
  Checkbox and radio inputs retain intrinsic small geometry rather than text-field
  width and padding. Group/label them normally; no state is owned by the library.

All wrappers accept the full native React props, children and React 19 refs.
Native APIs, browser defaults, form state and validation remain native. The library
does not turn a native select into a custom listbox or a progress value into a
percentage. Browser keyboard and accessibility behavior remain in force.

## Imperative DOM

```ts
import { createUiControl } from "@saas-maker/ui/lib/dom-controls"

const save = createUiControl("button", { type: "button", class: "mt-2" }, ["Save"], {
  variant: "outline", size: "sm", document,
})
save.addEventListener("click", onSave)
```

`createUiControl(tag, attributes = {}, children = [], options = {})` constructs
the native element and applies the shared `nativeControlStyles` contract. It
returns the exact native element type. `createNativeControl(document, tag, ... )`
is the explicit-document form. Imports never read global DOM/browser state;
construction uses `options.document` or the current global document.

Supported tags: `button`, `a`, `input`, `textarea`, `select`, `details`, `summary`,
`dialog`, `progress`, `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `caption`.
Action/navigation anchors use the shared button variants (`link` by default;
`ghost` or `outline` can be selected). `variant` and `size` apply to button/anchor
actions. Other tags have native geometry. A native table has no extra wrapper;
place it in an overflow container if the surrounding layout requires one.

Attributes and existing child nodes are retained. `class` and `options.className`
merge with the library classes. Null/undefined attributes are omitted; boolean
false omits HTML boolean attributes while ARIA/data false becomes `"false"`.
String attributes retain normal `setAttribute` semantics, including `disabled: ""`.
No default `type`, `value`, `open`, role or event handler is invented. Attach
listeners or set live properties on the returned element normally. Set an input's
`type` at construction so its initial style matches its native interface.

Ordinary layout/text (`div`, `span`, headings, paragraphs), options/optgroups,
forms and labels are not controls supplied by this adapter. Create them normally
and pass them as children. A summary is a disclosure part, not a separate widget.
Badges and empty states use the existing components; arbitrary nodes cannot become
shared UI by adding a marker. Unsupported tags are rejected at type and runtime.

Load the normal shared theme/utilities and include the installed UI sources in
Tailwind scanning, as with the React components. No additional CSS/runtime or
global mutation is installed by this adapter. `data-slot` attributes identify
library markup; the library-owned construction and shared styles are the API.

Established Button/Input/Textarea/Table style literals remain in their original
component modules for consumers with existing narrow Tailwind sources. New native
controls additionally need `src/lib/native-control-styles.ts`; the shared Console
and Workbench CSS source entrypoints already include it.

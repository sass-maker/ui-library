import type {Meta,StoryObj} from '@storybook/react-vite';
const meta={title:'Native/SwiftUI',parameters:{docs:{description:{component:'Native components run in SwiftUI, not the browser. This page documents the existing native package; it does not simulate native rendering.'}}}} satisfies Meta;export default meta;
export const Package:StoryObj={render:()=> <main className="example-shell"><div className="story-stack"><p className="example-breadcrumb">Native <span aria-hidden>/</span> SwiftUI</p><h1 className="text-3xl font-semibold">SaaSMakerUI for Apple platforms</h1><p className="text-muted-foreground">Add the public repository as a Swift package. Shared generated tokens power the native palette and type roles.</p><pre className="story-panel overflow-auto text-sm"><code>{`import SaaSMakerUI

Button("Save changes") { save() }
    .buttonStyle(SMButtonStyle(.brand))

SMCard {
    SMSectionHeader("Workspace")
    SMStatusPill("Ready")
}`}</code></pre><ul className="list-inside list-disc text-sm leading-7 text-muted-foreground"><li>Buttons, cards, headings and status pills</li><li>Gallery and dashboard compositions</li><li>Loading, empty and error states</li><li>Motion helpers with reduced-motion support</li></ul><a className="underline" href="https://github.com/sass-maker/ui-library/tree/main/swift/Sources/SaaSMakerUI" target="_blank" rel="noreferrer">Read SwiftUI source</a><p className="story-caption">Use Xcode previews or an Apple app to inspect native rendering. Web stories cover the React library.</p></div></main>};

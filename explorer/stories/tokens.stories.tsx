import { FontPairingBench } from "./font-pairings";
import { FontImpactBench } from "./font-impact";
import { ProductPersonalityBench } from "./product-personality";
import type {Meta,StoryObj} from '@storybook/react-vite';
const meta={id: "foundations-tokens", title: "Foundations/Tokens",parameters:{docs:{description:{component:'theme.css is the source of truth for semantic roles, typography and spacing. Switch presets and mode in the toolbar. Generated JSON and Swift tokens share this source.'}}}} satisfies Meta;export default meta;
export const Palette:StoryObj={render:()=> <div className="story-stack"><h1 className="text-3xl font-semibold">Semantic color roles</h1><div className="story-grid">{['background','foreground','surface','card','muted','muted-foreground','primary','brand','brand-soft','brand-ink','border','destructive','success','warning'].map(role=><div key={role} className="overflow-hidden rounded-xl border border-border"><div style={{background:`var(--${role})`}} className="h-24"/><p className="border-t border-border bg-card p-4 font-mono text-xs">--{role}</p></div>)}</div></div>};
export const Typography:StoryObj={render:()=> <div className="story-stack"><p className="eyebrow">Eyebrow / Mono</p><h1 className="font-display text-6xl">The shared <em>visual language.</em></h1><p className="lede">A clear hierarchy, comfortable measure and purposeful contrast.</p><h2 className="text-2xl font-semibold">Section heading</h2><p className="max-w-prose text-base leading-relaxed">Body text uses the theme’s sans family. Display headings and accent words follow the preset. Product identity comes from tokens and content.</p><code className="story-panel font-mono text-sm">--font-sans · --font-display · --font-mono</code></div>};

export const FontImpact: StoryObj = { render: () => <FontImpactBench /> };

export const FontPairings: StoryObj = { render: () => <FontPairingBench /> };

export const ProductPersonality: StoryObj = { render: (_args, context) => <ProductPersonalityBench mode={context.globals.mode === "dark" ? "dark" : "light"} /> };

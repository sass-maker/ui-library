# SaaS Maker UI

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

The repository serves web products and Apple-native apps. This task is specifically
macOS using SwiftUI and AppKit. Existing iOS compatibility remains a constraint;
new iOS surfaces are outside this task.

## Users

Fleet product builders, including the owner and coding agents, composing native
Mac apps and web products from one shared design system.

## Product Purpose

Reusable components, interaction behavior and layout patterns with the same craft
standard as the existing web library. Components do not excuse weak composition.

## Operating Context

Web code lives in packages/ui; native APIs live in swift/Sources/SaaSMakerUI.
Products own data, actions and persistence. The owner's Memory workspace is the
first composition proving document browsing, filtering and inspection together.

## Capabilities and Constraints

Keep web packages and demos working. Preserve macOS14 and iOS17 compatibility.
Use real native windows for Mac review. No installed app changes during direction
selection. New controls need complete states, keyboard and accessibility behavior.

## Brand Commitments

Use the shared token system and preserve product identities. The current Daddy
app example requires a black canvas with restrained mint accents. The owner
explicitly values the existing graphic design and wants its character preserved.
Quality should support a product the owner is comfortable using and charging for.

## Evidence on Hand

The existing web library and native package, their tests, and the owner's supplied
Memory-screen screenshot. Illustrative example data must be identified honestly.

## Product Principles

- Layout, spacing, hierarchy and density require deliberate decisions.
- Consistent padding, crafted individual components, typography and purposeful
  imagery, video and artwork are core quality requirements.
- Prefer familiar Mac affordances with consistent control and text roles.
- Keep information close to its action and reveal secondary detail progressively.
- Establish quality through real rendered interfaces and exercised interactions.

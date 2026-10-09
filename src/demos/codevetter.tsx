import * as React from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/blocks/site-header";
import { Hero } from "@/components/blocks/hero";
import { Section, SectionHeader, FactRow } from "@/components/blocks/layout";
import { FeatureGrid, FeatureSpread, Steps, Stats } from "@/components/blocks/features";
import { Ledger, CodeBlock, StatusPill } from "@/components/blocks/proof";
import { WindowFrame } from "@/components/blocks/frames";
import { Faq, Cta } from "@/components/blocks/closing";
import { StudioFooter } from "@/components/blocks/footer";
import {
  ArrowRightIcon,
  DownloadIcon,
  FileCheck2Icon,
  GitCommitHorizontalIcon,
  SquareTerminalIcon,
  ArchiveIcon,
  ShieldAlertIcon,
  CircleHelpIcon,
  LaptopMinimalCheckIcon,
  LockKeyholeIcon,
  ScaleIcon,
} from "lucide-react";

const mark = (
  <img src="/demo/codevetter/icon.svg" alt="" width="22" height="22" className="size-[22px]" />
);

const faq = [
  {
    q: "What is CodeVetter?",
    a: "An execution-backed verification and evaluation system for coding agents. It connects a requested task and exact agent change to executable checks, retained evidence, explicit limitations, and a pass, fail, or unverified verdict.",
  },
  {
    q: "Is it another AI code reviewer?",
    a: "Review is one input, not the authority. A model can identify suspicious code and suggest what to test, but CodeVetter treats task-relevant execution evidence as the verdict boundary.",
  },
  {
    q: "Does my repository go to a CodeVetter server?",
    a: "No hosted verification backend is required. Product state and execution evidence stay local. If you start an optional provider-backed review, selected prompt and code context go directly to the provider you configured.",
  },
  {
    q: "Does it work offline?",
    a: "Local checks, stored evidence, and the desktop viewer work without a CodeVetter service. Reviews that call Anthropic, OpenAI, or OpenRouter still need network access to that provider.",
  },
  {
    q: "What does a verdict prove?",
    a: "Only the declared task and evidence boundary. A pass does not prove behavior that was never checked, and missing or irrelevant evidence stays unverified instead of becoming confidence.",
  },
  {
    q: "What can I download today?",
    a: "The current GitHub release has an Apple-silicon macOS DMG and updater archive. Source is ISC-licensed. Other platform installers and a Homebrew cask are not published yet.",
  },
];

export default function CodeVetterPage() {
  return (
    <>
  <SiteHeader
    brand={{ name: "CodeVetter", mark }}
    links={[
      { label: "How it works", href: "#how" },
      { label: "Evidence", href: "#evidence" },
      { label: "Availability", href: "#availability" },
      { label: "FAQ", href: "#faq" },
    ]}
    actions={
      <>
        <Button variant="ghost" size="sm" asChild><a href="https://github.com/Codevetter/codevetter">GitHub</a></Button>
        <Button size="sm" asChild><a href="#availability"><DownloadIcon />Download</a></Button>
      </>
    }
  />

  <main id="main">
    <Hero
      backdrop="glow"
      eyebrow="Execution-backed verification · local-first"
      title={<>AI writes code fast. It leaves it <em>unverified.</em></>}
      lede="CodeVetter binds the requested task to the exact change, runs your repository's own checks, and keeps a pass, fail, or unverified verdict with the evidence and limits behind it."
      actions={
        <>
          <Button size="xl" asChild><a href="#how">Run a verification <ArrowRightIcon /></a></Button>
          <Button size="xl" variant="outline" asChild><a href="#availability">Get the macOS build</a></Button>
        </>
      }
      note="Apple silicon · open source (ISC) · no CodeVetter account"
      media={
        <div className="relative">
          <div aria-hidden className="absolute -inset-6 -z-10 rounded-3xl bg-brand/10 blur-2xl"></div>
          <Ledger
            title="Verification receipt"
            meta="illustrative fields"
            rows={[
              { label: "Task", value: "Reject expired sessions without breaking valid refreshes." },
              { label: "Change", value: <span className="font-mono text-[0.8125rem]">main…agent/session-expiry · a13c9f2</span> },
              { label: "Check", value: <span className="font-mono text-[0.8125rem]">pnpm test auth/session.test.ts</span>, status: { tone: "danger", label: "exit 1" } },
              { label: "Check", value: <span className="font-mono text-[0.8125rem]">pnpm typecheck</span>, status: { tone: "success", label: "exit 0" } },
              { label: "Verdict", value: <strong className="font-semibold">The requested behavior is not verified.</strong>, status: { tone: "danger", label: "fail" } },
              { label: "Limitation", value: "The browser refresh journey was not executed, so it stays unverified.", status: { tone: "warning", label: "unknown" } },
            ]}
            footer={<a href="#evidence" className="inline-flex items-center gap-1 text-foreground hover:text-brand">Inspect published benchmark evidence <ArrowRightIcon className="size-3" /></a>}
          />
        </div>
      }
      footer={
        <FactRow
          className="mt-4 font-mono text-xs"
          items={["Exact source identity", "Executable checks", "Explicit unknowns", "No hosted verifier"]}
        />
      }
    />

    <Section id="how" rule>
      <div className="container-page">
        <SectionHeader
          align="split"
          eyebrow="The contract"
          title={<>The unit of trust is <em>the whole chain.</em></>}
          lede="A finding or a green command alone is not proof. CodeVetter keeps task identity, execution, evidence, and uncertainty connected, so another engineer, or another agent, can re-check the result."
        />
        <Steps
          className="mt-14"
          items={[
            { title: "Task", body: "Preserve the requested outcome and its acceptance boundary.", detail: <span className="font-mono text-xs text-muted-foreground">task: reject expired sessions</span> },
            { title: "Change", body: "Bind the exact agent revision, not “latest”.", detail: <span className="font-mono text-xs text-muted-foreground">main…a13c9f2</span> },
            { title: "Execute", body: "Run the authoritative local checks the repository owns.", detail: <StatusPill tone="danger">test: exit 1</StatusPill> },
            { title: "Evidence", body: "Retain commands, bounded output, artifacts, and limits.", detail: <StatusPill tone="brand">retained</StatusPill> },
            { title: "Verdict", body: "Pass, fail, or unverified. Never a confidence score.", detail: <StatusPill tone="danger">fail</StatusPill> },
          ]}
        />
      </div>
    </Section>

    <Section id="evidence" surface="muted" rule>
      <div className="container-page">
        <SectionHeader
          eyebrow="Published evidence"
          title={<>Proof that survives <em>the next question.</em></>}
          lede="The public corpus measures a narrow recognition task. It is not evidence of production-wide accuracy or adoption, and the page says so."
        />
        <Stats
          className="mt-14"
          items={[
            { value: "27", label: "Synthetic cases", note: "Inputs and scorer are inspectable." },
            { value: "29", label: "Labelled findings", note: "Bounded recognition evidence." },
            { value: "3", label: "Verdict states", note: "Pass · fail · unverified." },
            { value: "0", label: "Hosted verifiers", note: "Execution and state stay local." },
          ]}
        />
        <FeatureGrid
          className="mt-20"
          items={[
            { icon: <FileCheck2Icon />, title: "Task identity first", body: "The requested behavior and acceptance boundary stay attached to the run, so the verifier cannot quietly grade an easier task." },
            { icon: <GitCommitHorizontalIcon />, title: "Exact change, not “latest”", body: "Base and head identities, repository state, and the agent-produced patch travel with the evidence." },
            { icon: <SquareTerminalIcon />, title: "Executable checks decide", body: "Repository-owned tests, builds, browser flows, API checks, and qualified workloads set the verdict boundary." },
            { icon: <ArchiveIcon />, title: "Evidence stays portable", body: "Commands, bounded output, artifacts, status, and provenance live in machine-readable verification records." },
            { icon: <ShieldAlertIcon />, title: "Failures stay classified", body: "Agent regressions stay separate from existing failures, environment problems, timeouts, and missing coverage." },
            { icon: <CircleHelpIcon />, title: "Unknown is a real outcome", body: "Missing or irrelevant evidence produces unverified, not a confidence score dressed up as success." },
          ]}
        />
      </div>
    </Section>

    <Section rule>
      <div className="container-page">
        <FeatureSpread
          items={[
            {
              kicker: "Desktop workbench",
              title: <>See every finding next to <em>the evidence.</em></>,
              body: "The macOS app is the visual workbench: the review result, finding list, evidence status, and the code under inspection in one window.",
              media: (
                <WindowFrame
                  title="CodeVetter — review"
                  image={{ src: "/demo/codevetter/workbench.png", alt: "CodeVetter desktop review workbench showing a local review result, finding list, evidence status, and code inspection panel", width: 1440, height: 900 }}
                />
              ),
            },
            {
              kicker: "Bundled CLI",
              title: <>Run the exact change from <em>your repository.</em></>,
              body: "The Apple-silicon release bundles the codevetter CLI and a local MCP sidecar inside the app. Provider-backed review needs a supported local agent CLI; repository-owned checks remain the verdict boundary.",
              media: (
                <CodeBlock
                  label="zsh — ~/work/auth-service"
                  code={`/Applications/CodeVetter.app/Contents/MacOS/codevetter check \\
  --range main...HEAD \\
  --task "Reject expired sessions" \\
  --json

✗ fail   pnpm test auth/session.test.ts   exit 1
✓ pass   pnpm typecheck                   exit 0
? unverified  browser refresh journey (not run)`}
                />
              ),
            },
          ]}
        />
      </div>
    </Section>

    <Section id="availability" surface="muted" rule>
      <div className="container-page">
        <SectionHeader
          align="split"
          eyebrow="Available today"
          title={<>Models can suggest. <em>Execution decides.</em></>}
          lede="No placeholder plans, unsupported installers, or hosted-service promises. Optional model review goes straight to the provider you configure."
        />
        <FeatureGrid
          className="mt-14"
          variant="cards"
          items={[
            { icon: <LaptopMinimalCheckIcon />, title: "macOS · Apple silicon", body: "The current GitHub release publishes an aarch64 DMG and updater archive.", meta: "Other platforms: not yet" },
            { icon: <LockKeyholeIcon />, title: "Local, no account", body: "Product state and verification evidence live on your machine. Model review uses credentials you configure.", meta: "Anthropic · OpenAI · OpenRouter" },
            { icon: <ScaleIcon />, title: "Open source · ISC", body: "The repository, benchmark cases, scorer, docs, and release workflows are public on GitHub.", meta: "github.com/Codevetter" },
          ]}
        />
      </div>
    </Section>

    <Section id="faq" rule>
      <div className="container-page">
        <Faq title={<>Understand <em>the boundary.</em></>} lede="Scope, evidence, and availability, answered plainly." items={faq} />
      </div>
    </Section>

    <Section size="compact">
      <div className="container-page">
        <Cta
          variant="panel"
          title={<>“Looks good” is <em>not a verdict.</em></>}
          lede="Inspect the evidence contract first, then download the current local desktop build from the GitHub release."
          actions={
            <>
              <Button size="xl" asChild><a href="#availability"><DownloadIcon />Open the latest release</a></Button>
              <Button size="xl" variant="outline" asChild><a href="#evidence">Read the evidence format</a></Button>
            </>
          }
          note="No CodeVetter account · local SQLite state · ISC license"
        />
      </div>
    </Section>
  </main>

  <StudioFooter
    product="CodeVetter"
    url="https://codevetter.com"
    summary="Execution-backed verification for coding-agent changes. Preserve the task, exact change, executable evidence, limitations, and a measurable verdict."
    groups={[
      { title: "Product", links: [{ label: "Run a verification", href: "#how" }, { label: "Availability", href: "#availability" }, { label: "Changelog", href: "#" }, { label: "Starboard", href: "https://starboard.codevetter.com" }] },
      { title: "Resources", links: [{ label: "Evidence docs", href: "#evidence" }, { label: "FAQ", href: "#faq" }, { label: "Benchmark", href: "#evidence" }, { label: "vs CodeRabbit", href: "#" }] },
      { title: "Connect", links: [{ label: "About", href: "#" }, { label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "GitHub", href: "https://github.com/Codevetter/codevetter" }] },
    ]}
    art={{ src: "/demo/codevetter/codevetter-evidence-workbench-v1.webp", alt: "Illustration of an evidence workbench" }}
    feedbackHref="mailto:hello@codevetter.com"
    legal="© 2026 CodeVetter · ISC License"
  />
    </>
  );
}

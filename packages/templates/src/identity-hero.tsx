import * as React from "react";
import { rich } from "./rich";
import type { SingleFieldForm } from "./schema";

// Runs after its form is parsed. Native validation and GET navigation remain intact.
const validation = `(()=>{const f=document.currentScript.previousElementSibling,i=f.querySelector('input'),e=f.querySelector('[role=alert]');const show=()=>{const bad=!i.validity.valid;i.setAttribute('aria-invalid',String(bad));e.hidden=!bad;e.textContent=bad?(f.dataset.error||i.validationMessage):''};f.addEventListener('invalid',show,true);i.addEventListener('input',()=>{if(i.hasAttribute('aria-invalid'))show()})})();`;

export function InlineForm({ form, id }: { form: SingleFieldForm; id: string }) {
  return <>
    <form className="identity-form" action={form.action} method="get" data-identity-form data-error={form.error}>
      <label htmlFor={id}>{form.label}</label>
      <div className="identity-form-row">
        <input id={id} name={form.name} type={form.type ?? "text"} placeholder={form.placeholder} required={form.required}
          pattern={form.pattern} defaultValue={form.prefill} aria-describedby={[form.hint && `${id}-hint`, `${id}-error`].filter(Boolean).join(" ")} />
        <button type="submit" className="ui-case">{form.submit}</button>
      </div>
      {form.hint && <p id={`${id}-hint`} className="identity-form-hint">{form.hint}</p>}
      <p id={`${id}-error`} role="alert" hidden />
    </form>
    <script dangerouslySetInnerHTML={{ __html: validation }} />
  </>;
}

type HeroIdentityProps = {
  hero: { layout?: string; eyebrow?: string; title: string; lede?: string; issue?: string; issueNote?: string; form?: SingleFieldForm; secondary?: { href: string; label: string } };
  media?: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
};

/** Quiet layouts shared by both families. Copy always comes before media. */
export function IdentityHero({ hero: h, media, actions, note }: HeroIdentityProps) {
  return <section className="identity-hero" data-hero-layout={h.layout ?? "center"}>
    {h.layout === "masthead" && <div className="identity-issue">{h.issue && <span>{h.issue}</span>}{h.issueNote && <span>{h.issueNote}</span>}</div>}
    <div className="identity-hero-grid">
      <div className="identity-copy motion-stagger">
        {h.eyebrow && <p className="identity-eyebrow ui-case">{h.eyebrow}</p>}
        <h1 className="font-display">{rich(h.title)}</h1>
        {h.lede && <p className="identity-lede">{h.lede}</p>}
        <div className="identity-actions">
          {h.layout === "form" && h.form ? <>
            <InlineForm form={h.form} id="hero-field" />
            {h.secondary && <a className="identity-secondary ui-case" href={h.secondary.href}>{h.secondary.label}</a>}
          </> : actions}
        </div>
        {note && <div className="identity-note">{note}</div>}
      </div>
      {media && <div className="identity-media motion-reveal">{media}</div>}
    </div>
  </section>;
}

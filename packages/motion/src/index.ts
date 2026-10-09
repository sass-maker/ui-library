import { animate, inView, scroll } from "motion";

/**
 * Fleet motion: one small script that animates server-rendered HTML by class.
 * Quiet by design: one move per element, no bounce, no loops. Elements that
 * are already on screen when the page loads are left alone (no flash), and
 * reduced motion turns everything off.
 *
 *   .motion-reveal    fades and rises when it scrolls into view
 *   .motion-stagger   reveals its direct children one after another
 *   .motion-zoom      the scale jump: grows to full size as it centers
 *   .motion-tilt      an app window lies back, then settles flat
 *   .motion-parallax  an image drifts slower than the page
 *   .motion-drift     a slow settling zoom on closing art
 *   .motion-draw      SVG paths draw in (give them pathLength="1")
 *   .motion-type      its child lines print one after another, like a terminal
 */

const ease = [0.22, 0.8, 0.24, 1] as const;

function onScreen(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top < innerHeight && r.bottom > 0;
}

function reveal(items: HTMLElement[]) {
  const hidden = items.filter((el) => !onScreen(el));
  for (const el of hidden) {
    el.style.opacity = "0";
    el.style.transform = "translateY(2rem)";
  }
  for (const el of hidden) {
    inView(
      el,
      () => {
        const siblings = el.parentElement?.classList.contains("motion-stagger") ? [...el.parentElement.children] : [el];
        const delay = Math.min(siblings.indexOf(el), 4) * 0.08;
        animate(el, { opacity: 1, transform: "translateY(0)" }, { duration: 0.9, delay, ease });
      },
      { amount: 0.15 },
    );
  }
}

/** Link a keyframe animation to an element's trip through the viewport. */
function link(el: HTMLElement, keyframes: Record<string, string[]>, offset: [string, string]) {
  scroll(animate(el, keyframes, { ease: "linear" }), { target: el, offset: offset as never });
}

export function initMotion() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];

  reveal(all(".motion-reveal"));

  for (const el of all(".motion-type").filter((t) => !onScreen(t))) {
    const lines = [...el.children] as HTMLElement[];
    for (const line of lines) line.style.opacity = "0";
    inView(
      el,
      () => {
        // Blank lines are pauses; each printed line takes a beat.
        let t = 0.3;
        for (const line of lines) {
          animate(line, { opacity: 1 }, { duration: 0.18, delay: t });
          t += line.textContent?.trim() ? 0.32 : 0.45;
        }
      },
      { amount: 0.5 },
    );
  }
  reveal(all(".motion-stagger").flatMap((g) => [...g.children] as HTMLElement[]));

  for (const el of all(".motion-zoom")) link(el, { transform: ["scale(0.82)", "scale(1)"] }, ["start end", "center center"]);
  for (const el of all(".motion-tilt")) {
    el.style.transformOrigin = "50% 0%";
    link(el, { transform: ["perspective(1600px) rotateX(14deg) scale(0.94)", "perspective(1600px) rotateX(0deg) scale(1)"] }, ["start end", "start 30%"]);
  }
  for (const el of all(".motion-parallax")) link(el, { transform: ["translateY(-8%) scale(1.16)", "translateY(8%) scale(1.16)"] }, ["start end", "end start"]);
  for (const el of all(".motion-drift")) link(el, { transform: ["scale(1.12)", "scale(1)"] }, ["start end", "end end"]);
  for (const path of all(".motion-draw path")) {
    path.style.strokeDasharray = "1";
    link(path, { strokeDashoffset: ["1", "0"] }, ["start end", "center center"]);
  }
}

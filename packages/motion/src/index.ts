import { animate } from "motion/mini";
import { inView, scroll } from "motion";

const ease = [0.22, 1, 0.36, 1] as const;
type Dispose = () => void;
const sessions = new WeakMap<ParentNode, Dispose>();

/** Quiet motion for server-rendered HTML. Safe to reinitialize after navigation. */
export function initMotion(scope: ParentNode = document): Dispose {
  sessions.get(scope)?.();
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let stopCurrent: Dispose = () => {};
  const start = () => {
    stopCurrent();
    const cleanups: Dispose[] = [];
    const original = new Map<HTMLElement, { opacity: string; transform: string; origin: string; dash: string; dashOffset: string }>();
    const all = (selector: string) => [...scope.querySelectorAll<HTMLElement>(selector)];
    const remember = (element: HTMLElement) => {
      if (!original.has(element)) original.set(element, { opacity: element.style.opacity, transform: element.style.transform, origin: element.style.transformOrigin, dash: element.style.strokeDasharray, dashOffset: element.style.strokeDashoffset });
    };
    const run = (element: HTMLElement, keyframes: Parameters<typeof animate>[1], options: Parameters<typeof animate>[2]) => {
      const animation = animate(element, keyframes, options);
      cleanups.push(() => animation.stop());
      return animation;
    };
    stopCurrent = () => {
      for (const cleanup of cleanups.splice(0)) cleanup();
      for (const [element, before] of original) {
        element.style.opacity = before.opacity;
        element.style.transform = before.transform;
        element.style.transformOrigin = before.origin;
        element.style.strokeDasharray = before.dash;
        element.style.strokeDashoffset = before.dashOffset;
      }
      original.clear();
    };
    if (preference.matches || ["off", "reduced"].includes(document.documentElement.dataset.motion ?? "")) return;
    const onScreen = (element: HTMLElement) => { const bounds = element.getBoundingClientRect(); return bounds.top < innerHeight && bounds.bottom > 0; };
    const reveal = (items: HTMLElement[]) => {
      for (const element of items.filter(element => !onScreen(element))) {
        remember(element);
        element.style.opacity = "0";
        element.style.transform = "translateY(16px)";
        cleanups.push(inView(element, () => {
          const siblings = element.parentElement?.classList.contains("motion-stagger") ? [...element.parentElement.children] : [element];
          run(element, { opacity: 1, transform: "translateY(0)" }, { duration: .5, delay: Math.min(siblings.indexOf(element), 4) * .06, ease });
        }, { amount: .12 }));
      }
    };
    reveal(all(".motion-reveal"));
    reveal(all(".motion-stagger").flatMap(group => [...group.children].filter((child): child is HTMLElement => child instanceof HTMLElement)));
    for (const element of all(".motion-type").filter(element => !onScreen(element))) {
      const lines = [...element.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
      lines.forEach(line => { remember(line); line.style.opacity = "0"; });
      cleanups.push(inView(element, () => {
        let delay = .1;
        for (const line of lines) { run(line, { opacity: 1 }, { duration: .15, delay }); delay += line.textContent?.trim() ? .22 : .3; }
      }, { amount: .3 }));
    }
    const link = (element: HTMLElement, keyframes: Record<string, string[]>, offset: Parameters<typeof scroll>[1]) => {
      remember(element);
      const animation = run(element, keyframes, { ease: "linear" });
      cleanups.push(scroll(animation, { target: element, ...offset }));
    };
    for (const element of all(".motion-zoom")) link(element, { transform: ["scale(0.9)", "scale(1)"] }, { offset: ["start end", "center center"] });
    for (const element of all(".motion-tilt")) {
      remember(element); element.style.transformOrigin = "50% 0%";
      link(element, { transform: ["perspective(1600px) rotateX(8deg) scale(0.97)", "perspective(1600px) rotateX(0deg) scale(1)"] }, { offset: ["start end", "start 30%"] });
    }
    for (const element of all(".motion-parallax")) link(element, { transform: ["translateY(-5%) scale(1.1)", "translateY(5%) scale(1.1)"] }, { offset: ["start end", "end start"] });
    for (const element of all(".motion-drift")) link(element, { transform: ["scale(1.06)", "scale(1)"] }, { offset: ["start end", "end end"] });
    for (const element of all(".motion-draw path")) {
      remember(element); element.style.strokeDasharray = "1";
      link(element, { strokeDashoffset: ["1", "0"] }, { offset: ["start end", "center center"] });
    }
  };
  start();
  preference.addEventListener("change", start);
  const dispose = () => { preference.removeEventListener("change", start); stopCurrent(); if (sessions.get(scope) === dispose) sessions.delete(scope); };
  sessions.set(scope, dispose);
  return dispose;
}

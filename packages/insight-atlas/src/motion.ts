import { motionTiming } from "@saas-maker/ui/lib/motion";

type EntranceOptions = { offset?: number; delay?: number; feedback?: boolean };

export function createAtlasMotion(document: Document) {
  const view = document.defaultView;
  const root = document.documentElement;
  const reduced = view?.matchMedia("(prefers-reduced-motion: reduce)");
  const running = new Map<Element, Animation>();
  let keyboard = false;
  const ease = `cubic-bezier(${motionTiming.content.ease.join(",")})`;

  root.style.setProperty("--atlas-motion-content", `${motionTiming.content.duration * 1000}ms`);
  root.style.setProperty("--atlas-motion-feedback", `${motionTiming.feedback.duration * 1000}ms`);
  root.style.setProperty("--atlas-motion-exit", `${motionTiming.exit.duration * 1000}ms`);
  root.style.setProperty("--atlas-motion-ease", ease);

  function cancelAll() {
    for (const animation of running.values()) animation.cancel();
    running.clear();
  }

  function syncPreference() {
    const instant = keyboard || reduced?.matches;
    root.dataset.atlasMotion = instant ? "instant" : "full";
    if (instant) cancelAll();
  }

  const onKey = () => {
    keyboard = true;
    syncPreference();
  };
  const onPointer = () => {
    keyboard = false;
    syncPreference();
  };
  document.addEventListener("keydown", onKey, true);
  document.addEventListener("pointerdown", onPointer, true);
  reduced?.addEventListener("change", syncPreference);
  syncPreference();

  function enter(element: Element | null, { offset = 8, delay = 0, feedback = false }: EntranceOptions = {}) {
    if (!view || !element || keyboard || reduced?.matches || typeof element.animate !== "function") return;
    const bounds = element.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0 || bounds.bottom <= 0 || bounds.top >= view.innerHeight) return;
    const previous = running.get(element);
    const current = previous ? view.getComputedStyle(element) : null;
    const from: Keyframe = { opacity: current?.opacity ?? 0.65 };
    const to: Keyframe = { opacity: 1 };
    if (offset !== 0) {
      from.transform = current?.transform ?? `translateY(${offset}px)`;
      to.transform = "none";
    }
    previous?.cancel();
    const animation = element.animate([from, to], {
      duration: (feedback ? motionTiming.feedback.duration : motionTiming.content.duration) * 1000,
      delay,
      easing: ease,
      fill: "backwards",
    });
    running.set(element, animation);
    const release = () => {
      if (running.get(element) === animation) running.delete(element);
    };
    void animation.finished.then(release, release);
  }

  return {
    enter,
    cancelAll,
    destroy() {
      cancelAll();
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      reduced?.removeEventListener("change", syncPreference);
      delete root.dataset.atlasMotion;
      for (const name of ["content", "feedback", "exit", "ease"]) {
        root.style.removeProperty(`--atlas-motion-${name}`);
      }
    },
  };
}

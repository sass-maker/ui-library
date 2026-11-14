export function bindAtlasTabs(tablist: HTMLElement) {
  const onKey = (event: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
      .filter((tab) => !tab.disabled && tab.getClientRects().length > 0);
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    if (current < 0 || tabs.length === 0) return;
    event.preventDefault();
    const direction = getComputedStyle(tablist).direction === "rtl" ? -1 : 1;
    const index = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : (current + (event.key === "ArrowRight" ? direction : -direction) + tabs.length) % tabs.length;
    tabs[index].focus({ preventScroll: true });
    tabs[index].click();
  };
  tablist.addEventListener("keydown", onKey);
  return () => tablist.removeEventListener("keydown", onKey);
}

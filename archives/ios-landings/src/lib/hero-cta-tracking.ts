/**
 * Landing hero CTA tracking for products with `heroCtaEvents`. Sends the
 * `data-cta` event to App Health, then flushes before same-tab navigation so
 * the event is not lost to the page unload.
 */
export const heroCtaTrackingScript = `
// Count only actions on the public landing; the capture service records consented joins.
(function () {
  document.addEventListener("click", function (event) {
    var target = event.target.closest && event.target.closest("[data-cta]");
    var name = target && target.getAttribute("data-cta");
    if (!name || !window.appHealth || typeof window.appHealth.track !== "function") return;
    window.appHealth.track(name);

    var link = target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target && link.target !== "_self" || link.hasAttribute("download")) return;
    var destination = new URL(link.href, location.href);
    if (destination.origin === location.origin && destination.pathname === location.pathname && destination.search === location.search && destination.hash) return;
    if (typeof window.appHealth.flush !== "function") return;
    event.preventDefault();
    window.appHealth.flush().finally(function () { location.assign(link.href); });
  }, true);
})();
`;

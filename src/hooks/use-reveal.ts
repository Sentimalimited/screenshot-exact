import { useEffect } from "react";

let firstRunDone = false;

/** Wait until the initial page has finished loading and hydrating before touching the DOM. */
function afterHydration(cb: () => void): () => void {
  if (firstRunDone) {
    cb();
    return () => {};
  }
  let cancelled = false;
  let idleId: number | undefined;
  const run = () => {
    const go = () => {
      if (cancelled) return;
      firstRunDone = true;
      cb();
    };
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(go, { timeout: 800 });
    else idleId = globalThis.setTimeout(go, 200) as unknown as number;
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idleId !== undefined) {
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      globalThis.clearTimeout(idleId);
    }
  };
}

/**
 * Site-wide scroll reveal. Elements marked `data-reveal` (or groups marked
 * `data-reveal-stagger`) fade and rise into place once they enter the viewport.
 * Content is fully visible without JavaScript; the hidden state only applies
 * once `html.reveal-ready` is set here.
 */
export function useReveal(pathname: string) {
  useEffect(() => {
    let teardown = () => {};
    const cancel = afterHydration(() => {
      teardown = setup();
    });
    return () => {
      cancel();
      teardown();
    };
  }, [pathname]);
}

function setup(): () => void {
  {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = "[data-reveal], [data-reveal-stagger], [data-reveal-ornament]";

    // State lives in data attributes (not className/style) so React hydration is untouched.
    const show = (el: Element, instant = false) => {
      el.setAttribute("data-shown", "");
      if (instant) el.setAttribute("data-instant", "");
    };

    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll(selector).forEach((el) => show(el, true));
      return () => {};
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const track = (el: Element) => {
      if (el.hasAttribute("data-shown")) return;
      const r = el.getBoundingClientRect();
      // Already on screen at first paint: show without animating to avoid a flash.
      if (!root.hasAttribute("data-reveal-ready") && r.top < window.innerHeight && r.bottom > 0) {
        show(el, true);
        return;
      }
      io.observe(el);
    };

    document.querySelectorAll(selector).forEach(track);
    root.setAttribute("data-reveal-ready", "");

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(selector)) track(n);
          n.querySelectorAll(selector).forEach(track);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }
}

/** Adds `data-scrolled` to <html> once the page is scrolled, for the header. */
export function useScrolledFlag() {
  useEffect(() => {
    const onScroll = () => {
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

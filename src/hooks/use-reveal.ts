import { useEffect } from "react";

/**
 * Site-wide scroll reveal. Elements marked `data-reveal` (or groups marked
 * `data-reveal-stagger`) fade and rise into place once they enter the viewport.
 * Content is fully visible without JavaScript; the hidden state only applies
 * once `html.reveal-ready` is set here.
 */
export function useReveal(pathname: string) {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = "[data-reveal], [data-reveal-stagger]";

    const prepare = (el: Element) => {
      if (el.hasAttribute("data-reveal-stagger")) {
        Array.from(el.children).forEach((child, i) => {
          (child as HTMLElement).style.setProperty("--reveal-i", String(Math.min(i, 10)));
        });
      }
    };

    if (reduce || !("IntersectionObserver" in window)) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const track = (el: Element) => {
      if (el.classList.contains("is-revealed")) return;
      prepare(el);
      const r = el.getBoundingClientRect();
      // Already on screen at first paint: show without animating to avoid a flash.
      if (!root.classList.contains("reveal-ready") && r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-revealed");
        return;
      }
      io.observe(el);
    };

    document.querySelectorAll(selector).forEach(track);
    root.classList.add("reveal-ready");

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
  }, [pathname]);
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

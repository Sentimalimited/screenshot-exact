import { useEffect } from "react";

const SELECTORS = ["[data-tilt]", "[data-spotlight]", "[data-magnetic]"] as const;

/**
 * Pointer-driven effects, attached once after hydration:
 * - `data-tilt`: card tilts towards the cursor with a gold glare.
 * - `data-spotlight`: a soft gold glow follows the cursor across the section.
 * - `data-magnetic`: buttons lean slightly towards the cursor.
 * State lives in CSS custom properties and a `data-fx-active` attribute, so React markup is untouched.
 * Only runs for mouse users who have not asked for reduced motion.
 */
export function usePointerFx() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const active = new Map<string, HTMLElement>();
    let frame = 0;
    let last: PointerEvent | null = null;

    const release = (sel: string) => {
      const el = active.get(sel);
      if (!el) return;
      el.removeAttribute("data-fx-active");
      for (const p of ["--rx", "--ry", "--tx", "--ty"]) el.style.removeProperty(p);
      active.delete(sel);
    };

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;
      for (const sel of SELECTORS) {
        const el = (target?.closest(sel) as HTMLElement | null) ?? null;
        if (active.get(sel) !== el) release(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        const py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        if (sel === "[data-tilt]") {
          el.style.setProperty("--rx", `${((px - 0.5) * 9).toFixed(2)}deg`);
          el.style.setProperty("--ry", `${((0.5 - py) * 7).toFixed(2)}deg`);
        } else if (sel === "[data-magnetic]") {
          el.style.setProperty("--tx", `${((px - 0.5) * 10).toFixed(1)}px`);
          el.style.setProperty("--ty", `${((py - 0.5) * 8).toFixed(1)}px`);
        }
        el.setAttribute("data-fx-active", "");
        active.set(sel, el);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => SELECTORS.forEach(release);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);
}

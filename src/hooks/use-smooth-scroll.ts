import { useEffect } from "react";

/** Inertial smooth scrolling (Lenis) for mouse/trackpad; native on touch and reduced motion. */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let destroyed = false;
    let lenis: { destroy: () => void } | null = null;
    import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.09,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        anchors: { offset: -90 },
      });
    });
    return () => {
      destroyed = true;
      lenis?.destroy();
    };
  }, []);
}

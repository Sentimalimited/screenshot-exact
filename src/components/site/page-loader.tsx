import { useEffect, useRef } from "react";
import { BeadedCollar } from "./african";
import sealLogo from "@/assets/sentima-seal.webp";

/**
 * Full-screen loader shown from the first server paint until the page,
 * its fonts and above-the-fold images have finished loading. Hidden via a
 * data attribute after hydration (never React state) so markup stays stable.
 * A CSS fallback hides it after a few seconds even if scripts fail.
 */
export function PageLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.setAttribute("data-done", "");
      window.setTimeout(() => el.setAttribute("hidden", ""), 500);
    };
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const fontsLoaded = document.fonts?.ready ?? Promise.resolve();
    const minShow = new Promise((r) => window.setTimeout(r, 300));
    Promise.all([pageLoaded, fontsLoaded, minShow]).then(finish, finish);
    const cap = window.setTimeout(finish, 2500);
    return () => window.clearTimeout(cap);
  }, []);

  return (
    <div ref={ref} className="page-loader" role="status" aria-live="polite" aria-label="Loading Sentima">
      <div className="page-loader__inner">
        <span className="relative inline-flex items-center justify-center" style={{ width: 132, height: 132 }}>
          <BeadedCollar size={132} className="absolute inset-0" />
          <span className="page-loader__ring" aria-hidden />
          <img src={sealLogo} alt="" aria-hidden width={88} height={88} className="relative size-[88px] rounded-full shadow-seal" />
        </span>
        <p className="page-loader__word font-blackletter text-3xl text-gold">Sentima</p>
        <span className="page-loader__bar" aria-hidden><span /></span>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative motifs drawn from East African craft: Maasai beadwork and
 * kikoi/kitenge geometry. Purely visual, hidden from assistive technology.
 */

function usePatternId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

const COLS = 8;
const ROWS = 4;
const STEP = 5;
const TONES = ["fill-seal", "fill-gold", "fill-ink-foreground", "fill-ink"];
const BEADS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const d = Math.abs(c - 3.5) + Math.abs(r - 1.5);
  return { cx: c * STEP + STEP / 2, cy: r * STEP + STEP / 2, tone: TONES[Math.floor(d) % TONES.length] };
});

/** A slowly travelling strip of Maasai-style beadwork. */
export function BeadBand({ className }: { className?: string }) {
  const id = usePatternId("beads");
  const w = COLS * STEP;
  return (
    <div aria-hidden className={cn("h-5 overflow-hidden bg-ink", className)}>
      <svg className="bead-track block h-5 w-[calc(100%+40px)]">
        <defs>
          <pattern id={id} width={w} height={ROWS * STEP} patternUnits="userSpaceOnUse">
            {BEADS.map((b, i) => (
              <circle key={i} cx={b.cx} cy={b.cy} r={1.9} className={b.tone} />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** Faint kitenge-style diamond lattice that drifts behind dark sections. */
export function KitengeBackdrop({ className }: { className?: string }) {
  const id = usePatternId("kitenge");
  return (
    <div aria-hidden className={cn("kitenge-mask pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <svg className="kitenge-track absolute -left-14 -top-14 h-[calc(100%+56px)] w-[calc(100%+56px)]">
        <defs>
          <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M28 4 L52 28 L28 52 L4 28 Z" fill="none" className="stroke-gold" strokeWidth="0.8" />
            <path d="M28 16 L40 28 L28 40 L16 28 Z" fill="none" className="stroke-gold" strokeWidth="0.6" />
            <path d="M0 0 L8 0 L0 8 Z M56 0 L48 0 L56 8 Z M0 56 L8 56 L0 48 Z M56 56 L48 56 L56 48 Z" className="fill-seal" />
            <circle cx="28" cy="28" r="2.2" className="fill-gold" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

const RINGS = [
  { n: 36, cy: 3, r: 2.3, offset: 0 },
  { n: 30, cy: 9, r: 1.9, offset: 1 },
];
const COLLAR_TONES = ["fill-seal", "fill-gold", "fill-ink-foreground", "fill-gold"];

/** A beaded Maasai collar that slowly turns, framing the wax seal. */
export function BeadedCollar({ size, className }: { size: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" width={size} height={size} className={cn("collar-spin pointer-events-none", className)}>
      {RINGS.map((ring, ri) =>
        Array.from({ length: ring.n }, (_, i) => (
          <circle
            key={`${ri}-${i}`}
            cx="50"
            cy={ring.cy}
            r={ring.r}
            transform={`rotate(${(i * 360) / ring.n} 50 50)`}
            className={COLLAR_TONES[(i + ring.offset) % COLLAR_TONES.length]}
          />
        )),
      )}
    </svg>
  );
}

const SPARKS = [
  { top: "12%", left: "8%", delay: "0s", size: 5 },
  { top: "22%", left: "46%", delay: "1.2s", size: 3 },
  { top: "68%", left: "12%", delay: "2.1s", size: 4 },
  { top: "84%", left: "40%", delay: "0.6s", size: 3 },
  { top: "8%", left: "78%", delay: "1.8s", size: 4 },
  { top: "48%", left: "94%", delay: "2.7s", size: 5 },
  { top: "90%", left: "86%", delay: "0.3s", size: 3 },
  { top: "36%", left: "28%", delay: "3.2s", size: 2 },
];

/** Gold dust that gently glints across a dark section. */
export function GoldDust({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="spark absolute rounded-full bg-gold-soft"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

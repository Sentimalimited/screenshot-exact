import { cn } from "@/lib/utils";

/** Restrained gold divider with a central diamond. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-gold", className)} aria-hidden>
      <span className="rule-gold h-px flex-1" />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1 L12 9 L9 17 L6 9 Z" fill="currentColor" opacity="0.85" />
        <circle cx="9" cy="9" r="1.4" fill="var(--color-ink)" />
      </svg>
      <span className="rule-gold h-px flex-1" />
    </div>
  );
}

/** Wax-seal motif carrying the company initial. */
export function Seal({ letter = "S", size = 56, className }: { letter?: string; size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-seal font-blackletter text-seal-foreground shadow-seal",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.52 }}
      aria-hidden
    >
      <span className="flex h-[82%] w-[82%] items-center justify-center rounded-full border border-seal-foreground/30">
        {letter}
      </span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag className={cn(Tag === "h1" ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl")}>{title}</Tag>
      {intro && <p className="mt-4 text-lg leading-relaxed opacity-80">{intro}</p>}
    </div>
  );
}

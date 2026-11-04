import { cn } from "@/lib/utils";
import sealLogo from "@/assets/sentima-seal.webp";

/** Gold divider with a central diamond flanked by beadwork. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("ornament-draw flex items-center gap-3 text-gold", className)} data-reveal-ornament aria-hidden>
      <span className="rule-gold h-px flex-1" />
      <svg width="54" height="18" viewBox="0 0 54 18" fill="none">
        <circle cx="4" cy="9" r="2" className="fill-seal" />
        <circle cx="10" cy="9" r="2" fill="currentColor" />
        <circle cx="16" cy="9" r="2" className="fill-ink-muted" />
        <path d="M27 1 L30 9 L27 17 L24 9 Z" fill="currentColor" opacity="0.9" />
        <circle cx="27" cy="9" r="1.4" className="fill-seal" />
        <circle cx="38" cy="9" r="2" className="fill-ink-muted" />
        <circle cx="44" cy="9" r="2" fill="currentColor" />
        <circle cx="50" cy="9" r="2" className="fill-seal" />
      </svg>
      <span className="rule-gold h-px flex-1" />
    </div>
  );
}

/** The client's Sentima wax-seal logo. `letter` is kept for older call sites and ignored. */
export function Seal({ size = 56, className, alt = "" }: { letter?: string; size?: number; className?: string; alt?: string }) {
  return (
    <img
      src={sealLogo}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={size}
      height={size}
      decoding="async"
      className={cn("inline-block shrink-0 rounded-full shadow-seal", className)}
      style={{ width: size, height: size }}
    />
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
    <div data-reveal className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag className={cn(Tag === "h1" ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl")}>{title}</Tag>
      {intro && <p className="mt-4 text-lg leading-relaxed opacity-80">{intro}</p>}
    </div>
  );
}

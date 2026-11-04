import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV, companyName } from "@/lib/site";
import { useSiteContent } from "@/lib/content-query";
import { Seal } from "./ornament";

export function Wordmark({ className = "" }: { className?: string }) {
  const { settings } = useSiteContent();
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label={`${companyName(settings)} — home`}>
      <Seal size={40} className="transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105" />
      <span className="font-blackletter text-3xl leading-none transition-colors duration-500 group-hover:text-gold-soft">{companyName(settings)}</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header sticky top-0 z-40 border-b border-ink-soft section-ink">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Wordmark className="text-ink-foreground" />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="link-draw text-sm tracking-wide text-ink-muted transition-colors duration-300 hover:text-gold-soft"
              activeProps={{ className: "text-gold-soft" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <Link to="/request-a-quote">Request a quote</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline-gold" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="section-ink border-ink-soft">
              <SheetTitle className="font-blackletter text-3xl font-normal text-gold-soft">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
                <Link to="/" onClick={() => setOpen(false)} className="py-3 font-display text-2xl transition-colors hover:text-gold-soft">Home</Link>
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 font-display text-2xl transition-colors hover:text-gold-soft">
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-3">
                <Button asChild variant="gold"><Link to="/request-a-quote" onClick={() => setOpen(false)}>Request a quote</Link></Button>
                <Button asChild variant="outline-gold"><Link to="/book-a-meeting" onClick={() => setOpen(false)}>Book a school meeting</Link></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: ({ matches }) => seo({ matches, path: "/auth", title: "Administrator sign in — Sentima", description: "Sign in to manage the Sentima website.", noindex: true }),
  component: AuthPage,
});

function safeRedirect(r?: string) {
  if (!r) return "/admin";
  try {
    const u = new URL(r, "http://x");
    return u.pathname.startsWith("/admin") ? u.pathname + u.search : "/admin";
  } catch {
    return "/admin";
  }
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "info"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg({ type: "error", text: error.message });
      navigate({ href: safeRedirect(redirect) });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setBusy(false);
      if (error) return setMsg({ type: "error", text: error.message });
      if (data.session) navigate({ href: "/admin" });
      else setMsg({ type: "info", text: "Check your email to confirm your account, then sign in." });
    }
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-16">
      <p className="eyebrow mb-3">Administration</p>
      <h1 className="text-4xl">{mode === "in" ? "Sign in" : "Create the administrator account"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {mode === "in"
          ? "For Sentima staff only."
          : "The first account created becomes the administrator. Accounts created afterwards have no access unless granted."}
      </p>
      <form onSubmit={onSubmit} className="card-parchment mt-8 space-y-5 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {msg && <p className={`text-sm ${msg.type === "error" ? "text-destructive" : "text-foreground"}`} role="alert">{msg.text}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} {mode === "in" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-5 text-sm text-seal underline underline-offset-4">
        {mode === "in" ? "Setting up for the first time? Create the administrator account" : "Already have an account? Sign in"}
      </button>
    </section>
  );
}

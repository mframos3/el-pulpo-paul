"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { PaulMascot } from "@/components/paul-mascot";
import { paulCopy } from "@/lib/theme/octopus";
import Link from "next/link";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await signIn("resend", { email });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <header className="mx-auto max-w-7xl w-full px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <PaulMascot className="w-8 h-8" />
          <span className="font-display font-bold text-text-strong">Pulpo Paul</span>
        </Link>
      </header>

      <div className="flex-1 grid place-items-center px-6 pb-20">
        <div className="card-elevated relative w-full max-w-md p-8 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 pitch-grid opacity-[0.08] pointer-events-none" />
          <div className="relative">
            <PaulMascot pose="focused" className="w-20 h-20 mb-5" />
            <h1 className="font-display text-3xl font-bold text-text-strong leading-tight">
              Entra a la polla
            </h1>
            <p className="text-sm text-muted mt-2 mb-7">
              El Pulpo te enviará un link mágico a tu correo. Sin contraseñas.
            </p>

            {status === "sent" ? (
              <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5">
                <div className="text-xs uppercase tracking-widest text-brand-text font-semibold mb-1">
                  Link enviado
                </div>
                <p className="text-sm text-text-strong">
                  Revisa <strong>{email}</strong> y haz clic en el link de Paul.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-widest text-subtle mb-1.5">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl border border-border-subtle bg-bg/60 text-text-strong px-4 py-3 focus:border-brand-border focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-semibold py-3.5 transition shadow-lg shadow-brand/30"
                >
                  {status === "sending" ? paulCopy.prophet.thinking : "Enviarme el link →"}
                </button>
                {error && (
                  <p className="text-xs text-danger-text text-center">{error}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

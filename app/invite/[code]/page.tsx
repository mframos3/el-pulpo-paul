"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PaulMascot } from "@/components/paul-mascot";
import Link from "next/link";

const AVATARS = ["🐙", "⚽️", "🏆", "🥅", "🌊", "🔮", "🎱", "👁️"];

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const invite = useQuery(api.invites.lookup, { code });
  const me = useQuery(api.profiles.me);
  const consume = useMutation(api.invites.consume);
  const register = useMutation(api.profiles.completeRegistration);

  const [displayName, setDisplayName] = useState("");
  const [avatarKey, setAvatarKey] = useState(AVATARS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me && me.userId) router.replace("/dashboard");
  }, [me, router]);

  if (isLoading || invite === undefined) return <Centered>Verificando invitación…</Centered>;

  if (!invite.valid) {
    return (
      <Centered>
        <h1 className="font-display text-2xl text-text-strong mb-2">Invitación inválida</h1>
        <p className="text-sm text-muted">
          {invite.reason === "expired"
            ? "Este código ya expiró."
            : invite.reason === "used"
              ? "Este código ya fue usado."
              : "El Pulpo no reconoce este código."}
        </p>
      </Centered>
    );
  }

  if (!isAuthenticated) {
    return (
      <Centered>
        <h1 className="font-display text-2xl text-text-strong mb-2">Bienvenido a la polla</h1>
        <p className="text-sm text-muted mb-5">
          Primero inicia sesión con tu correo. Volverás aquí a completar tu registro.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/invite/${code}`)}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover text-on-brand px-6 py-3 font-semibold transition"
        >
          Iniciar sesión →
        </Link>
      </Centered>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await consume({ code });
      await register({ displayName: displayName.trim(), avatarKey });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 grid place-items-center px-6 py-12">
      <div className="card-elevated w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute inset-0 pitch-grid opacity-[0.08] pointer-events-none" />
        <div className="relative">
          <PaulMascot pose="victorious" className="w-20 h-20 mb-5" />
          <h1 className="font-display text-2xl font-bold text-text-strong">Eres parte.</h1>
          <p className="text-sm text-muted mt-1 mb-6">Elige tu nombre y un avatar.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest text-subtle mb-1.5">
                Nombre
              </span>
              <input
                required
                minLength={2}
                maxLength={32}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-bg/60 text-text-strong px-4 py-3 focus:border-brand-border focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </label>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-subtle mb-2">
                Avatar
              </span>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatarKey(a)}
                    className={`text-xl rounded-xl aspect-square flex items-center justify-center border transition ${
                      avatarKey === a
                        ? "border-brand-border bg-brand/20"
                        : "border-border-subtle/30 bg-bg/40 hover:border-border-subtle"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || displayName.trim().length < 2}
              className="w-full rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-semibold py-3.5 transition"
            >
              {submitting ? "Sellando…" : "Entrar a la polla →"}
            </button>
            {error && <p className="text-xs text-danger-text text-center">{error}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 grid place-items-center px-6 py-12">
      <div className="card-elevated w-full max-w-md p-8 text-center">
        <PaulMascot pose="idle" className="w-16 h-16 mx-auto mb-3" />
        {children}
      </div>
    </main>
  );
}

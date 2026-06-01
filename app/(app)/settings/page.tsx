"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

const AVATARS = ["🐙", "⚽️", "🏆", "🥅", "🌊", "🔮", "🎱", "👁️"];

export default function SettingsPage() {
  const me = useQuery(api.profiles.me);
  const register = useMutation(api.profiles.completeRegistration);
  const claimAdmin = useMutation(api.seed.claimFirstAdmin);
  const seedRules = useMutation(api.seed.seedScoringRules);
  const [displayName, setDisplayName] = useState("");
  const [avatarKey, setAvatarKey] = useState(AVATARS[0]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (me) {
      setDisplayName(me.displayName);
      setAvatarKey(me.avatarKey);
    }
  }, [me?._id]);

  if (!me) return <p className="text-sm text-subtle">Cargando…</p>;

  async function save() {
    await register({ displayName: displayName.trim(), avatarKey });
    setMsg("Guardado.");
    setTimeout(() => setMsg(null), 1500);
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-brand-text mb-1">Perfil</div>
        <h1 className="font-display text-3xl font-bold text-text-strong">Tu identidad en la polla.</h1>
      </header>

      <section className="card-elevated p-6 space-y-5">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-widest text-subtle mb-1.5">
            Nombre
          </span>
          <input
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
        <div className="flex items-center justify-between text-sm rounded-xl border border-border-subtle/40 bg-bg/40 px-4 py-3">
          <span className="text-[10px] uppercase tracking-widest text-subtle">Buy-in</span>
          <span className={me.buyInPaid ? "text-success-text font-medium" : "text-warning-text font-medium"}>
            {me.buyInPaid ? "● Pagado" : "● Pendiente"}
          </span>
        </div>
        <button
          onClick={save}
          className="w-full rounded-full bg-brand hover:bg-brand-hover text-on-brand py-3 font-semibold transition"
        >
          Guardar
        </button>
        {msg && <p className="text-xs text-brand-text text-center">{msg}</p>}
      </section>

      {!me.isAdmin && (
        <section className="card p-5 text-sm">
          <div className="text-[10px] uppercase tracking-widest text-warning-text mb-2">
            Bootstrap inicial
          </div>
          <p className="text-muted mb-3">
            ¿Eres el primer guardián de la polla? Reclama admin y siembra las reglas de puntaje.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => claimAdmin().then(() => setMsg("Eres admin."))}
              className="px-3 py-1.5 rounded-full border border-brand-border/40 bg-brand/15 text-brand-text text-xs font-medium hover:bg-brand/25"
            >
              Reclamar admin
            </button>
            <button
              onClick={() => seedRules().then(() => setMsg("Reglas listas."))}
              className="px-3 py-1.5 rounded-full border border-warning/40 bg-warning/10 text-warning-text text-xs font-medium hover:bg-warning/20"
            >
              Sembrar reglas
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

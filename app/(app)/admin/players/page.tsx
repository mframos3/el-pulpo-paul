"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function AdminPlayersPage() {
  const me = useQuery(api.profiles.me);
  const players = useQuery(api.profiles.listPlayers);
  const invites = useQuery(api.invites.listMine);
  const createInvite = useMutation(api.invites.create);
  const setBuyIn = useMutation(api.profiles.setBuyInPaid);
  const [lastCode, setLastCode] = useState<string | null>(null);

  if (me === undefined) return <p className="text-sm text-subtle">Cargando…</p>;
  if (!me?.isAdmin) return <p className="text-sm text-subtle">No autorizado.</p>;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-warning-text mb-1">Admin</div>
          <h1 className="font-display text-3xl font-bold text-text-strong">Jugadores</h1>
        </div>
        <button
          onClick={async () => setLastCode(await createInvite({}))}
          className="rounded-full bg-brand hover:bg-brand-hover text-on-brand px-4 py-2 text-sm font-semibold"
        >
          + Invitación
        </button>
      </header>
      {lastCode && (
        <div className="card p-4 text-sm">
          <div className="text-[10px] uppercase tracking-widest text-brand-text font-semibold mb-1">
            Nuevo código
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="font-mono text-base font-bold text-text-strong">{lastCode}</code>
            <code className="font-mono text-xs text-muted truncate">
              {typeof window !== "undefined"
                ? `${window.location.origin}/invite/${lastCode}`
                : ""}
            </code>
          </div>
        </div>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-text-strong mb-3">Jugadores</h2>
        <ul className="card-elevated divide-y divide-gray-4/20">
          {players?.map((p) => (
            <li key={p._id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl">{p.avatarKey}</span>
              <span className="flex-1 font-medium text-text-strong">{p.displayName}</span>
              {p.isAdmin && (
                <span className="text-[10px] uppercase tracking-widest rounded-full bg-warning/15 text-warning-text border border-warning/30 px-2 py-0.5">
                  admin
                </span>
              )}
              <label className="text-xs flex items-center gap-1.5 text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.buyInPaid}
                  onChange={(e) =>
                    setBuyIn({
                      profileId: p._id as Id<"profiles">,
                      paid: e.target.checked,
                    })
                  }
                  className="accent-purple-9"
                />
                Pagó
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-text-strong mb-3">Invitaciones</h2>
        <ul className="card-elevated divide-y divide-gray-4/20 text-sm">
          {invites?.map((i) => (
            <li key={i._id} className="flex items-center gap-3 px-4 py-2.5">
              <code className="font-mono font-bold text-text-strong">{i.code}</code>
              <span className="text-xs text-subtle ml-auto">
                {i.usedBy
                  ? "● Usado"
                  : i.expiresAt < Date.now()
                    ? "● Expirado"
                    : `Expira ${new Date(i.expiresAt).toLocaleDateString("es")}`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

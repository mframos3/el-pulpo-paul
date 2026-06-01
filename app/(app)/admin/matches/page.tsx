"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function AdminMatchesPage() {
  const me = useQuery(api.profiles.me);
  const matches = useQuery(api.matches.list, {});
  const setResult = useMutation(api.matches.setResult);
  const manualSync = useAction(api.footballData.manualSync);
  const refreshFlags = useMutation(api.footballDataInternal.refreshAllFlags);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  if (me === undefined) return <p className="text-sm text-subtle">Cargando…</p>;
  if (!me?.isAdmin) return <p className="text-sm text-subtle">No autorizado.</p>;

  async function runSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await manualSync({});
      setSyncMsg(`Sincronizados: ${result.upserted} · Bloqueados: ${result.skippedLocked}`);
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Error.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-warning-text mb-1">Admin</div>
          <h1 className="font-display text-3xl font-bold text-text-strong">Partidos</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const r = await refreshFlags({});
              setSyncMsg(`Banderas: ${r.updated}/${r.total} actualizadas`);
            }}
            className="rounded-full border border-border-default bg-surface-2 hover:bg-surface-3 text-text-strong px-3 py-2 text-sm transition"
          >
            🏳️ Refrescar banderas
          </button>
          <button
            onClick={runSync}
            disabled={syncing}
            className="rounded-full bg-warning/15 border border-warning/40 text-warning-text px-4 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-warning/25 transition"
          >
            {syncing ? "Sincronizando…" : "↻ Sync football-data"}
          </button>
        </div>
      </header>
      {syncMsg && (
        <p className="text-xs text-muted px-3 py-2 rounded-lg border border-border-subtle/40 bg-surface-1/40 inline-block">
          {syncMsg}
        </p>
      )}

      {!matches || matches.length === 0 ? (
        <p className="text-sm text-subtle">
          Sin partidos. Sincroniza con football-data.
        </p>
      ) : (
        <div className="card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-subtle border-b border-border-subtle/40">
              <tr>
                <th className="px-4 py-3">Kickoff</th>
                <th>Stage</th>
                <th>Local</th>
                <th>Visita</th>
                <th>Resultado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <ResultRow key={m._id} match={m} onSave={setResult} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResultRow({ match, onSave }: { match: any; onSave: any }) {
  const [home, setHome] = useState<number>(match.homeScore ?? 0);
  const [away, setAway] = useState<number>(match.awayScore ?? 0);
  const [status, setStatus] = useState<"scheduled" | "live" | "final">(match.status);
  return (
    <tr className="border-b border-border-subtle/20 last:border-b-0">
      <td className="px-4 py-3 text-muted tabular text-xs">
        {new Date(match.kickoffAt).toLocaleString("es", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="text-muted text-xs uppercase">{match.stage}</td>
      <td className="text-text-strong">{match.homeTeam?.name ?? "—"}</td>
      <td className="text-text-strong">{match.awayTeam?.name ?? "—"}</td>
      <td>
        <div className="flex items-center gap-1.5 py-2">
          <input
            type="number"
            value={home}
            onChange={(e) => setHome(Number(e.target.value))}
            className="w-12 rounded border border-border-subtle bg-bg/60 text-text-strong px-2 py-1 tabular text-center"
          />
          <span className="text-disabled">—</span>
          <input
            type="number"
            value={away}
            onChange={(e) => setAway(Number(e.target.value))}
            className="w-12 rounded border border-border-subtle bg-bg/60 text-text-strong px-2 py-1 tabular text-center"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded border border-border-subtle bg-bg/60 text-text-strong px-2 py-1 text-xs ml-1"
          >
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="final">final</option>
          </select>
        </div>
      </td>
      <td>
        <button
          onClick={() =>
            onSave({
              id: match._id as Id<"matches">,
              homeScore: home,
              awayScore: away,
              status,
            })
          }
          className="rounded-full bg-brand text-on-brand px-3 py-1 text-xs font-medium hover:bg-brand-hover"
        >
          Guardar
        </button>
      </td>
    </tr>
  );
}

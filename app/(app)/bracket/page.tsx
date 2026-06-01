"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { paulCopy, stageLabels, type Stage } from "@/lib/theme/octopus";
import { useState } from "react";

const KNOCKOUT_STAGES: { stage: Stage; slots: number }[] = [
  { stage: "r16", slots: 16 },
  { stage: "qf", slots: 8 },
  { stage: "sf", slots: 4 },
  { stage: "f", slots: 2 },
];

export default function BracketPage() {
  const teams = useQuery(api.teams.list);
  const picks = useQuery(api.bracket.mine);
  const setPick = useMutation(api.bracket.setPick);
  const [error, setError] = useState<string | null>(null);

  const picksByStageSlot = new Map<string, Id<"teams">>();
  for (const p of picks ?? []) {
    picksByStageSlot.set(`${p.stage}:${p.slot}`, p.teamId);
  }

  async function handlePick(stage: Stage, slot: number, teamId: Id<"teams">) {
    setError(null);
    try {
      await setPick({ stage, slot, teamId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-brand-text mb-1">Bracket</div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-strong">
          Tu camino hasta la copa.
        </h1>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Marca qué equipos avanzan en cada ronda. Cada acierto suma puntos cuando ese equipo
          realmente sobrevive.
        </p>
      </header>

      {!teams || teams.length === 0 ? (
        <p className="text-sm text-subtle">{paulCopy.empty.noMatches}</p>
      ) : (
        <div className="space-y-8">
          {KNOCKOUT_STAGES.map(({ stage, slots }) => (
            <section key={stage} className="card-elevated p-5 sm:p-6">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-text-strong">
                  {stageLabels[stage]}
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-subtle tabular">
                  {slots} equipos
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: slots }).map((_, slot) => {
                  const selected = picksByStageSlot.get(`${stage}:${slot}`);
                  return (
                    <select
                      key={slot}
                      value={selected ?? ""}
                      onChange={(e) =>
                        e.target.value && handlePick(stage, slot, e.target.value as Id<"teams">)
                      }
                      className={`rounded-xl border px-3 py-2.5 text-sm bg-bg/60 transition appearance-none ${
                        selected
                          ? "border-brand-border/50 text-text-strong"
                          : "border-border-subtle/50 text-subtle hover:border-border-subtle"
                      }`}
                    >
                      <option value="">Slot {slot + 1}…</option>
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.flagEmoji} {t.name}
                        </option>
                      ))}
                    </select>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-danger-text">{error}</p>}
    </div>
  );
}

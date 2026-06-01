"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { paulCopy, stageLabels, stageShort, type Stage } from "@/lib/theme/octopus";

export default function MatchesPage() {
  const matches = useQuery(api.matches.list, {});
  const myPicks = useQuery(api.predictions.mine);
  const picksByMatch = new Map(myPicks?.map((p) => [p.matchId, p]) ?? []);

  if (matches === undefined) {
    return <p className="text-sm text-subtle">{paulCopy.prophet.thinking}</p>;
  }
  if (matches.length === 0) {
    return <p className="text-sm text-subtle">{paulCopy.empty.noMatches}</p>;
  }

  const grouped = new Map<Stage, typeof matches>();
  for (const m of matches) {
    const arr = grouped.get(m.stage as Stage) ?? [];
    arr.push(m);
    grouped.set(m.stage as Stage, arr);
  }
  const stageOrder: Stage[] = ["group", "r16", "qf", "sf", "3p", "f"];

  return (
    <div className="space-y-10">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-brand-text mb-1">Fixture</div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-strong">
          Mundial 2026 — todos los partidos
        </h1>
      </div>

      {stageOrder.map((s) => {
        const ms = grouped.get(s);
        if (!ms || ms.length === 0) return null;
        return (
          <section key={s}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="font-display text-xl font-bold text-text-strong">{stageLabels[s]}</h2>
              <span className="text-xs text-subtle tabular">{ms.length} partidos</span>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ms.map((m) => {
                const pick = picksByMatch.get(m._id);
                const kickoff = new Date(m.kickoffAt);
                const locked = Date.now() >= m.kickoffAt;
                return (
                  <li key={m._id}>
                    <Link href={`/matches/${m._id}`} className="card group block p-4 hover:border-brand-border/50 transition">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-subtle mb-3">
                        <span className="font-medium text-brand-text">{stageShort[s]}</span>
                        <span>
                          {kickoff.toLocaleString("es", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <TeamRow
                          name={m.homeTeam?.name ?? m.homePlaceholder ?? "Por definir"}
                          flag={m.homeTeam?.flagEmoji}
                          score={m.status === "final" ? m.homeScore : undefined}
                        />
                        <TeamRow
                          name={m.awayTeam?.name ?? m.awayPlaceholder ?? "Por definir"}
                          flag={m.awayTeam?.flagEmoji}
                          score={m.status === "final" ? m.awayScore : undefined}
                        />
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-subtle/40 flex items-center justify-between text-xs">
                        {pick ? (
                          <span className="text-brand-text font-medium tabular">
                            Tu pick {pick.homeScore}–{pick.awayScore}
                          </span>
                        ) : locked ? (
                          <span className="text-disabled">Sin pick</span>
                        ) : (
                          <span className="text-warning-text">Falta tu pick</span>
                        )}
                        {m.status === "final" && (
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-text">
                            ● Final
                          </span>
                        )}
                        {m.status === "live" && (
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-danger-text animate-pulse">
                            ● En vivo
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function TeamRow({ name, flag, score }: { name: string; flag?: string; score?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flag text-xl shrink-0">{flag ?? "🏳️"}</span>
      <span className="flex-1 truncate font-medium text-text-strong">{name}</span>
      {score !== undefined && (
        <span className="font-display text-xl font-bold text-text-strong tabular">{score}</span>
      )}
    </div>
  );
}

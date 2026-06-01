"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { PaulMascot } from "@/components/paul-mascot";
import { paulCopy, stageShort, type Stage } from "@/lib/theme/octopus";

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const matchId = id as Id<"matches">;
  const match = useQuery(api.matches.get, { id: matchId });
  const myPick = useQuery(api.predictions.forMatch, { matchId });
  const reveals = useQuery(api.predictions.revealForMatch, { matchId });
  const submit = useMutation(api.predictions.submit);

  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (myPick) {
      setHome(myPick.homeScore);
      setAway(myPick.awayScore);
    }
  }, [myPick?._id]);

  if (match === undefined) return <p className="text-sm text-subtle">{paulCopy.prophet.thinking}</p>;
  if (match === null) return <p className="text-sm text-subtle">Partido no encontrado.</p>;

  const locked = Date.now() >= match.kickoffAt;
  const kickoff = new Date(match.kickoffAt);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      await submit({ matchId, homeScore: home, awayScore: away });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-xs">
        <span className="px-2.5 py-1 rounded-full bg-brand/20 border border-brand-border/40 text-brand-text font-medium tracking-widest uppercase tabular">
          {stageShort[match.stage as Stage]}
        </span>
        <span className="text-subtle tabular">
          {kickoff.toLocaleString("es", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* SCOREBOARD ------------------------------------------- */}
      <div className="card-elevated p-8 relative overflow-hidden">
        <div className="absolute inset-0 pitch-grid opacity-[0.08] pointer-events-none" />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <TeamBlock
            name={match.homeTeam?.name ?? match.homePlaceholder ?? "Por definir"}
            flag={match.homeTeam?.flagEmoji}
            align="left"
          />
          <div className="text-center">
            {match.status === "final" ? (
              <div className="font-display text-5xl sm:text-6xl font-bold text-text-strong tabular leading-none">
                {match.homeScore}<span className="text-disabled mx-2">—</span>{match.awayScore}
              </div>
            ) : (
              <div className="font-display text-3xl sm:text-4xl font-bold text-subtle tabular leading-none">
                VS
              </div>
            )}
            <div className="mt-3 text-[10px] uppercase tracking-widest text-subtle">
              {match.status === "final" ? "Final" : locked ? "En curso" : "Programado"}
            </div>
          </div>
          <TeamBlock
            name={match.awayTeam?.name ?? match.awayPlaceholder ?? "Por definir"}
            flag={match.awayTeam?.flagEmoji}
            align="right"
          />
        </div>
      </div>

      {/* PREDICTION ------------------------------------------- */}
      <div className="card-elevated p-6 sm:p-8 relative overflow-hidden">
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-purple-1/80 backdrop-blur-sm"
            >
              <div className="text-center">
                <PaulMascot pose="victorious" className="w-28 h-28 mx-auto" />
                <p className="font-display text-2xl text-text-strong mt-2">{paulCopy.prophet.saved}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-text-strong">
            {locked ? "Predicciones reveladas" : "Tu predicción"}
          </h2>
          {!locked && myPick && (
            <span className="text-xs text-success-text">● Sellada</span>
          )}
        </div>

        {locked ? (
          <RevealedPicks myPick={myPick} reveals={reveals} actual={match} />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <ScoreCounter
                label={match.homeTeam?.name ?? "Local"}
                value={home}
                onChange={setHome}
              />
              <span className="text-disabled font-display text-2xl">—</span>
              <ScoreCounter
                label={match.awayTeam?.name ?? "Visita"}
                value={away}
                onChange={setAway}
              />
            </div>
            <button
              onClick={onSave}
              disabled={saving}
              className="mt-6 w-full rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-semibold py-3.5 transition shadow-lg shadow-brand/30"
            >
              {saving
                ? paulCopy.prophet.thinking
                : myPick
                  ? "Actualizar predicción"
                  : "Sellar predicción"}
            </button>
            {error && <p className="mt-3 text-xs text-danger-text text-center">{error}</p>}
            <p className="mt-3 text-[10px] uppercase tracking-widest text-subtle text-center">
              Puedes editar hasta el silbatazo
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function TeamBlock({
  name,
  flag,
  align,
}: {
  name: string;
  flag?: string;
  align: "left" | "right";
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${align === "right" ? "sm:items-end" : "sm:items-start"}`}>
      <div className="flag text-5xl">{flag ?? "🏳️"}</div>
      <div className="font-display font-semibold text-text-strong text-center sm:text-inherit">{name}</div>
    </div>
  );
}

function ScoreCounter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle/50 bg-bg/60 p-4 text-center">
      <div className="text-[10px] uppercase tracking-widest text-subtle truncate mb-3">{label}</div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="size-10 rounded-full border border-border-subtle/50 text-text-strong text-lg hover:border-brand-border hover:text-brand-text transition"
          aria-label="restar"
        >
          −
        </button>
        <div className="font-display text-5xl font-bold text-text-strong w-14 tabular">{value}</div>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="size-10 rounded-full bg-brand text-on-brand text-lg hover:bg-brand-hover transition"
          aria-label="sumar"
        >
          +
        </button>
      </div>
    </div>
  );
}

function RevealedPicks({
  myPick,
  reveals,
  actual,
}: {
  myPick: { homeScore: number; awayScore: number } | null | undefined;
  reveals: Array<{ userId: string; homeScore: number; awayScore: number }> | undefined;
  actual: { status: string; homeScore?: number; awayScore?: number };
}) {
  const exactMatchers = reveals?.filter(
    (r) =>
      actual.status === "final" &&
      r.homeScore === actual.homeScore &&
      r.awayScore === actual.awayScore,
  ).length ?? 0;
  return (
    <div className="space-y-4">
      {myPick && (
        <div className="rounded-xl border border-border-subtle/50 bg-bg/40 p-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-subtle">Tu pick</span>
          <span className="font-display text-2xl tabular text-text-strong">
            {myPick.homeScore} — {myPick.awayScore}
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-subtle/50 bg-bg/40 p-4">
          <div className="text-[10px] uppercase tracking-widest text-subtle mb-1">Predicciones</div>
          <div className="font-display text-2xl text-text-strong tabular">{reveals?.length ?? 0}</div>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-warning-text mb-1">Marcador exacto</div>
          <div className="font-display text-2xl text-warning-text tabular">{exactMatchers}</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { paulCopy } from "@/lib/theme/octopus";
import { PaulMascot } from "@/components/paul-mascot";
import { motion } from "motion/react";

export default function LeaderboardPage() {
  const standings = useQuery(api.leaderboard.standings);
  const me = useQuery(api.profiles.me);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-brand-text mb-1">Tabla</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-strong">
            Los tentáculos más certeros.
          </h1>
        </div>
        <PaulMascot pose="victorious" className="w-16 h-16 hidden sm:block" />
      </header>

      {standings === undefined ? (
        <p className="text-sm text-subtle">{paulCopy.prophet.thinking}</p>
      ) : standings.length === 0 ? (
        <p className="text-sm text-subtle">{paulCopy.empty.noLeaderboard}</p>
      ) : (
        <>
          {/* PODIUM ------------------------------------------------ */}
          {standings.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 items-end">
              <PodiumColumn row={standings[1]} place={2} isMe={standings[1].userId === me?.userId} />
              <PodiumColumn row={standings[0]} place={1} isMe={standings[0].userId === me?.userId} />
              <PodiumColumn row={standings[2]} place={3} isMe={standings[2].userId === me?.userId} />
            </div>
          )}

          {/* FULL TABLE ------------------------------------------- */}
          <div className="card-elevated overflow-hidden">
            <div className="px-5 py-3 border-b border-border-subtle/40 grid grid-cols-[40px_1fr_80px_100px] gap-3 text-[10px] uppercase tracking-widest text-subtle">
              <span>#</span>
              <span>Jugador</span>
              <span className="text-right">Partidos</span>
              <span className="text-right">Puntos</span>
            </div>
            <ul>
              {standings.map((row, i) => (
                <motion.li
                  key={row.userId}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`px-5 py-3.5 grid grid-cols-[40px_1fr_80px_100px] items-center gap-3 border-b border-border-subtle/20 last:border-b-0 ${
                    row.userId === me?.userId ? "bg-brand/15" : ""
                  }`}
                >
                  <span className={`font-display text-base tabular ${rankColor(row.rank)}`}>
                    {row.rank}
                  </span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-surface-2 border border-border-subtle grid place-items-center text-base shrink-0">
                      {row.avatarKey}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-text-strong truncate">{row.displayName}</div>
                      <div className="text-[10px] uppercase tracking-widest text-subtle">
                        {row.buyInPaid ? "Pagó" : "Pendiente"}
                      </div>
                    </div>
                  </div>
                  <span className="text-right text-sm text-muted tabular">
                    {row.matchesScored}
                  </span>
                  <span className="text-right font-display text-xl font-bold text-text-strong tabular">
                    {row.points}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function rankColor(rank: number) {
  if (rank === 1) return "text-warning-text";
  if (rank === 2) return "text-muted";
  if (rank === 3) return "text-warning-text";
  return "text-subtle";
}

function PodiumColumn({
  row,
  place,
  isMe,
}: {
  row: { displayName: string; avatarKey: string; points: number };
  place: 1 | 2 | 3;
  isMe: boolean;
}) {
  const config = {
    1: { medal: "🥇", height: "h-44", bar: "from-gold/30 to-gold/5", text: "text-warning-text" },
    2: { medal: "🥈", height: "h-36", bar: "from-silver/25 to-silver/5", text: "text-muted" },
    3: { medal: "🥉", height: "h-32", bar: "from-bronze/25 to-bronze/5", text: "text-warning-text" },
  }[place];
  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl mb-2">{row.avatarKey}</div>
      <div className="text-center mb-2">
        <div className="text-sm font-medium text-text-strong truncate max-w-[140px]">{row.displayName}</div>
        <div className={`font-display text-xl font-bold tabular ${config.text}`}>{row.points}</div>
      </div>
      <div
        className={`w-full ${config.height} rounded-t-2xl bg-gradient-to-t ${config.bar} border-t border-x border-border-subtle/40 grid place-items-center text-3xl ${
          isMe ? "ring-2 ring-purple-9" : ""
        }`}
      >
        {config.medal}
      </div>
    </div>
  );
}

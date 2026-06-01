"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { paulCopy } from "@/lib/theme/octopus";
import { PaulMascot } from "@/components/paul-mascot";

export default function DashboardPage() {
  const me = useQuery(api.profiles.me);
  const upcoming = useQuery(api.matches.upcoming, { limit: 5 });
  const myPicks = useQuery(api.predictions.mine);
  const standings = useQuery(api.leaderboard.standings);

  const picksByMatch = new Map(myPicks?.map((p) => [p.matchId, p]) ?? []);
  const myRank = standings?.find((s) => s.userId === me?.userId);
  const top3 = standings?.slice(0, 3) ?? [];

  return (
    <div className="space-y-10">
      {/* HEADLINE ----------------------------------------------- */}
      <section className="card-elevated p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pitch-grid opacity-[0.08] pointer-events-none" />
        <div className="relative flex items-center gap-6">
          <PaulMascot
            pose={myRank && myRank.rank <= 3 ? "victorious" : "focused"}
            className="hidden sm:block w-24 h-24 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-text mb-1">
              Bienvenido, {me?.displayName ?? "…"}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-strong leading-tight">
              {myRank
                ? `Vas #${myRank.rank} con ${myRank.points} puntos.`
                : "El Pulpo te observa."}
            </h1>
            <p className="text-sm text-muted mt-2">
              {myPicks && myPicks.length > 0
                ? `${myPicks.length} predicción${myPicks.length === 1 ? "" : "es"} selladas. ${paulCopy.prophet.confident}`
                : "Aún sin predicciones. Marca tus marcadores antes del silbatazo."}
            </p>
          </div>
        </div>

        {standings && standings.length > 0 && (
          <div className="relative mt-6 grid grid-cols-3 gap-2">
            {top3.map((row, i) => (
              <PodiumSlot
                key={row.userId}
                row={row}
                place={(i + 1) as 1 | 2 | 3}
                isMe={row.userId === me?.userId}
              />
            ))}
          </div>
        )}
      </section>

      {/* UPCOMING ----------------------------------------------- */}
      <section>
        <SectionHead title="Próximos partidos" actionLabel="Ver todos" actionHref="/matches" />
        {upcoming === undefined ? (
          <SkeletonRow />
        ) : upcoming.length === 0 ? (
          <EmptyHint label={paulCopy.empty.noMatches} />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {upcoming.map((m) => {
              const pick = picksByMatch.get(m._id);
              return (
                <li key={m._id}>
                  <Link
                    href={`/matches/${m._id}`}
                    className="card group block p-5 hover:border-brand-border/50 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-subtle mb-3">
                      <span>
                        {new Date(m.kickoffAt).toLocaleString("es", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {pick ? (
                        <span className="text-brand-text font-semibold tabular">
                          {pick.homeScore}–{pick.awayScore}
                        </span>
                      ) : (
                        <span className="text-warning-text">Sin pick</span>
                      )}
                    </div>
                    <div className="font-display text-lg text-text-strong truncate">
                      Partido <span className="text-subtle tabular">#{m._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-subtle">{paulCopy.prophet.confident}</span>
                      <span className="text-brand-text opacity-0 group-hover:opacity-100 transition">→</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function PodiumSlot({
  row,
  place,
  isMe,
}: {
  row: { displayName: string; avatarKey: string; points: number };
  place: 1 | 2 | 3;
  isMe: boolean;
}) {
  const styles = {
    1: { bg: "bg-warning/15", border: "border-warning/40", text: "text-warning-text", medal: "🥇", height: "h-24" },
    2: { bg: "bg-disabled/10", border: "border-gray-9/30", text: "text-muted", medal: "🥈", height: "h-20" },
    3: { bg: "bg-amber-7/10", border: "border-amber-7/30", text: "text-warning-text", medal: "🥉", height: "h-20" },
  }[place];
  return (
    <div
      className={`rounded-xl border ${styles.border} ${styles.bg} p-3 ${styles.height} flex flex-col justify-between ${isMe ? "ring-2 ring-purple-9" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{styles.medal}</span>
        <span className="text-2xl">{row.avatarKey}</span>
      </div>
      <div>
        <div className="text-xs font-medium text-text-strong truncate">{row.displayName}</div>
        <div className={`font-display text-lg tabular ${styles.text}`}>{row.points} pts</div>
      </div>
    </div>
  );
}

function SectionHead({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-text-strong">{title}</h2>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-xs text-brand-text hover:text-purple-12">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {[0, 1].map((i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="h-3 w-1/3 bg-surface-3 rounded mb-3" />
          <div className="h-5 w-2/3 bg-surface-3 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyHint({ label }: { label: string }) {
  return <p className="text-sm text-subtle">{label}</p>;
}

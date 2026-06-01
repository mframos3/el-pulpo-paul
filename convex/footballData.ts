"use node";

import { action, internalAction } from "./_generated/server";
import { z } from "zod";
import { internal } from "./_generated/api";

const API_BASE = "https://api.football-data.org/v4";
const COMPETITION = "WC";

const TeamSchema = z.object({
  id: z.number().nullable(),
  name: z.string().nullable().optional(),
  tla: z.string().nullable().optional(),
});

const MatchSchema = z.object({
  id: z.number(),
  utcDate: z.string(),
  status: z.string(),
  stage: z.string(),
  group: z.string().nullable().optional(),
  homeTeam: TeamSchema,
  awayTeam: TeamSchema,
  score: z.object({
    fullTime: z.object({
      home: z.number().nullable(),
      away: z.number().nullable(),
    }),
    winner: z.string().nullable().optional(),
  }),
});

const MatchesResponseSchema = z.object({
  matches: z.array(MatchSchema),
});

const STAGE_MAP: Record<string, "group" | "r16" | "qf" | "sf" | "f" | "3p"> = {
  GROUP_STAGE: "group",
  LAST_16: "r16",
  QUARTER_FINALS: "qf",
  SEMI_FINALS: "sf",
  FINAL: "f",
  THIRD_PLACE: "3p",
};

const STATUS_MAP: Record<string, "scheduled" | "live" | "final"> = {
  SCHEDULED: "scheduled",
  TIMED: "scheduled",
  IN_PLAY: "live",
  PAUSED: "live",
  FINISHED: "final",
};

async function pullAndUpsert(
  ctx: any,
): Promise<{ upserted: number; skippedLocked: number; flagsUpdated: number }> {
  const apiKey = process.env.FOOTBALL_DATA_KEY;
  if (!apiKey) {
    console.log("FOOTBALL_DATA_KEY no configurado — sync omitido.");
    return { upserted: 0, skippedLocked: 0, flagsUpdated: 0 };
  }
  const res = await fetch(`${API_BASE}/competitions/${COMPETITION}/matches`, {
    headers: { "X-Auth-Token": apiKey },
  });
  if (!res.ok) {
    throw new Error(`football-data.org devolvió ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const parsed = MatchesResponseSchema.parse(json);
  return await ctx.runMutation(internal.footballDataInternal.upsertMany, {
    matches: parsed.matches.map((m) => ({
      externalId: m.id,
      stage: STAGE_MAP[m.stage] ?? "group",
      groupLetter: m.group?.replace("GROUP_", "") ?? undefined,
      kickoffAt: new Date(m.utcDate).getTime(),
      status: STATUS_MAP[m.status] ?? "scheduled",
      homeExternalId: m.homeTeam.id ?? undefined,
      homeName: m.homeTeam.name ?? null,
      homeTla: m.homeTeam.tla ?? null,
      awayExternalId: m.awayTeam.id ?? undefined,
      awayName: m.awayTeam.name ?? null,
      awayTla: m.awayTeam.tla ?? null,
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
    })),
  });
}

export const sync = internalAction({
  args: {},
  handler: async (ctx) => pullAndUpsert(ctx),
});

export const manualSync = action({
  args: {},
  handler: async (ctx) => {
    // Admin check happens inside a mutation, so we delegate it through a query call.
    // Cheaper: require an admin profile via runQuery.
    const userId = await ctx.runQuery(internal.profilesInternal.adminOrThrow, {});
    if (!userId) throw new Error("No autorizado.");
    return pullAndUpsert(ctx);
  },
});

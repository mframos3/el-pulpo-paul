import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./profiles";
import { matchStatusValidator, stageValidator } from "./schema";

export const list = query({
  args: { stage: v.optional(stageValidator) },
  handler: async (ctx, { stage }) => {
    const q = stage
      ? ctx.db.query("matches").withIndex("by_stage", (q) => q.eq("stage", stage))
      : ctx.db.query("matches").withIndex("by_kickoff");
    const matches = await q.collect();
    matches.sort((a, b) => a.kickoffAt - b.kickoffAt);

    const teamIds = new Set<string>();
    for (const m of matches) {
      if (m.homeTeamId) teamIds.add(m.homeTeamId);
      if (m.awayTeamId) teamIds.add(m.awayTeamId);
    }
    const teams = await Promise.all(
      Array.from(teamIds).map((id) => ctx.db.get(id as any)),
    );
    const teamMap = new Map(teams.filter(Boolean).map((t: any) => [t._id, t]));

    return matches.map((m) => ({
      ...m,
      homeTeam: m.homeTeamId ? teamMap.get(m.homeTeamId) ?? null : null,
      awayTeam: m.awayTeamId ? teamMap.get(m.awayTeamId) ?? null : null,
    }));
  },
});

export const get = query({
  args: { id: v.id("matches") },
  handler: async (ctx, { id }) => {
    const m = await ctx.db.get(id);
    if (!m) return null;
    const [homeTeam, awayTeam] = await Promise.all([
      m.homeTeamId ? ctx.db.get(m.homeTeamId) : null,
      m.awayTeamId ? ctx.db.get(m.awayTeamId) : null,
    ]);
    return { ...m, homeTeam, awayTeam };
  },
});

export const upcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const now = Date.now();
    const all = await ctx.db
      .query("matches")
      .withIndex("by_kickoff", (q) => q.gt("kickoffAt", now))
      .take(limit ?? 3);
    return all;
  },
});

export const create = mutation({
  args: {
    stage: stageValidator,
    groupLetter: v.optional(v.string()),
    homeTeamId: v.optional(v.id("teams")),
    awayTeamId: v.optional(v.id("teams")),
    homePlaceholder: v.optional(v.string()),
    awayPlaceholder: v.optional(v.string()),
    kickoffAt: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("matches", {
      ...args,
      status: "scheduled" as const,
      locked: false,
    });
  },
});

export const setResult = mutation({
  args: {
    id: v.id("matches"),
    homeScore: v.number(),
    awayScore: v.number(),
    status: matchStatusValidator,
    winnerTeamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, { id, homeScore, awayScore, status, winnerTeamId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { homeScore, awayScore, status, winnerTeamId, locked: true });
  },
});

export const setTeams = mutation({
  args: {
    id: v.id("matches"),
    homeTeamId: v.optional(v.id("teams")),
    awayTeamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, { id, homeTeamId, awayTeamId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { homeTeamId, awayTeamId, locked: true });
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUserId } from "./profiles";

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("predictions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const forMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("predictions")
      .withIndex("by_user_match", (q) => q.eq("userId", userId).eq("matchId", matchId))
      .unique();
  },
});

export const submit = mutation({
  args: {
    matchId: v.id("matches"),
    homeScore: v.number(),
    awayScore: v.number(),
  },
  handler: async (ctx, { matchId, homeScore, awayScore }) => {
    const userId = await requireUserId(ctx);
    if (homeScore < 0 || awayScore < 0 || homeScore > 20 || awayScore > 20) {
      throw new Error("Marcador fuera de rango.");
    }
    const match = await ctx.db.get(matchId);
    if (!match) throw new Error("Partido no encontrado.");
    if (Date.now() >= match.kickoffAt) {
      throw new Error("Paul ya selló este partido — no se aceptan más predicciones.");
    }
    const existing = await ctx.db
      .query("predictions")
      .withIndex("by_user_match", (q) => q.eq("userId", userId).eq("matchId", matchId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { homeScore, awayScore, submittedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("predictions", {
      userId,
      matchId,
      homeScore,
      awayScore,
      submittedAt: Date.now(),
    });
  },
});

// Returns all predictions for a match — but only after kickoff has passed,
// to prevent peeking at others' picks before the match starts.
export const revealForMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await ctx.db.get(matchId);
    if (!match) return [];
    if (Date.now() < match.kickoffAt) return [];
    return await ctx.db
      .query("predictions")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .collect();
  },
});

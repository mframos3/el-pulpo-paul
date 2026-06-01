import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUserId } from "./profiles";
import { stageValidator } from "./schema";

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("bracketPicks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const setPick = mutation({
  args: {
    stage: stageValidator,
    slot: v.number(),
    teamId: v.id("teams"),
  },
  handler: async (ctx, { stage, slot, teamId }) => {
    const userId = await requireUserId(ctx);
    // Lock bracket once any match of that stage has kicked off.
    const stageMatches = await ctx.db
      .query("matches")
      .withIndex("by_stage", (q) => q.eq("stage", stage))
      .collect();
    const anyStarted = stageMatches.some((m) => Date.now() >= m.kickoffAt);
    if (anyStarted) {
      throw new Error("Paul ya inició esta ronda — el bracket está sellado.");
    }
    const existing = await ctx.db
      .query("bracketPicks")
      .withIndex("by_user_stage_slot", (q) =>
        q.eq("userId", userId).eq("stage", stage).eq("slot", slot),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { teamId });
      return existing._id;
    }
    return await ctx.db.insert("bracketPicks", { userId, stage, slot, teamId });
  },
});

import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { stageValidator, matchStatusValidator } from "./schema";
import { flagFor } from "./teamFlags";

export const upsertMany = internalMutation({
  args: {
    matches: v.array(
      v.object({
        externalId: v.number(),
        stage: stageValidator,
        groupLetter: v.optional(v.string()),
        kickoffAt: v.number(),
        status: matchStatusValidator,
        homeExternalId: v.optional(v.number()),
        homeName: v.union(v.string(), v.null()),
        homeTla: v.union(v.string(), v.null()),
        awayExternalId: v.optional(v.number()),
        awayName: v.union(v.string(), v.null()),
        awayTla: v.union(v.string(), v.null()),
        homeScore: v.union(v.number(), v.null()),
        awayScore: v.union(v.number(), v.null()),
      }),
    ),
  },
  handler: async (ctx, { matches }) => {
    let upserted = 0;
    let skippedLocked = 0;

    for (const m of matches) {
      const homeTeamId = await ensureTeam(ctx, m.homeExternalId, m.homeTla, m.homeName);
      const awayTeamId = await ensureTeam(ctx, m.awayExternalId, m.awayTla, m.awayName);

      const existing = await ctx.db
        .query("matches")
        .withIndex("by_external", (q) => q.eq("externalId", m.externalId))
        .unique();

      const baseFields = {
        externalId: m.externalId,
        stage: m.stage,
        groupLetter: m.groupLetter,
        kickoffAt: m.kickoffAt,
        homeTeamId: homeTeamId ?? undefined,
        awayTeamId: awayTeamId ?? undefined,
      };

      const resultFields = {
        status: m.status,
        homeScore: m.homeScore ?? undefined,
        awayScore: m.awayScore ?? undefined,
      };

      if (!existing) {
        await ctx.db.insert("matches", {
          ...baseFields,
          ...resultFields,
          locked: false,
        });
        upserted++;
      } else if (existing.locked) {
        // Respect manual locks — only refresh kickoff time/team assignments if not changed by admin.
        skippedLocked++;
      } else {
        await ctx.db.patch(existing._id, { ...baseFields, ...resultFields });
        upserted++;
      }
    }

    // Always re-derive every team's flag from its code so any stale placeholders heal.
    const allTeams = await ctx.db.query("teams").collect();
    let flagsUpdated = 0;
    for (const t of allTeams) {
      const next = flagFor(t.code);
      if (next !== t.flagEmoji) {
        await ctx.db.patch(t._id, { flagEmoji: next });
        flagsUpdated++;
      }
    }

    return { upserted, skippedLocked, flagsUpdated };
  },
});

async function ensureTeam(
  ctx: any,
  externalId: number | undefined,
  tla: string | null,
  name: string | null,
): Promise<Id<"teams"> | null> {
  if (!externalId || !name) return null;
  const existing = await ctx.db
    .query("teams")
    .withIndex("by_external", (q: any) => q.eq("externalId", externalId))
    .unique();
  const code = tla ?? name.slice(0, 3).toUpperCase();
  if (existing) {
    // Backfill flag if it's still a placeholder
    if (existing.flagEmoji === "🏴" || existing.flagEmoji === "🏳️") {
      await ctx.db.patch(existing._id, { flagEmoji: flagFor(code) });
    }
    return existing._id;
  }
  return await ctx.db.insert("teams", {
    code,
    name,
    flagEmoji: flagFor(code),
    externalId,
  });
}

/**
 * One-shot admin migration: rewrite every team's flagEmoji from its code.
 * Run from the Convex dashboard (or wire a button) after sync to clean up legacy rows.
 */
export const refreshAllFlags = mutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    let updated = 0;
    for (const t of teams) {
      const next = flagFor(t.code);
      if (next !== t.flagEmoji) {
        await ctx.db.patch(t._id, { flagEmoji: next });
        updated++;
      }
    }
    return { updated, total: teams.length };
  },
});

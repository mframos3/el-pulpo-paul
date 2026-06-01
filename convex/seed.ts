import { mutation } from "./_generated/server";
import { DEFAULT_SCORING_RULES } from "./scoring";
import { getAuthUserId } from "@convex-dev/auth/server";

export const seedScoringRules = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("scoringRules").collect();
    if (existing.length > 0) return { skipped: true };
    for (const [key, points] of Object.entries(DEFAULT_SCORING_RULES)) {
      await ctx.db.insert("scoringRules", { key, points });
    }
    return { seeded: true };
  },
});

export const claimFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Inicia sesión primero.");
    const profiles = await ctx.db.query("profiles").collect();
    const anyAdmin = profiles.some((p) => p.isAdmin);
    if (anyAdmin) throw new Error("Ya existe un admin. Pídele que te promueva.");
    const me = profiles.find((p) => p.userId === userId);
    if (!me) throw new Error("Tu perfil no existe todavía. Crea uno primero.");
    await ctx.db.patch(me._id, { isAdmin: true });
  },
});

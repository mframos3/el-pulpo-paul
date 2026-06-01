import { internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const adminOrThrow = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado.");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile?.isAdmin) throw new Error("Solo el guardián de Paul puede hacer esto.");
    return userId;
  },
});

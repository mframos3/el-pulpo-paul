import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Paul no te reconoce. Inicia sesión primero.");
  return userId;
}

export async function requireProfile(ctx: QueryCtx | MutationCtx) {
  const userId = await requireUserId(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!profile) throw new Error("Tu perfil aún no existe. Completa tu registro.");
  return { userId, profile };
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { userId, profile } = await requireProfile(ctx);
  if (!profile.isAdmin) throw new Error("Solo el guardián de Paul puede hacer esto.");
  return { userId, profile };
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return profile;
  },
});

export const completeRegistration = mutation({
  args: { displayName: v.string(), avatarKey: v.string() },
  handler: async (ctx, { displayName, avatarKey }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { displayName, avatarKey });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId,
      displayName,
      avatarKey,
      buyInPaid: false,
      isAdmin: false,
    });
  },
});

export const setBuyInPaid = mutation({
  args: { profileId: v.id("profiles"), paid: v.boolean() },
  handler: async (ctx, { profileId, paid }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(profileId, { buyInPaid: paid });
  },
});

export const listPlayers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("profiles").collect();
  },
});

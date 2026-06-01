import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUserId } from "./profiles";

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const create = mutation({
  args: { ttlDays: v.optional(v.number()) },
  handler: async (ctx, { ttlDays }) => {
    const { userId } = await requireAdmin(ctx);
    const code = generateCode();
    const expiresAt = Date.now() + (ttlDays ?? 30) * DAY_MS;
    await ctx.db.insert("invites", { code, createdBy: userId, expiresAt });
    return code;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("invites").collect();
  },
});

export const consume = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const userId = await requireUserId(ctx);
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!invite) throw new Error("Código no encontrado.");
    if (invite.expiresAt < Date.now()) throw new Error("Código expirado.");
    if (invite.usedBy) throw new Error("Código ya usado.");
    await ctx.db.patch(invite._id, { usedBy: userId });
    return invite._id;
  },
});

export const lookup = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!invite) return { valid: false as const, reason: "not_found" as const };
    if (invite.expiresAt < Date.now()) return { valid: false as const, reason: "expired" as const };
    if (invite.usedBy) return { valid: false as const, reason: "used" as const };
    return { valid: true as const };
  },
});

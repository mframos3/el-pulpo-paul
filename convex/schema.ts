import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const stageValidator = v.union(
  v.literal("group"),
  v.literal("r16"),
  v.literal("qf"),
  v.literal("sf"),
  v.literal("f"),
  v.literal("3p"),
);

export const matchStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("live"),
  v.literal("final"),
);

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatarKey: v.string(),
    buyInPaid: v.boolean(),
    isAdmin: v.boolean(),
  }).index("by_user", ["userId"]),

  teams: defineTable({
    code: v.string(), // FIFA code, e.g. "ARG"
    name: v.string(),
    group: v.optional(v.string()), // "A".."L"
    flagEmoji: v.string(),
    externalId: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_external", ["externalId"]),

  matches: defineTable({
    externalId: v.optional(v.number()),
    stage: stageValidator,
    groupLetter: v.optional(v.string()),
    homeTeamId: v.optional(v.id("teams")),
    awayTeamId: v.optional(v.id("teams")),
    homePlaceholder: v.optional(v.string()), // e.g. "Winner of M49"
    awayPlaceholder: v.optional(v.string()),
    kickoffAt: v.number(), // ms epoch
    status: matchStatusValidator,
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    winnerTeamId: v.optional(v.id("teams")),
    locked: v.boolean(), // manual edits set this; sync respects it
  })
    .index("by_external", ["externalId"])
    .index("by_kickoff", ["kickoffAt"])
    .index("by_stage", ["stage"]),

  predictions: defineTable({
    userId: v.id("users"),
    matchId: v.id("matches"),
    homeScore: v.number(),
    awayScore: v.number(),
    submittedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_match", ["matchId"])
    .index("by_user_match", ["userId", "matchId"]),

  bracketPicks: defineTable({
    userId: v.id("users"),
    stage: stageValidator,
    slot: v.number(),
    teamId: v.id("teams"),
  })
    .index("by_user", ["userId"])
    .index("by_user_stage_slot", ["userId", "stage", "slot"]),

  scoringRules: defineTable({
    key: v.string(),
    points: v.number(),
  }).index("by_key", ["key"]),

  invites: defineTable({
    code: v.string(),
    createdBy: v.id("users"),
    usedBy: v.optional(v.id("users")),
    expiresAt: v.number(),
  }).index("by_code", ["code"]),
});

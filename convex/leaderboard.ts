import { query } from "./_generated/server";
import { DEFAULT_SCORING_RULES, scoreMatchPrediction, ScoringRules } from "./scoring";
import type { Stage } from "../lib/theme/octopus";

async function loadRules(ctx: any): Promise<ScoringRules> {
  const rows = await ctx.db.query("scoringRules").collect();
  const rules: ScoringRules = { ...DEFAULT_SCORING_RULES };
  for (const r of rows) rules[r.key] = r.points;
  return rules;
}

// Which stages contain a given team? Used to award bracket points.
function nextStage(stage: Stage): Stage | null {
  const order: Stage[] = ["group", "r16", "qf", "sf", "f"];
  const i = order.indexOf(stage);
  if (i < 0 || i >= order.length - 1) return null;
  return order[i + 1];
}

export const standings = query({
  args: {},
  handler: async (ctx) => {
    const rules = await loadRules(ctx);
    const profiles = await ctx.db.query("profiles").collect();
    const allPredictions = await ctx.db.query("predictions").collect();
    const allBracket = await ctx.db.query("bracketPicks").collect();
    const allMatches = await ctx.db.query("matches").collect();

    const finalMatchById = new Map(
      allMatches.filter((m) => m.status === "final").map((m) => [m._id, m]),
    );

    // Teams that *reached* each stage (i.e. played at that stage).
    const reachedByStage = new Map<Stage, Set<string>>();
    for (const m of allMatches) {
      const set = reachedByStage.get(m.stage as Stage) ?? new Set<string>();
      if (m.homeTeamId) set.add(m.homeTeamId);
      if (m.awayTeamId) set.add(m.awayTeamId);
      reachedByStage.set(m.stage as Stage, set);
    }

    const pointsByUser = new Map<string, number>();
    const matchesScoredByUser = new Map<string, number>();

    for (const p of allPredictions) {
      const m = finalMatchById.get(p.matchId);
      if (!m || m.homeScore == null || m.awayScore == null) continue;
      const pts = scoreMatchPrediction(
        { homeScore: p.homeScore, awayScore: p.awayScore },
        { homeScore: m.homeScore, awayScore: m.awayScore },
        rules,
      );
      pointsByUser.set(p.userId, (pointsByUser.get(p.userId) ?? 0) + pts);
      matchesScoredByUser.set(p.userId, (matchesScoredByUser.get(p.userId) ?? 0) + 1);
    }

    const bracketPoints = rules.bracketTeamAdvances ?? DEFAULT_SCORING_RULES.bracketTeamAdvances;
    for (const pick of allBracket) {
      // Reward a bracket pick once the *next* stage has started, meaning the team actually advanced past pick.stage.
      const ns = nextStage(pick.stage as Stage);
      const reached = ns ? reachedByStage.get(ns) : reachedByStage.get(pick.stage as Stage);
      if (reached && reached.has(pick.teamId)) {
        pointsByUser.set(pick.userId, (pointsByUser.get(pick.userId) ?? 0) + bracketPoints);
      }
    }

    const rows = profiles
      .map((profile) => ({
        userId: profile.userId,
        displayName: profile.displayName,
        avatarKey: profile.avatarKey,
        buyInPaid: profile.buyInPaid,
        points: pointsByUser.get(profile.userId) ?? 0,
        matchesScored: matchesScoredByUser.get(profile.userId) ?? 0,
      }))
      .sort((a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName));

    return rows.map((row, idx) => ({ ...row, rank: idx + 1 }));
  },
});

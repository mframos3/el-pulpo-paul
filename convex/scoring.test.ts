import { describe, it, expect } from "vitest";
import { DEFAULT_SCORING_RULES, scoreMatchPrediction, scoreBracketPick } from "./scoring";

const rules = { ...DEFAULT_SCORING_RULES };

describe("scoreMatchPrediction", () => {
  it("awards exact-score points for exact match", () => {
    expect(
      scoreMatchPrediction({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 }, rules),
    ).toBe(rules.exact);
  });

  it("awards result + goal diff when diff is correct", () => {
    // predict 3-1, actual 2-0 → same diff (2), same result (home win)
    expect(
      scoreMatchPrediction({ homeScore: 3, awayScore: 1 }, { homeScore: 2, awayScore: 0 }, rules),
    ).toBe(rules.result + rules.goalDiff);
  });

  it("awards only result when winner correct but diff wrong", () => {
    expect(
      scoreMatchPrediction({ homeScore: 3, awayScore: 0 }, { homeScore: 1, awayScore: 0 }, rules),
    ).toBe(rules.result);
  });

  it("awards zero when result wrong", () => {
    expect(
      scoreMatchPrediction({ homeScore: 0, awayScore: 2 }, { homeScore: 2, awayScore: 0 }, rules),
    ).toBe(0);
  });

  it("draws: exact draw gives exact; any other draw gives result + goal diff (both are 0)", () => {
    expect(
      scoreMatchPrediction({ homeScore: 1, awayScore: 1 }, { homeScore: 1, awayScore: 1 }, rules),
    ).toBe(rules.exact);
    // 2-2 vs 1-1: same result (draw), same diff (0) — fair to give both bonuses.
    expect(
      scoreMatchPrediction({ homeScore: 2, awayScore: 2 }, { homeScore: 1, awayScore: 1 }, rules),
    ).toBe(rules.result + rules.goalDiff);
  });
});

describe("scoreBracketPick", () => {
  it("awards points when team reached the stage", () => {
    const reached = new Set(["arg", "fra"]);
    expect(scoreBracketPick("arg", reached, rules)).toBe(rules.bracketTeamAdvances);
  });

  it("awards zero when team did not", () => {
    const reached = new Set(["fra"]);
    expect(scoreBracketPick("arg", reached, rules)).toBe(0);
  });
});

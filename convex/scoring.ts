export const DEFAULT_SCORING_RULES = {
  exact: 5, // exact score
  result: 3, // correct winner / draw
  goalDiff: 1, // correct goal difference (already covers result, additive bonus)
  bracketTeamAdvances: 2, // each correctly-picked team that reaches that stage
} as const;

export type ScoringRules = Record<string, number>;

export interface MatchOutcome {
  homeScore: number;
  awayScore: number;
}

export interface Prediction extends MatchOutcome {}

/**
 * Pure scorer for a single match prediction.
 * Returns total points earned. Exact subsumes all other awards.
 */
export function scoreMatchPrediction(
  prediction: Prediction,
  actual: MatchOutcome,
  rules: ScoringRules,
): number {
  const exact = prediction.homeScore === actual.homeScore && prediction.awayScore === actual.awayScore;
  if (exact) return rules.exact ?? DEFAULT_SCORING_RULES.exact;

  const predResult = sign(prediction.homeScore - prediction.awayScore);
  const actualResult = sign(actual.homeScore - actual.awayScore);
  const correctResult = predResult === actualResult;

  const predDiff = prediction.homeScore - prediction.awayScore;
  const actualDiff = actual.homeScore - actual.awayScore;
  const correctDiff = predDiff === actualDiff;

  let points = 0;
  if (correctResult) points += rules.result ?? DEFAULT_SCORING_RULES.result;
  if (correctDiff && correctResult) points += rules.goalDiff ?? DEFAULT_SCORING_RULES.goalDiff;
  return points;
}

function sign(n: number): -1 | 0 | 1 {
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

/**
 * Scores bracket picks: for each pick, award `bracketTeamAdvances` points if
 * that team actually reached or passed the picked stage.
 */
export function scoreBracketPick(
  pickedTeamId: string,
  teamsReachedStage: Set<string>,
  rules: ScoringRules,
): number {
  return teamsReachedStage.has(pickedTeamId)
    ? (rules.bracketTeamAdvances ?? DEFAULT_SCORING_RULES.bracketTeamAdvances)
    : 0;
}

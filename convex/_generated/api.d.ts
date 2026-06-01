/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bracket from "../bracket.js";
import type * as crons from "../crons.js";
import type * as footballData from "../footballData.js";
import type * as footballDataInternal from "../footballDataInternal.js";
import type * as http from "../http.js";
import type * as invites from "../invites.js";
import type * as leaderboard from "../leaderboard.js";
import type * as matches from "../matches.js";
import type * as predictions from "../predictions.js";
import type * as profiles from "../profiles.js";
import type * as profilesInternal from "../profilesInternal.js";
import type * as scoring from "../scoring.js";
import type * as seed from "../seed.js";
import type * as teams from "../teams.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bracket: typeof bracket;
  crons: typeof crons;
  footballData: typeof footballData;
  footballDataInternal: typeof footballDataInternal;
  http: typeof http;
  invites: typeof invites;
  leaderboard: typeof leaderboard;
  matches: typeof matches;
  predictions: typeof predictions;
  profiles: typeof profiles;
  profilesInternal: typeof profilesInternal;
  scoring: typeof scoring;
  seed: typeof seed;
  teams: typeof teams;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

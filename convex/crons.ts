import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sync football-data.org every 15 min",
  { minutes: 15 },
  internal.footballData.sync,
  {},
);

export default crons;

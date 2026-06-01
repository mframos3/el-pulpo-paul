import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    return teams.sort((a, b) => a.name.localeCompare(b.name));
  },
});

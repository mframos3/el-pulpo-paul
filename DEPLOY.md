# Deploy: Vercel + Convex (free tier)

~50 users fits comfortably on Hobby (Vercel) + Convex free + Resend free + football-data.org free.

## Prerequisites

- [Convex](https://convex.dev) account
- [Vercel](https://vercel.com) account linked to GitHub
- [Resend](https://resend.com) API key (magic links)
- [football-data.org](https://www.football-data.org/) API key
- **Node.js >= 20.9** locally (Next.js 16 requirement)

## 1. Convex production backend

```bash
bun install
bunx convex login
bunx convex deploy
```

Note the production deployment URL (e.g. `https://happy-animal-123.convex.cloud`).

Set production env vars in Convex (Dashboard → Production deployment → Environment Variables, or CLI):

```bash
bunx convex env set --prod AUTH_RESEND_KEY   re_xxxxxxxx
bunx convex env set --prod AUTH_EMAIL_FROM   "Paul <paul@yourdomain.com>"
bunx convex env set --prod FOOTBALL_DATA_KEY xxxxxxxx
# After Vercel gives you a URL (step 2):
bunx convex env set --prod SITE_URL          https://el-pulpo-paul.vercel.app
```

`SITE_URL` is the public Next.js URL — used by Convex Auth to redirect users after magic-link sign-in.  
`CONVEX_SITE_URL` is set automatically by Convex (JWT issuer in `convex/auth.config.ts`).

## 2. Vercel frontend (GitHub — recommended)

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import `el-pulpo-paul`.
3. Framework: **Next.js** (auto). Root directory: `.` (default).
4. Build settings are read from [`vercel.json`](vercel.json):
   - Install: `bun install --frozen-lockfile`
   - Build: `bunx convex deploy --cmd 'bun run build'`
5. **Environment variable** (Production only):

   | Name | Value |
   | --- | --- |
   | `CONVEX_DEPLOY_KEY` | Production deploy key from Convex Dashboard → your prod deployment → Settings → Deploy Key → Generate |

   Do **not** manually set `NEXT_PUBLIC_CONVEX_URL` on Vercel — `convex deploy` injects it during build.

6. Deploy. Copy the assigned URL (e.g. `https://el-pulpo-paul.vercel.app`).

7. Update Convex:

   ```bash
   bunx convex env set --prod SITE_URL https://el-pulpo-paul.vercel.app
   ```

Redeploys: every `git push` to `main` rebuilds Convex functions and the Next.js site.

### CLI alternative

```bash
bunx vercel link
bunx vercel env add CONVEX_DEPLOY_KEY production
bunx vercel --prod
```

## 3. First-run bootstrap (one-time, in browser)

1. Open your live URL → `/login` → email → magic link.
2. `/settings` → **Reclamar admin** → **Sembrar reglas**.
3. `/admin/matches` → **Sync football-data**.
4. `/admin/players` → generate invite codes → share `/invite/<code>`.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Magic link redirects to wrong host | Set `SITE_URL` in Convex **prod** to your exact Vercel URL (https, no trailing slash). |
| Build fails on Vercel | Ensure `CONVEX_DEPLOY_KEY` is Production key only; Node 20+ (see `package.json` engines). |
| `NEXT_PUBLIC_CONVEX_URL` missing locally | Run `bunx convex dev` once to create `.env.local`. |
| Resend errors | Verify domain in Resend; `AUTH_EMAIL_FROM` must use a verified sender. |

## Free tier headroom (~50 users)

| Service | Limit |
| --- | --- |
| Vercel Hobby | 100 GB bandwidth / month |
| Convex free | 1M function calls / month |
| Resend free | 3,000 emails / month |
| football-data.org | 10 req/min (cron every 15 min is fine) |

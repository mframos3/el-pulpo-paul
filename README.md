# 🐙 El Pulpo Paul — Polla Mundialera 2026

> *"Paul ha hablado."*

Una polla privada para predecir partidos del Mundial 2026, tematizada con **Paul**, el pulpo oráculo. Hecha para jugar con los coworkers — sin dinero real, solo gloria, vergüenza y un buy-in que se salda offline.

## ¿Qué hace?

- **Predicción de marcadores** en fase de grupos (puntos por marcador exacto, resultado correcto, y diferencia de goles).
- **Bracket de eliminatorias** — escoge quién avanza ronda por ronda.
- **Leaderboard reactiva** — se actualiza al instante cuando el admin carga un resultado (cortesía de Convex).
- **Invite-only** vía magic link al correo — privado por defecto.
- **Sync automático de fixtures y resultados** desde [football-data.org](https://www.football-data.org/), con override manual del admin.

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Estilos | Tailwind CSS v4 + Motion |
| Backend | **Convex** (DB + Auth + Crons + Reactive queries) |
| Auth | Convex Auth · magic link vía **Resend** |
| Match data | football-data.org v4 (free tier) |
| Runtime / Tooling | **Bun**, Oxlint, Prettier, Vitest |
| Hosting | Vercel (frontend) + Convex (backend) |

Todo TypeScript, todo gratis (free tier en todos los servicios).

## Setup rápido

```bash
bun install
```

### 1. Provisiona el backend Convex (interactivo, una sola vez)

```bash
bunx convex dev
```

Esto abrirá el navegador para login en convex.dev, creará el proyecto, generará `convex/_generated/` y escribirá `NEXT_PUBLIC_CONVEX_URL` en `.env.local`. Déjalo corriendo en una terminal — recompila el backend cuando cambies algo en `convex/`.

### 2. Configura los secretos del backend

```bash
bunx convex env set AUTH_RESEND_KEY re_xxxxxxxxxxxx           # de resend.com
bunx convex env set AUTH_EMAIL_FROM "Paul <paul@tudominio.com>"
bunx convex env set FOOTBALL_DATA_KEY xxxxxxxxxxxxxxxxxxxxxx   # de football-data.org
bunx convex env set SITE_URL http://localhost:3000
```

### 3. Levanta el frontend

En otra terminal:

```bash
bun dev
```

Visita [http://localhost:3000](http://localhost:3000).

## Primer arranque (bootstrap)

1. Abre `/login`, ingresa tu correo → recibirás el magic link.
2. Tras volver a la app, ve a `/settings` y completa tu perfil (nombre + avatar 🐙).
3. **Si eres el primero**, en `/settings` haz clic en **Reclamar admin** y luego **Sembrar reglas** (esto inserta los puntajes default: exacto 5, resultado 3, diferencia 1, bracket 2).
4. En `/admin/matches` haz clic en **🔄 Sync football-data** para traer los 104 partidos del Mundial.
5. En `/admin/players` genera invitaciones (`/invite/<code>`) y compártelas por Slack/WhatsApp.

## Comandos útiles

```bash
bun dev                  # Next dev server (Turbopack)
bunx convex dev          # Convex backend watcher
bun test                 # Vitest — tests de scoring
bun lint                 # Oxlint
bun format               # Prettier
bun run build            # Build de producción
```

## Despliegue

```bash
bunx convex deploy       # Backend → producción
vercel --prod            # Frontend
```

En el dashboard de Vercel define `NEXT_PUBLIC_CONVEX_URL` con la URL del deployment de prod de Convex. Recuerda también poner los secretos en producción (`bunx convex env set --prod ...`).

## Estructura

```
app/
  page.tsx               # Landing — el hero de Paul
  login/                 # Magic-link login
  invite/[code]/         # Consume invitación → perfil
  (app)/                 # Layout autenticado (AppShell)
    dashboard/           # Próximos partidos + tu rank
    matches/             # Fixture completo agrupado por fase
    matches/[id]/        # Detalle + form de predicción
    bracket/             # Eliminatorias
    leaderboard/         # Tabla reactiva
    settings/
    admin/matches/       # Entrada manual + sync button
    admin/players/       # Invitaciones + estatus de buy-in
convex/
  schema.ts              # 7 tablas + índices
  auth.ts                # Convex Auth + Resend
  matches.ts             # CRUD partidos
  predictions.ts         # Picks con kickoff-lock server-side
  bracket.ts             # Picks de bracket
  leaderboard.ts         # Aggregación reactiva
  scoring.ts             # Funciones puras (testeadas)
  footballData.ts        # Action: sync football-data.org
  crons.ts               # Cada 15 min
  invites.ts, profiles.ts, teams.ts, seed.ts
components/
  paul-mascot.tsx        # SVG del pulpo en 3 poses
  app-shell.tsx          # Layout autenticado con nav
lib/
  theme/octopus.ts       # Paleta + copy en español
```

## Reglas de puntaje (editables en Convex)

| Acierto | Puntos |
| --- | --- |
| Marcador exacto | 5 |
| Resultado correcto (ganador/empate) | 3 |
| + Diferencia de goles correcta | +1 |
| Equipo que avanza en bracket | 2 por equipo |

## Licencia

MIT — ver [`LICENSE`](./LICENSE).

---

🐙 *Paul vela por tus tentáculos.*

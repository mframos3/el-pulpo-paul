export const paulCopy = {
  hero: {
    eyebrow: "Polla Mundialera 2026",
    title: "El Pulpo siempre sabe más.",
    subtitle:
      "Predice resultados, desafía a tus amigos y demuestra quién realmente entiende de fútbol.",
    ctaPrimary: "Entrar a la polla",
    ctaSecondary: "¿Cómo funciona?",
  },
  prophet: {
    thinking: "El Pulpo está pensando…",
    spoke: "El Pulpo ya eligió.",
    silent: "Aún sin predicción.",
    locked: "Las predicciones están cerradas.",
    saved: "El Pulpo aprueba esta predicción.",
    confident: "Confía en los tentáculos.",
  },
  empty: {
    noMatches: "Aún no hay partidos cargados.",
    noPicks: "Sin predicciones todavía.",
    noLeaderboard: "Sin resultados — la tabla aún duerme.",
  },
  errors: {
    notAuthed: "El Pulpo no te reconoce. Inicia sesión primero.",
    notAdmin: "Solo el guardián de la polla puede hacer esto.",
    locked: "Paul ya selló este partido — sin más predicciones.",
  },
  status: {
    live: "EN VIVO",
    final: "FINAL",
    scheduled: "PROGRAMADO",
  },
} as const;

export const stageLabels = {
  group: "Fase de grupos",
  r16: "Octavos",
  qf: "Cuartos",
  sf: "Semifinales",
  f: "Final",
  "3p": "Tercer puesto",
} as const;

export const stageShort = {
  group: "GRUPOS",
  r16: "1/8",
  qf: "1/4",
  sf: "1/2",
  f: "FINAL",
  "3p": "3°",
} as const;

export type Stage = keyof typeof stageLabels;

import Link from "next/link";
import { paulCopy } from "@/lib/theme/octopus";
import { PaulMascot } from "@/components/paul-mascot";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* HERO ------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 pitch-grid opacity-30" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--purple-9)_60%,transparent),transparent_70%)]" />

        <header className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <PaulMascot className="w-9 h-9" />
            <span className="font-logo text-xl text-text-strong tracking-tight">
              Pulpo Paul
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-muted hover:text-text-strong px-4 py-2 rounded-full transition"
            >
              Iniciar sesión
            </Link>
          </nav>
        </header>

        <div className="mx-auto max-w-7xl px-6 pt-12 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-border/40 bg-brand/15 backdrop-blur px-3 py-1 text-xs font-medium tracking-widest uppercase text-brand-text">
              <span className="size-1.5 rounded-full bg-brand animate-pulse" />
              {paulCopy.hero.eyebrow}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text-strong leading-[1.05]">
              {paulCopy.hero.title}
            </h1>
            <p className="max-w-xl text-lg text-muted leading-relaxed">
              {paulCopy.hero.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover text-on-brand font-semibold px-6 py-3.5 transition shadow-lg shadow-brand/30"
              >
                {paulCopy.hero.ctaPrimary}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-border-default/40 bg-surface-1/40 hover:bg-surface-2/60 backdrop-blur text-text-strong font-medium px-6 py-3.5 transition"
              >
                {paulCopy.hero.ctaSecondary}
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-subtle">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-warning" />
                Invite-only
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand" />
                Resultados en vivo
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-disabled" />
                Sin pagos reales
              </div>
            </div>
          </div>

          {/* Hero stat card with mascot */}
          <div className="relative">
            <div className="card-elevated relative p-8 sm:p-10 brand-glow">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-subtle mb-1">
                    Oráculo
                  </div>
                  <div className="font-logo text-2xl text-text-strong">El Pulpo Paul</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-subtle mb-1">
                    Precisión
                  </div>
                  <div className="font-display text-2xl text-warning-text tabular">87.5%</div>
                </div>
              </div>
              <div className="flex justify-center">
                <PaulMascot pose="focused" className="w-56 h-56" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <Stat label="Partidos" value="104" />
                <Stat label="Equipos" value="48" />
                <Stat label="Sedes" value="16" />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 hidden sm:block">
              <div className="font-mono text-[10px] tracking-widest uppercase text-warning-text/80 rotate-[8deg] bg-brand/20 border border-warning/30 backdrop-blur rounded-full px-3 py-1">
                ✦ Mundial 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS ----------------------------------------------- */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-brand-text mb-2">
              Cómo se juega
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-strong max-w-2xl">
              Tres formas de demostrar que sabes más que tus amigos.
            </h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <FeatureCard
            num="01"
            title="Marcadores exactos"
            body="Predice el resultado de cada partido de la fase de grupos. Acertar el marcador exacto vale 5 puntos."
          />
          <FeatureCard
            num="02"
            title="Bracket de eliminatorias"
            body="Llena tu cuadro desde octavos hasta la final. Cada equipo que avanza es un acierto que paga."
          />
          <FeatureCard
            num="03"
            title="Tabla en vivo"
            body="La leaderboard se actualiza al instante cuando el admin carga un resultado. Sin esperas, sin refrescar."
          />
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 border-t border-border-subtle/30 text-xs text-subtle flex flex-wrap items-center justify-between gap-2">
        <span>🐙 Confía en los tentáculos.</span>
        <span>El Pulpo Paul · Polla Mundialera 2026</span>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle/40 bg-bg/40 py-3">
      <div className="font-display text-xl text-text-strong tabular">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-subtle mt-0.5">{label}</div>
    </div>
  );
}

function FeatureCard({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="card p-6 sm:p-7 group hover:border-brand-border/40 transition">
      <div className="flex items-baseline justify-between mb-4">
        <span className="font-display text-3xl text-brand-text tabular">{num}</span>
        <span className="text-warning-text opacity-0 group-hover:opacity-100 transition">→</span>
      </div>
      <h3 className="font-display text-xl font-semibold text-text-strong mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}

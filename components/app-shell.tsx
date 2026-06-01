"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PaulMascot } from "./paul-mascot";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Hoy", icon: "●" },
  { href: "/matches", label: "Partidos", icon: "◆" },
  { href: "/bracket", label: "Bracket", icon: "▲" },
  { href: "/leaderboard", label: "Tabla", icon: "★" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuthActions();
  const me = useQuery(api.profiles.me);
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col pb-20 sm:pb-0">
      {/* TOP BAR -------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-border-subtle/40 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <PaulMascot className="w-8 h-8" />
            <span className="font-logo text-lg text-text-strong hidden sm:inline tracking-tight">
              Pulpo Paul
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex flex-1 items-center gap-1 ml-4">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "px-3.5 py-1.5 text-sm font-medium rounded-full transition relative",
                    active
                      ? "text-text-strong"
                      : "text-subtle hover:text-text-strong",
                  )}
                >
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-3 h-[2px] bg-brand rounded-full" />
                  )}
                </Link>
              );
            })}
            {me?.isAdmin && (
              <Link
                href="/admin/matches"
                className={cn(
                  "px-3.5 py-1.5 text-sm font-medium rounded-full transition ml-2 border",
                  pathname.startsWith("/admin")
                    ? "border-warning/60 text-warning-text bg-warning/10"
                    : "border-border-subtle text-subtle hover:text-warning-text hover:border-warning/40",
                )}
              >
                ✦ Admin
              </Link>
            )}
          </nav>

          <div className="flex-1 sm:flex-none" />

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            {me && (
              <Link
                href="/settings"
                className="flex items-center gap-2.5 group"
                title="Tu perfil"
              >
                <div className="size-9 rounded-full bg-brand/20 border border-brand-border/40 grid place-items-center text-base group-hover:border-brand-border transition">
                  {me.avatarKey}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-sm font-medium text-text-strong">{me.displayName}</div>
                  <div className="text-[10px] uppercase tracking-widest text-subtle">
                    {me.buyInPaid ? "Pagó" : "Pendiente"}
                  </div>
                </div>
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-xs text-subtle hover:text-text-strong px-2 py-1 rounded-md"
              title="Salir"
            >
              ⎋
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT ------------------------------------------------- */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV --------------------------------------- */}
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-30 rounded-2xl border border-border-subtle/60 bg-surface-1/80 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="grid grid-cols-4 px-1 py-1.5">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition",
                  active ? "text-text-strong bg-brand/20" : "text-subtle",
                )}
              >
                <span className={cn("text-base", active && "text-brand-text")}>{n.icon}</span>
                <span className="text-[10px] font-medium">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="hidden sm:block text-center text-xs text-disabled py-6">
        Confía en los tentáculos.
      </footer>
    </div>
  );
}

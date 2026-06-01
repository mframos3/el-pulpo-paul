import type { Metadata } from "next";
import { Inter, Sora, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/lib/convex-client-provider";
import { ThemeProvider } from "@/lib/theme-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const logo = Bricolage_Grotesque({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["800"],
});

export const metadata: Metadata = {
  title: "El Pulpo Paul · Polla Mundialera 2026",
  description:
    "Predice resultados, desafía a tus amigos y demuestra quién realmente entiende de fútbol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider storage="inMemory">
      <html
        lang="es"
        className={`${inter.variable} ${sora.variable} ${logo.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catálogo de Filmes",
  description: "Filmes em streaming no Brasil",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-lg font-bold">
              Catálogo de Filmes
            </Link>
            <SearchBox />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-neutral-200 px-4 py-6 text-center text-xs text-neutral-600">
          <p>
            This product uses the{" "}
            <a href="https://www.themoviedb.org" className="underline" target="_blank" rel="noreferrer">
              TMDB
            </a>{" "}
            API but is not endorsed or certified by TMDB.
          </p>
          <p>
            Dados de streaming fornecidos por{" "}
            <a href="https://www.justwatch.com" className="underline" target="_blank" rel="noreferrer">
              JustWatch
            </a>
            .
          </p>
        </footer>
      </body>
    </html>
  );
}

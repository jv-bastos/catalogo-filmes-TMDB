import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SearchBox } from "@/components/SearchBox";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sessão | Filmes em streaming no Brasil",
  description: "Descubra em qual streaming assistir cada filme no Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <header className="sticky top-0 z-30 border-b border-linha/60 bg-noite/85 backdrop-blur-md">
          <div className="flex items-center gap-4 px-4 py-3 sm:gap-8 sm:px-6 sm:py-4 lg:px-10">
            <Link href="/" aria-label="Sessão, voltar ao catálogo" className="shrink-0 rounded-xl">
              <Logo />
            </Link>
            <div className="ml-auto min-w-0 flex-1 sm:max-w-md">
              <SearchBox />
            </div>
          </div>
        </header>
        <div className="flex min-h-screen flex-col">
          <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
          <footer className="border-t border-linha/60 px-4 py-6 text-xs text-suave sm:px-6 lg:px-10">
            <p>
              This product uses the{" "}
              <a href="https://www.themoviedb.org" className="underline hover:text-texto" target="_blank" rel="noreferrer">
                TMDB
              </a>{" "}
              API but is not endorsed or certified by TMDB.
            </p>
            <p className="mt-1">
              Dados de streaming fornecidos por{" "}
              <a href="https://www.justwatch.com" className="underline hover:text-texto" target="_blank" rel="noreferrer">
                JustWatch
              </a>
              .
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}

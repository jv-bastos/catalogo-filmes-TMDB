'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { searchHref } from '@/lib/urls';
import { SearchIcon } from './icons';

export function SearchBox({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    router.push(searchHref(term));
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-full border border-linha bg-palco/80 pl-4 transition focus-within:border-rosa focus-within:bg-palco focus-within:shadow-[0_0_0_4px_rgb(255_45_135/0.18)]"
    >
      <SearchIcon className="hidden size-4 shrink-0 text-suave sm:block" />
      <input
        type="search"
        aria-label="Buscar filme"
        placeholder="Buscar filme"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-texto placeholder:text-suave focus:outline-none sm:py-3 sm:text-base"
      />
      <button
        type="submit"
        className="m-1 grid size-8 shrink-0 place-items-center rounded-full bg-sessao text-sm font-semibold text-white transition hover:brightness-110 sm:size-auto sm:px-4 sm:py-2"
      >
        <SearchIcon className="size-4 sm:hidden" />
        <span className="sr-only sm:not-sr-only">Buscar</span>
      </button>
    </form>
  );
}

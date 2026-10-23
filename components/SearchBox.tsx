'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { searchHref } from '@/lib/urls';

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
    <form role="search" onSubmit={onSubmit} className="flex gap-2">
      <input
        type="search"
        aria-label="Buscar filme"
        placeholder="Buscar filme"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">
        Buscar
      </button>
    </form>
  );
}

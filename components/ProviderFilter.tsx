'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { catalogHref } from '@/lib/urls';
import type { Provider } from '@/lib/tmdb/types';

export function ProviderFilter({ providers, selected }: { providers: Provider[]; selected: number[] }) {
  const router = useRouter();
  // Seleção local: reflete o clique na hora e serve de base para o próximo,
  // mesmo enquanto a navegação ainda não devolveu o novo `selected`.
  const [current, setCurrent] = useState(selected);
  const [lastProp, setLastProp] = useState(selected);
  if (selected !== lastProp) {
    setLastProp(selected);
    setCurrent(selected);
  }
  const [isPending, startTransition] = useTransition();

  function toggle(id: number) {
    const next = (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]).sort(
      (a, b) => a - b,
    );
    startTransition(() => {
      setCurrent(next);
      router.push(catalogHref(next));
    });
  }

  return (
    <fieldset className={`flex flex-wrap gap-2 ${isPending ? 'opacity-70' : ''}`}>
      <legend className="mb-2 text-sm font-semibold text-neutral-700">Streamings</legend>
      {providers.map((p) => (
        <label
          key={p.id}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-900 has-[:checked]:text-white"
        >
          <input
            type="checkbox"
            checked={current.includes(p.id)}
            onChange={() => toggle(p.id)}
            className="size-4"
          />
          {p.name}
        </label>
      ))}
    </fieldset>
  );
}

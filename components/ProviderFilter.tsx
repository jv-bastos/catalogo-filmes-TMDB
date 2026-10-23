'use client';

import { useRouter } from 'next/navigation';
import { catalogHref } from '@/lib/urls';
import type { Provider } from '@/lib/tmdb/types';

export function ProviderFilter({ providers, selected }: { providers: Provider[]; selected: number[] }) {
  const router = useRouter();

  function toggle(id: number) {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    router.push(catalogHref([...next].sort((a, b) => a - b)));
  }

  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="mb-2 text-sm font-semibold text-neutral-700">Streamings</legend>
      {providers.map((p) => (
        <label
          key={p.id}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-900 has-[:checked]:text-white"
        >
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
            className="size-4"
          />
          {p.name}
        </label>
      ))}
    </fieldset>
  );
}

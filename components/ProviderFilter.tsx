'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoUrl } from '@/lib/tmdb/images';
import { catalogHref } from '@/lib/urls';
import type { Provider } from '@/lib/tmdb/types';
import { CheckIcon, GridIcon } from './icons';

function ChipCheck() {
  return (
    <span
      aria-hidden="true"
      className="chip-check size-4 place-items-center rounded-full bg-white text-[var(--palco-alto)]"
    >
      <CheckIcon className="size-3" />
    </span>
  );
}

export function ProviderFilter({ providers, selected }: { providers: Provider[]; selected: number[] }) {
  const router = useRouter();
  // Seleção local: reflete o clique na hora e serve de base para o próximo.
  const [current, setCurrent] = useState(selected);
  const [lastProp, setLastProp] = useState(selected);
  if (selected !== lastProp) {
    setLastProp(selected);
    setCurrent(selected);
  }
  const [isPending, startTransition] = useTransition();
  // Desabilitar o fieldset tira o foco do checkbox; devolve ao último clicado.
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const lastToggled = useRef<number | null>(null);
  useEffect(() => {
    if (!isPending && lastToggled.current !== null) {
      inputs.current.get(lastToggled.current)?.focus();
      lastToggled.current = null;
    }
  }, [isPending]);

  function toggle(id: number) {
    const next = (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]).sort(
      (a, b) => a - b,
    );
    // Estado local fora da transição: o clique aparece marcado na hora.
    setCurrent(next);
    lastToggled.current = id;
    startTransition(() => {
      router.push(catalogHref(next));
    });
  }

  return (
    <>
      <fieldset disabled={isPending} aria-busy={isPending} className="min-w-0">
        <legend className="mb-3 text-sm font-semibold text-suave">Streamings</legend>
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {providers.map((p) => {
            const logo = logoUrl(p.logoPath);
            return (
              <label key={p.id} className="provider-chip has-[:disabled]:cursor-wait">
                <input
                  ref={(el) => {
                    if (el) inputs.current.set(p.id, el);
                    else inputs.current.delete(p.id);
                  }}
                  type="checkbox"
                  checked={current.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-wait"
                />
                {logo ? (
                  <Image src={logo} alt="" width={32} height={32} className="size-8 rounded-lg" />
                ) : (
                  <GridIcon className="size-8 p-1.5" />
                )}
                {p.name}
                <ChipCheck />
              </label>
            );
          })}
        </div>
      </fieldset>
      {isPending && (
        <div
          role="status"
          className="fixed inset-0 z-50 flex cursor-wait items-center justify-center bg-noite/75 text-lg font-semibold text-texto backdrop-blur-sm"
        >
          Carregando filmes…
        </div>
      )}
    </>
  );
}

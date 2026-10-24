import Image from 'next/image';
import { logoUrl } from '@/lib/tmdb/images';
import type { Provider, WatchOptions } from '@/lib/tmdb/types';

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function Group({ title, providers }: { title: string; providers: Provider[] }) {
  if (providers.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-suave">{title}</h3>
      <ul className="flex flex-wrap gap-4">
        {providers.map((p) => {
          const logo = logoUrl(p.logoPath);
          return (
            <li key={p.id} className="flex w-20 flex-col items-center gap-2">
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 rounded-xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <span
                  aria-hidden
                  className="title-display grid size-16 place-items-center rounded-xl bg-palco-alto text-xl text-suave ring-1 ring-white/10"
                >
                  {initials(p.name)}
                </span>
              )}
              <span className="text-center text-sm leading-snug">{p.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function WatchProviders({ watch }: { watch: WatchOptions | null }) {
  const empty = !watch || (watch.flatrate.length === 0 && watch.rent.length === 0 && watch.buy.length === 0);
  return (
    <section data-testid="secao-onde-assistir" className="flex flex-col gap-4">
      <h2 className="title-display text-3xl">Onde assistir</h2>
      {empty ? (
        <p className="text-suave">Não disponível em streaming no Brasil</p>
      ) : (
        <>
          <Group title="Assinatura" providers={watch.flatrate} />
          <Group title="Aluguel" providers={watch.rent} />
          <Group title="Compra" providers={watch.buy} />
          {watch.link && (
            <a
              href={watch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start text-sm font-semibold text-manga underline-offset-4 hover:underline"
            >
              Ver todas as opções no TMDB
            </a>
          )}
        </>
      )}
    </section>
  );
}

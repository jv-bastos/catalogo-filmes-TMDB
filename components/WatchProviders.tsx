import Image from 'next/image';
import { logoUrl } from '@/lib/tmdb/images';
import type { Provider, WatchOptions } from '@/lib/tmdb/types';

function Group({ title, providers }: { title: string; providers: Provider[] }) {
  if (providers.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-neutral-600">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {providers.map((p) => {
          const logo = logoUrl(p.logoPath);
          return (
            <li key={p.id}>
              {logo ? (
                <Image src={logo} alt={p.name} width={46} height={46} className="rounded-lg" />
              ) : (
                <span className="text-sm">{p.name}</span>
              )}
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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Onde assistir</h2>
      {empty ? (
        <p className="text-neutral-600">Não disponível em streaming no Brasil</p>
      ) : (
        <>
          <Group title="Assinatura" providers={watch.flatrate} />
          <Group title="Aluguel" providers={watch.rent} />
          <Group title="Compra" providers={watch.buy} />
          {watch.link && (
            <a href={watch.link} target="_blank" rel="noopener noreferrer" className="inline-block text-sm underline">
              Ver todas as opções no TMDB
            </a>
          )}
        </>
      )}
    </section>
  );
}

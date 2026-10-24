import Image from 'next/image';
import { logoUrl } from '@/lib/tmdb/images';
import type { Provider, WatchOptions } from '@/lib/tmdb/types';

function Group({ title, providers }: { title: string; providers: Provider[] }) {
  if (providers.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-sm font-semibold text-suave">{title}</h3>
      <ul className="flex flex-wrap gap-2.5">
        {providers.map((p) => {
          const logo = logoUrl(p.logoPath);
          return (
            <li key={p.id} title={p.name}>
              {logo ? (
                <Image src={logo} alt={p.name} width={52} height={52} className="size-13 rounded-xl ring-1 ring-white/10" />
              ) : (
                <span className="inline-block rounded-xl bg-palco-alto px-3 py-2 text-sm">{p.name}</span>
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
    <section className="rounded-2xl border-[1.5px] border-transparent p-5 [background:linear-gradient(var(--palco),var(--palco))_padding-box,var(--gradiente-sessao)_border-box] sm:p-6">
      <h2 className="title-display mb-4 text-3xl">Onde assistir</h2>
      {empty ? (
        <p className="text-suave">Não disponível em streaming no Brasil</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            <Group title="Assinatura" providers={watch.flatrate} />
            <Group title="Aluguel" providers={watch.rent} />
            <Group title="Compra" providers={watch.buy} />
          </div>
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
        </div>
      )}
    </section>
  );
}

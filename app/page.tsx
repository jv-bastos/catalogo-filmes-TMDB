import Link from 'next/link';
import { MovieGrid } from '@/components/MovieGrid';
import { Pagination } from '@/components/Pagination';
import { ProviderFilter } from '@/components/ProviderFilter';
import { parsePage, parseProviders } from '@/lib/params';
import { discoverMovies, getProviders } from '@/lib/tmdb/movies';
import { catalogHref } from '@/lib/urls';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ providers?: string | string[]; page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const providers = await getProviders();
  const allowed = providers.map((p) => p.id);
  const selected = parseProviders(sp.providers, allowed);
  const page = parsePage(sp.page);
  const result = await discoverMovies({ providers: selected.length ? selected : allowed, page });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Filmes em streaming no Brasil</h1>
      <ProviderFilter providers={providers} selected={selected} />
      {result.movies.length > 0 ? (
        <MovieGrid movies={result.movies} />
      ) : (
        <div className="py-12 text-center">
          <p>Nenhum filme encontrado nesses streamings</p>
          <Link href="/" className="mt-2 inline-block underline">
            Limpar filtros
          </Link>
        </div>
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => catalogHref(selected, p)} />
    </div>
  );
}

import Link from 'next/link';

type Props = { page: number; totalPages: number; hrefFor: (page: number) => string };

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1 && page === 1) return null;
  const linkClass = 'rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100';
  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-4">
      {page > 1 && (
        <Link href={hrefFor(Math.min(page - 1, totalPages))} className={linkClass}>
          Anterior
        </Link>
      )}
      <span className="text-sm">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          Próxima
        </Link>
      )}
    </nav>
  );
}

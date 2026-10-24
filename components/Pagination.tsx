import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

type Props = { page: number; totalPages: number; hrefFor: (page: number) => string };

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1 && page === 1) return null;
  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-4">
      {page > 1 && (
        <Link href={hrefFor(Math.min(page - 1, totalPages))} className="btn-ghost">
          <ChevronLeftIcon className="size-4" />
          Anterior
        </Link>
      )}
      <span className="text-sm text-suave tabular-nums">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className="btn-ghost">
          Próxima
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </nav>
  );
}

import { MOVIE_GRID_CLASSES } from '@/components/MovieGrid';

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando" className={MOVIE_GRID_CLASSES}>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-palco" />
      ))}
    </div>
  );
}

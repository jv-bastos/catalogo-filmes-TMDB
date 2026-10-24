'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState } from 'react';
import type { MovieSummary } from '@/lib/tmdb/types';
import { FeaturedMovie } from './FeaturedMovie';

export function FeaturedCarousel({ movies }: { movies: MovieSummary[] }) {
  const multiple = movies.length > 1;
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 7000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
    }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: multiple, align: 'start' }, multiple ? [autoplay] : []);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect).off('reInit', onSelect);
    };
  }, [emblaApi, multiple]);

  if (movies.length === 0) return null;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-10 lg:-mt-8"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${movies.length}`}
              className="min-w-0 flex-[0_0_100%]"
            >
              <FeaturedMovie movie={movie} priority={i === 0} />
            </div>
          ))}
        </div>
      </div>
      {multiple && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-2 lg:bottom-6">
          {movies.map((movie, i) => (
            <span
              key={movie.id}
              data-testid="indicador-destaque"
              data-active={i === selected ? 'true' : 'false'}
              className={`h-2 rounded-full transition-all ${i === selected ? 'bg-sessao w-8' : 'w-2 bg-texto/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

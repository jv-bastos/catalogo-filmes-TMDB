'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Trailer as TrailerData } from '@/lib/tmdb/types';
import { PlayIcon } from './icons';

const FRAME = 'aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10';

export function Trailer({ trailer, title }: { trailer: TrailerData; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
        title={`Trailer de ${title}`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        className={FRAME}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Assistir ao trailer de ${title}`}
      onClick={() => setPlaying(true)}
      className={`${FRAME} group relative block cursor-pointer bg-palco`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${trailer.key}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-noite/30" aria-hidden />
      <span
        aria-hidden
        className="bg-sessao absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-[0_12px_32px_-12px_rgb(255_45_135/0.7)] transition-transform group-hover:scale-110"
      >
        <PlayIcon className="size-7 translate-x-0.5" />
      </span>
    </button>
  );
}

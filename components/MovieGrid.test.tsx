import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MovieSummary } from '@/lib/tmdb/types';
import { MovieGrid } from './MovieGrid';

const movies: MovieSummary[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Filme ${i + 1}`,
  posterPath: `/p${i + 1}.jpg`,
  backdropPath: null,
  releaseYear: '2024',
  overview: null,
}));

describe('MovieGrid', () => {
  it('renderiza 20 filmes na lista "Filmes"', () => {
    render(<MovieGrid movies={movies} />);
    const list = screen.getByRole('list', { name: 'Filmes' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(20);
  });

  it('usa 2/4/5 colunas (divisores de 20), sem 3, 6 ou 7', () => {
    render(<MovieGrid movies={movies} />);
    const classes = screen.getByRole('list', { name: 'Filmes' }).className.split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining(['grid-cols-2', 'sm:grid-cols-4', 'xl:grid-cols-5']));
    expect(classes.filter((c) => /grid-cols-(3|6|7)$/.test(c))).toEqual([]);
  });
});

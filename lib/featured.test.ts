import { describe, expect, it } from 'vitest';
import type { MovieSummary } from '@/lib/tmdb/types';
import { FEATURED_COUNT, pickFeatured } from './featured';

const movie = (id: number, backdropPath: string | null): MovieSummary => ({
  id,
  title: `Filme ${id}`,
  posterPath: null,
  backdropPath,
  releaseYear: null,
  overview: null,
});

describe('pickFeatured', () => {
  it('pula filmes sem backdrop e mantém a ordem', () => {
    const result = pickFeatured([movie(1, null), movie(2, '/b'), movie(3, null), movie(4, '/d')]);
    expect(result.map((m) => m.id)).toEqual([2, 4]);
  });
  it('devolve no máximo 5', () => {
    const many = Array.from({ length: 10 }, (_, i) => movie(i + 1, '/b'));
    expect(FEATURED_COUNT).toBe(5);
    expect(pickFeatured(many).map((m) => m.id)).toEqual([1, 2, 3, 4, 5]);
  });
  it('sem nenhum backdrop devolve lista vazia', () => {
    expect(pickFeatured([movie(1, null), movie(2, null)])).toEqual([]);
  });
  it('com menos de 5 elegíveis devolve os que houver', () => {
    expect(pickFeatured([movie(1, '/a'), movie(2, null), movie(3, '/c')])).toHaveLength(2);
  });
});

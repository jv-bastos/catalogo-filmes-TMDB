import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import type { MovieSummary } from '@/lib/tmdb/types';
import { FeaturedCarousel } from './FeaturedCarousel';

// jsdom não implementa estas APIs; stubs mínimos só para este arquivo.
beforeAll(() => {
  class Stub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  stubGlobal('IntersectionObserver', Stub);
  stubGlobal('ResizeObserver', Stub);
  stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
});

function stubGlobal(name: string, value: unknown) {
  Object.defineProperty(window, name, { value, configurable: true, writable: true });
}

const makeMovies = (n: number): MovieSummary[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `Filme ${i + 1}`,
    posterPath: null,
    backdropPath: `/b${i + 1}.jpg`,
    releaseYear: '2024',
    overview: 'Sinopse',
  }));

describe('FeaturedCarousel', () => {
  it('renderiza 5 slides rotulados e 5 bolinhas', () => {
    render(<FeaturedCarousel movies={makeMovies(5)} />);
    expect(screen.getByRole('region', { name: 'Destaques' })).toBeInTheDocument();
    const slides = screen.getAllByRole('group');
    expect(slides.map((s) => s.getAttribute('aria-label'))).toEqual(['1 de 5', '2 de 5', '3 de 5', '4 de 5', '5 de 5']);
    for (let n = 1; n <= 5; n++) {
      expect(screen.getByRole('button', { name: `Ir para o destaque ${n}` })).toBeInTheDocument();
    }
  });

  it('marca a primeira bolinha como atual', () => {
    render(<FeaturedCarousel movies={makeMovies(5)} />);
    expect(screen.getByRole('button', { name: 'Ir para o destaque 1' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'Ir para o destaque 2' })).not.toHaveAttribute('aria-current', 'true');
  });

  it('com 1 filme não mostra bolinhas', () => {
    render(<FeaturedCarousel movies={makeMovies(1)} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'Filme 1' })).toBeInTheDocument();
  });

  it('com 0 filmes não renderiza nada', () => {
    const { container } = render(<FeaturedCarousel movies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

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
  it('renderiza 5 slides rotulados e 5 indicadores decorativos sem botões', () => {
    render(<FeaturedCarousel movies={makeMovies(5)} />);
    expect(screen.getByRole('region', { name: 'Destaques' })).toBeInTheDocument();
    const slides = screen.getAllByRole('group');
    expect(slides.map((s) => s.getAttribute('aria-label'))).toEqual(['1 de 5', '2 de 5', '3 de 5', '4 de 5', '5 de 5']);
    const dots = screen.getAllByTestId('indicador-destaque');
    expect(dots).toHaveLength(5);
    expect(dots[0].parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('marca só o primeiro indicador como ativo', () => {
    render(<FeaturedCarousel movies={makeMovies(5)} />);
    const active = screen.getAllByTestId('indicador-destaque').map((d) => d.getAttribute('data-active'));
    expect(active).toEqual(['true', 'false', 'false', 'false', 'false']);
  });

  it('com 1 filme não mostra indicadores', () => {
    render(<FeaturedCarousel movies={makeMovies(1)} />);
    expect(screen.queryAllByTestId('indicador-destaque')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'Filme 1' })).toBeInTheDocument();
  });

  it('com 0 filmes não renderiza nada', () => {
    const { container } = render(<FeaturedCarousel movies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

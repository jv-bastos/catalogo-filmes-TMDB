import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WatchOptions } from '@/lib/tmdb/types';
import { WatchProviders } from './WatchProviders';

describe('WatchProviders', () => {
  it('mostra só os grupos com provedores e o link do JustWatch', () => {
    render(
      <WatchProviders
        watch={{ link: 'https://jw', flatrate: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }], rent: [], buy: [] }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Onde assistir' })).toBeInTheDocument();
    expect(screen.getByText('Assinatura')).toBeInTheDocument();
    expect(screen.queryByText('Aluguel')).toBeNull();
    expect(screen.getByAltText('Netflix')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver no JustWatch' })).toHaveAttribute('href', 'https://jw');
  });
  it.each<WatchOptions | null>([null, { link: null, flatrate: [], rent: [], buy: [] }])(
    'sem provedores mostra aviso',
    (watch) => {
      render(<WatchProviders watch={watch} />);
      expect(screen.getByText('Não disponível em streaming no Brasil')).toBeInTheDocument();
    },
  );
});

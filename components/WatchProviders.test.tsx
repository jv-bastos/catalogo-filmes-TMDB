import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { WatchOptions } from '@/lib/tmdb/types';
import { WatchProviders } from './WatchProviders';

const provider = (id: number, name: string, logoPath: string | null = `/${id}.png`) => ({ id, name, logoPath });

describe('WatchProviders', () => {
  it('mostra o nome como texto, só os grupos com provedores e o link do TMDB', () => {
    render(<WatchProviders watch={{ link: 'https://jw', flatrate: [provider(8, 'Netflix')], rent: [], buy: [] }} />);
    expect(screen.getByRole('heading', { name: 'Onde assistir' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Assinatura' })).toBeInTheDocument();
    expect(screen.queryByText('Aluguel')).toBeNull();
    expect(screen.queryByText('Compra')).toBeNull();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(document.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.getByRole('link', { name: 'Ver todas as opções no TMDB' })).toHaveAttribute('href', 'https://jw');
  });

  it('empilha os grupos na ordem Assinatura, Aluguel, Compra', () => {
    render(
      <WatchProviders
        watch={{
          link: null,
          flatrate: [provider(8, 'Netflix')],
          rent: [provider(2, 'Apple TV')],
          buy: [provider(3, 'Google Play')],
        }}
      />,
    );
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Assinatura',
      'Aluguel',
      'Compra',
    ]);
    expect(screen.getByText('Apple TV')).toBeInTheDocument();
    expect(screen.getByText('Google Play')).toBeInTheDocument();
  });

  it('renderiza só Aluguel e Compra quando não há assinatura', () => {
    render(
      <WatchProviders
        watch={{ link: null, flatrate: [], rent: [provider(2, 'Apple TV')], buy: [provider(3, 'Google Play')] }}
      />,
    );
    expect(screen.queryByText('Assinatura')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Aluguel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Compra' })).toBeInTheDocument();
  });

  it('provedor sem logo mostra o nome e nenhuma imagem', () => {
    render(<WatchProviders watch={{ link: null, flatrate: [provider(9, 'Canal Local', null)], rent: [], buy: [] }} />);
    expect(screen.getAllByText('Canal Local').length).toBeGreaterThan(0);
    expect(document.querySelector('img')).toBeNull();
  });

  it('sem link do TMDB não mostra o link', () => {
    render(<WatchProviders watch={{ link: null, flatrate: [provider(8, 'Netflix')], rent: [], buy: [] }} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each<WatchOptions | null>([null, { link: null, flatrate: [], rent: [], buy: [] }])(
    'sem provedores mostra aviso',
    (watch) => {
      render(<WatchProviders watch={watch} />);
      expect(screen.getByText('Não disponível em streaming no Brasil')).toBeInTheDocument();
    },
  );
});

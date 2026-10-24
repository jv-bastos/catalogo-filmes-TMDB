import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CastList } from './CastList';

describe('CastList', () => {
  it('lista nome, personagem e foto', () => {
    render(
      <CastList cast={[{ id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profilePath: '/t.jpg' }]} />,
    );
    expect(screen.getByRole('heading', { name: 'Elenco' })).toBeInTheDocument();
    expect(screen.getByText('Timothée Chalamet')).toBeInTheDocument();
    expect(screen.getByText('Paul Atreides')).toBeInTheDocument();
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185/t.jpg');
  });
  it('a lista tem o rótulo Elenco e imagens não arrastáveis', () => {
    render(<CastList cast={[{ id: 1, name: 'Zendaya', character: 'Chani', profilePath: '/z.jpg' }]} />);
    expect(screen.getByRole('list', { name: 'Elenco' })).toBeInTheDocument();
    expect(document.querySelector('img')).toHaveAttribute('draggable', 'false');
  });
  it('sem foto mostra as iniciais', () => {
    render(<CastList cast={[{ id: 1, name: 'Zendaya', character: 'Chani', profilePath: null }]} />);
    expect(screen.getByText('Z')).toBeInTheDocument();
  });
  it('não renderiza nada sem elenco', () => {
    const { container } = render(<CastList cast={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

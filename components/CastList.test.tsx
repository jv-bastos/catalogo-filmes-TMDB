import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CastList } from './CastList';

describe('CastList', () => {
  it('lista nome e personagem', () => {
    render(<CastList cast={[{ id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides' }]} />);
    expect(screen.getByRole('heading', { name: 'Elenco' })).toBeInTheDocument();
    expect(screen.getByText('Timothée Chalamet — Paul Atreides')).toBeInTheDocument();
  });
  it('não renderiza nada sem elenco', () => {
    const { container } = render(<CastList cast={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

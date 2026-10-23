import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MovieCard } from './MovieCard';

describe('MovieCard', () => {
  it('linka para a página do filme e mostra pôster com alt', () => {
    render(<MovieCard movie={{ id: 1, title: 'Duna', posterPath: '/d.jpg', releaseYear: '2021' }} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/filme/1');
    expect(screen.getByAltText('Duna')).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/d.jpg');
    expect(screen.getByText('2021')).toBeInTheDocument();
  });
  it('sem pôster mostra placeholder', () => {
    render(<MovieCard movie={{ id: 1, title: 'X', posterPath: null, releaseYear: null }} />);
    expect(screen.getByTestId('poster-placeholder')).toBeInTheDocument();
  });
});

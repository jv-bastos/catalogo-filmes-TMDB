import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { catalogHref } from '@/lib/urls';
import { Pagination } from './Pagination';

const hrefFor = (p: number) => catalogHref([8], p);

describe('Pagination', () => {
  it('na primeira página só tem Próxima', () => {
    render(<Pagination page={1} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.queryByRole('link', { name: 'Anterior' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute('href', '/?providers=8&page=2');
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
  });
  it('na última página só tem Anterior', () => {
    render(<Pagination page={3} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.queryByRole('link', { name: 'Próxima' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/?providers=8&page=2');
  });
  it('página além do fim não oferece Próxima e Anterior volta para a última', () => {
    render(<Pagination page={40} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.queryByRole('link', { name: 'Próxima' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/?providers=8&page=3');
  });
  it('não renderiza com uma página só', () => {
    const { container } = render(<Pagination page={1} totalPages={1} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('não renderiza com zero páginas', () => {
    const { container } = render(<Pagination page={1} totalPages={0} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });
});

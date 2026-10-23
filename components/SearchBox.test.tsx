import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBox } from './SearchBox';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => push.mockClear());

describe('SearchBox', () => {
  it('envia o termo para /busca', async () => {
    render(<SearchBox />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar filme' }), 'duna{Enter}');
    expect(push).toHaveBeenCalledWith('/busca?q=duna');
  });
  it('envia pelo botão Buscar', async () => {
    render(<SearchBox />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar filme' }), 'duna');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(push).toHaveBeenCalledWith('/busca?q=duna');
  });
  it('codifica acentos e símbolos e remove espaços nas pontas', async () => {
    render(<SearchBox />);
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar filme' }),
      '  O Poderoso Chefão & Cia {Enter}',
    );
    expect(push).toHaveBeenCalledWith('/busca?q=O+Poderoso+Chef%C3%A3o+%26+Cia');
  });
  it('termo vazio não navega', async () => {
    render(<SearchBox />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar filme' }), '   {Enter}');
    expect(push).not.toHaveBeenCalled();
  });
  it('preenche com initialQuery', () => {
    render(<SearchBox initialQuery="duna" />);
    expect(screen.getByRole('searchbox', { name: 'Buscar filme' })).toHaveValue('duna');
  });
  it('é um formulário de busca', () => {
    render(<SearchBox />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});

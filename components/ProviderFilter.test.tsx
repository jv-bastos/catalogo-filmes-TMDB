import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderFilter } from './ProviderFilter';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => push.mockClear());

const providers = [
  { id: 8, name: 'Netflix', logoPath: null },
  { id: 119, name: 'Amazon Prime Video', logoPath: null },
];

describe('ProviderFilter', () => {
  it('tem fieldset com legenda Streamings', () => {
    render(<ProviderFilter providers={providers} selected={[]} />);
    expect(screen.getByRole('group', { name: 'Streamings' })).toBeInTheDocument();
  });
  it('marcar um streaming navega com o filtro e sem page', async () => {
    render(<ProviderFilter providers={providers} selected={[]} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Netflix' }));
    expect(push).toHaveBeenCalledWith('/?providers=8');
  });
  it('reflete a seleção atual', () => {
    render(<ProviderFilter providers={providers} selected={[119]} />);
    expect(screen.getByRole('checkbox', { name: 'Amazon Prime Video' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Netflix' })).not.toBeChecked();
  });
  it('nova seleção fica em ordem crescente de id', async () => {
    render(<ProviderFilter providers={providers} selected={[119]} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Netflix' }));
    expect(push).toHaveBeenCalledWith('/?providers=8%2C119');
  });
  it('desmarcar mantém os outros em ordem', async () => {
    render(<ProviderFilter providers={providers} selected={[8, 119]} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Netflix' }));
    expect(push).toHaveBeenCalledWith('/?providers=119');
  });
  it('desmarcar o último volta para a raiz', async () => {
    render(<ProviderFilter providers={providers} selected={[8]} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Netflix' }));
    expect(push).toHaveBeenCalledWith('/');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Trailer } from './Trailer';

const trailer = { key: 'abc123', name: 'Trailer oficial' };

describe('Trailer', () => {
  it('mostra um botão com nome acessível e a miniatura, sem iframe', () => {
    render(<Trailer trailer={trailer} title="Duna" />);
    expect(screen.getByRole('button', { name: 'Assistir ao trailer de Duna' })).toBeInTheDocument();
    const img = document.querySelector('img')!;
    expect(decodeURIComponent(img.getAttribute('src')!)).toContain('https://i.ytimg.com/vi/abc123/hqdefault.jpg');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('ao clicar troca o botão por um iframe do YouTube', async () => {
    render(<Trailer trailer={trailer} title="Duna" />);
    await userEvent.click(screen.getByRole('button', { name: 'Assistir ao trailer de Duna' }));
    const frame = screen.getByTitle('Trailer de Duna');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toContain('youtube-nocookie.com/embed/abc123');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

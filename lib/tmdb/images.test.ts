import { describe, it, expect } from 'vitest';
import { posterUrl, logoUrl } from './images';

describe('images', () => {
  it('posterUrl', () => {
    expect(posterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
    expect(posterUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
    expect(posterUrl(null)).toBeNull();
  });
  it('logoUrl', () => {
    expect(logoUrl('/n.png')).toBe('https://image.tmdb.org/t/p/w92/n.png');
    expect(logoUrl(null)).toBeNull();
  });
});

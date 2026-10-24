import { describe, it, expect } from 'vitest';
import { backdropUrl, logoUrl, posterUrl, profileUrl } from './images';

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
  it('backdropUrl', () => {
    expect(backdropUrl('/f.jpg')).toBe('https://image.tmdb.org/t/p/w1280/f.jpg');
    expect(backdropUrl(null)).toBeNull();
  });
  it('profileUrl', () => {
    expect(profileUrl('/a.jpg')).toBe('https://image.tmdb.org/t/p/w185/a.jpg');
    expect(profileUrl(null)).toBeNull();
  });
});

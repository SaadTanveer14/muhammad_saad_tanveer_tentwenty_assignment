import type { Video } from '../../../movies/domain/types';
import { pickTrailer } from '../pickTrailer';

const video = (overrides: Partial<Video>): Video => ({
  id: overrides.key ?? 'id',
  key: 'key',
  name: 'Video',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  publishedAt: '2021-01-01',
  ...overrides,
});

describe('pickTrailer', () => {
  it('prefers an official YouTube trailer over teasers and clips', () => {
    const picked = pickTrailer([
      video({ key: 'clip', type: 'Clip' }),
      video({ key: 'teaser', type: 'Teaser' }),
      video({ key: 'trailer', type: 'Trailer' }),
    ]);
    expect(picked?.key).toBe('trailer');
  });

  it('falls back to a teaser when there is no trailer', () => {
    expect(pickTrailer([video({ key: 'teaser', type: 'Teaser' })])?.key).toBe(
      'teaser',
    );
  });

  it('prefers official uploads, then the newest one', () => {
    const picked = pickTrailer([
      video({ key: 'fan', official: false, publishedAt: '2022-01-01' }),
      video({ key: 'old', publishedAt: '2020-01-01' }),
      video({ key: 'new', publishedAt: '2021-06-01' }),
    ]);
    expect(picked?.key).toBe('new');
  });

  it('ignores non-YouTube videos and returns null when nothing is playable', () => {
    expect(pickTrailer([video({ site: 'Vimeo' })])).toBeNull();
    expect(pickTrailer([])).toBeNull();
  });
});

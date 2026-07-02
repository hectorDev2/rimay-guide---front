import { describe, it, expect } from 'vitest';
import { formatDuration, toDisplayStops } from './types';
import type { TourStop } from './types';

describe('formatDuration', () => {
  it('formats 0 seconds as 0:00', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatDuration(45)).toBe('0:45');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats exact minutes', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(300)).toBe('5:00');
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(185)).toBe('3:05');
    expect(formatDuration(7265)).toBe('121:05');
  });
});

function makeStop(overrides: Partial<TourStop> = {}): TourStop {
  return {
    id: 'stop-1',
    order: 1,
    name: 'Stop One',
    latitude: -13.5075,
    longitude: -71.9825,
    radiusMeters: 15,
    audioSrc: '/voices/test.mp3',
    durationSeconds: 120,
    description: 'A test stop',
    culturalContext: 'Test context',
    ...overrides,
  };
}

describe('toDisplayStops', () => {
  it('marks the matching current stop', () => {
    const stops = [
      makeStop({ id: 'a', order: 1 }),
      makeStop({ id: 'b', order: 2 }),
    ];
    const result = toDisplayStops(stops, new Set(), 'b');
    expect(result[0].status).toBe('future');
    expect(result[1].status).toBe('current');
  });

  it('marks completed stops', () => {
    const stops = [
      makeStop({ id: 'a', order: 1 }),
      makeStop({ id: 'b', order: 2 }),
    ];
    const result = toDisplayStops(stops, new Set(['a']), 'b');
    expect(result[0].status).toBe('completed');
    expect(result[1].status).toBe('current');
  });

  it('marks all as future when no current stop matches', () => {
    const stops = [
      makeStop({ id: 'a', order: 1 }),
      makeStop({ id: 'b', order: 2 }),
    ];
    const result = toDisplayStops(stops, new Set(), null);
    expect(result[0].status).toBe('future');
    expect(result[1].status).toBe('future');
  });

  it('includes audioSrc and coordinates in display stops', () => {
    const stop = makeStop({ id: 'a', order: 1 });
    const [display] = toDisplayStops([stop], new Set(), null);
    expect(display.audioSrc).toBe('/voices/test.mp3');
    expect(display.latitude).toBe(-13.5075);
    expect(display.longitude).toBe(-71.9825);
  });

  it('handles empty stops array', () => {
    const result = toDisplayStops([], new Set(), null);
    expect(result).toEqual([]);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { useTourStore } from './tourStore';
import type { Tour } from '@/lib/tour/types';

function makeTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: 'test-tour',
    slug: 'test-tour',
    name: 'Test Tour',
    description: 'A test tour',
    totalDurationMinutes: 30,
    stops: [
      {
        id: 'stop-1',
        order: 1,
        name: 'Stop One',
        latitude: -13.5075,
        longitude: -71.9825,
        radiusMeters: 15,
        audioSrc: '/voices/stop1.mp3',
        durationSeconds: 120,
        description: 'First stop',
        culturalContext: 'Context 1',
      },
      {
        id: 'stop-2',
        order: 2,
        name: 'Stop Two',
        latitude: -13.508,
        longitude: -71.983,
        radiusMeters: 20,
        audioSrc: '/voices/stop2.mp3',
        durationSeconds: 180,
        description: 'Second stop',
        culturalContext: 'Context 2',
      },
    ],
    ...overrides,
  };
}

describe('tourStore', () => {
  beforeEach(() => {
    useTourStore.setState({
      tour: null,
      currentStopIndex: 0,
      completedIds: [],
      isDownloaded: false,
      downloadProgress: 0,
      isDownloading: false,
    });
  });

  it('starts with no tour loaded', () => {
    const state = useTourStore.getState();
    expect(state.tour).toBeNull();
    expect(state.completedIds).toEqual([]);
    expect(state.isDownloaded).toBe(false);
    expect(state.downloadProgress).toBe(0);
  });

  it('sets tour and resets stop index', () => {
    const tour = makeTour();
    useTourStore.getState().setTour(tour);
    const state = useTourStore.getState();
    expect(state.tour).toEqual(tour);
    expect(state.currentStopIndex).toBe(0);
  });

  it('sets current stop index', () => {
    useTourStore.getState().setCurrentStopIndex(1);
    expect(useTourStore.getState().currentStopIndex).toBe(1);
  });

  it('marks a stop as completed', () => {
    useTourStore.getState().setTour(makeTour());
    useTourStore.getState().markStopCompleted('stop-1');
    expect(useTourStore.getState().completedIds).toContain('stop-1');
  });

  it('does not duplicate completed stops', () => {
    useTourStore.getState().markStopCompleted('stop-1');
    useTourStore.getState().markStopCompleted('stop-1');
    expect(useTourStore.getState().completedIds).toEqual(['stop-1']);
  });

  it('marks multiple stops as completed', () => {
    useTourStore.getState().markStopCompleted('stop-1');
    useTourStore.getState().markStopCompleted('stop-2');
    expect(useTourStore.getState().completedIds).toEqual(['stop-1', 'stop-2']);
  });

  it('sets downloaded state', () => {
    useTourStore.getState().setDownloaded(true);
    expect(useTourStore.getState().isDownloaded).toBe(true);
  });

  it('sets download progress', () => {
    useTourStore.getState().setDownloadProgress(50);
    expect(useTourStore.getState().downloadProgress).toBe(50);
  });

  it('sets downloading state', () => {
    useTourStore.getState().setDownloading(true);
    expect(useTourStore.getState().isDownloading).toBe(true);
  });

  it('resets to initial state', () => {
    useTourStore.getState().setTour(makeTour());
    useTourStore.getState().markStopCompleted('stop-1');
    useTourStore.getState().setDownloaded(true);
    useTourStore.getState().reset();

    const state = useTourStore.getState();
    expect(state.tour).toBeNull();
    expect(state.completedIds).toEqual([]);
    expect(state.isDownloaded).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from './mapStore';
import type { Poi } from '@/lib/map/pois';

function makePoi(overrides: Partial<Poi> = {}): Poi {
  return {
    id: 'test-poi',
    name: 'Test POI',
    description: 'A test point of interest',
    category: 'tour_stop',
    latitude: -13.5075,
    longitude: -71.9825,
    extrusionHeight: 5,
    color: '#A0522D',
    geofenceRadius: 25,
    ...overrides,
  };
}

describe('mapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      isReady: false,
      discoveredPoiIds: new Set(),
      activePoi: null,
      showPopup: false,
      center: [-71.9815, -13.5075],
      zoom: 15,
      pitch: 45,
      pendingFlyToPoiId: null,
      show3DViewer: false,
    });
  });

  it('starts with default state', () => {
    const state = useMapStore.getState();
    expect(state.isReady).toBe(false);
    expect(state.discoveredPoiIds.size).toBe(0);
    expect(state.activePoi).toBeNull();
    expect(state.showPopup).toBe(false);
    expect(state.zoom).toBe(15);
  });

  it('sets ready state', () => {
    useMapStore.getState().setReady(true);
    expect(useMapStore.getState().isReady).toBe(true);
  });

  it('marks POI as discovered', () => {
    useMapStore.getState().markDiscovered('coricancha');
    expect(useMapStore.getState().discoveredPoiIds.has('coricancha')).toBe(true);
  });

  it('does not duplicate discovered POIs', () => {
    useMapStore.getState().markDiscovered('coricancha');
    useMapStore.getState().markDiscovered('coricancha');
    expect(useMapStore.getState().discoveredPoiIds.size).toBe(1);
  });

  it('sets active POI and shows popup', () => {
    const poi = makePoi();
    useMapStore.getState().setActivePoi(poi);
    expect(useMapStore.getState().activePoi).toEqual(poi);
    expect(useMapStore.getState().showPopup).toBe(true);
  });

  it('clears active POI and hides popup', () => {
    useMapStore.getState().setActivePoi(null);
    expect(useMapStore.getState().activePoi).toBeNull();
    expect(useMapStore.getState().showPopup).toBe(false);
  });

  it('sets showPopup independently', () => {
    useMapStore.getState().setShowPopup(true);
    expect(useMapStore.getState().showPopup).toBe(true);
  });

  it('sets 3D viewer state', () => {
    useMapStore.getState().setShow3DViewer(true);
    expect(useMapStore.getState().show3DViewer).toBe(true);
  });

  it('sets center coordinates', () => {
    useMapStore.getState().setCenter([-71.98, -13.51]);
    expect(useMapStore.getState().center).toEqual([-71.98, -13.51]);
  });

  it('sets zoom and pitch', () => {
    useMapStore.getState().setZoom(17);
    useMapStore.getState().setPitch(60);
    expect(useMapStore.getState().zoom).toBe(17);
    expect(useMapStore.getState().pitch).toBe(60);
  });

  it('flyToPoi sets pending fly-to and active POI', () => {
    const poi = makePoi({ id: 'sacsayhuaman' });
    useMapStore.getState().flyToPoi(poi);
    const state = useMapStore.getState();
    expect(state.pendingFlyToPoiId).toBe('sacsayhuaman');
    expect(state.activePoi).toEqual(poi);
    expect(state.showPopup).toBe(true);
  });

  it('clears pending fly-to', () => {
    useMapStore.getState().clearPendingFlyTo();
    expect(useMapStore.getState().pendingFlyToPoiId).toBeNull();
  });

  it('resets map to defaults', () => {
    useMapStore.getState().setActivePoi(makePoi());
    useMapStore.getState().setShow3DViewer(true);
    useMapStore.getState().resetMap();

    const state = useMapStore.getState();
    expect(state.activePoi).toBeNull();
    expect(state.showPopup).toBe(false);
    expect(state.show3DViewer).toBe(false);
    expect(state.center).toEqual([-71.9815, -13.5075]);
    expect(state.zoom).toBe(15);
    expect(state.pitch).toBe(45);
    expect(state.pendingFlyToPoiId).toBeNull();
  });
});

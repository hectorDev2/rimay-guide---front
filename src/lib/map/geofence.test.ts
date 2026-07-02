import { describe, it, expect } from 'vitest';
import { haversineDistance, checkProximity, findActivePoi, createExtrusionPolygon } from './geofence';
import type { Poi } from './pois';

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(-13.5, -71.98, -13.5, -71.98)).toBe(0);
  });

  it('calculates ~1.5km distance correctly', () => {
    const d = haversineDistance(-13.5, -71.98, -13.509, -71.97);
    expect(d).toBeGreaterThan(1400);
    expect(d).toBeLessThan(1600);
  });

  it('calculates ~25m distance correctly', () => {
    const d = haversineDistance(-13.5075, -71.9825, -13.5077, -71.9825);
    expect(d).toBeGreaterThan(20);
    expect(d).toBeLessThan(30);
  });

  it('handles antipodal points', () => {
    const d = haversineDistance(0, 0, 0, 180);
    expect(d).toBeGreaterThan(20000000);
  });
});

function makePoi(overrides: Partial<Poi>): Poi {
  return {
    id: 'test',
    name: 'Test POI',
    description: '',
    category: 'tour_stop',
    latitude: -13.5075,
    longitude: -71.9825,
    extrusionHeight: 5,
    color: '#A0522D',
    geofenceRadius: 25,
    ...overrides,
  };
}

describe('checkProximity', () => {
  it('returns "arrived" when within geofence radius', () => {
    const poi = makePoi({ geofenceRadius: 50 });
    const results = checkProximity(-13.5075, -71.9825, [poi]);
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('arrived');
    expect(results[0].distance).toBe(0);
  });

  it('returns "near" when within 100m but outside geofence', () => {
    const poi = makePoi({ latitude: -13.5078, longitude: -71.9825, geofenceRadius: 25 });
    const results = checkProximity(-13.5075, -71.9825, [poi]);
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('near');
    expect(results[0].distance).toBeGreaterThan(30);
    expect(results[0].distance).toBeLessThan(50);
  });

  it('returns empty when far away', () => {
    const poi = makePoi({ latitude: -13.5, longitude: -71.98 });
    const results = checkProximity(-13.52, -71.98, [poi]);
    expect(results).toHaveLength(0);
  });

  it('sorts results by distance ascending', () => {
    const far = makePoi({ id: 'far', latitude: -13.508, longitude: -71.9825, geofenceRadius: 25 });
    const near = makePoi({ id: 'near', latitude: -13.5076, longitude: -71.9825, geofenceRadius: 60 });
    const results = checkProximity(-13.5075, -71.9825, [far, near]);
    expect(results).toHaveLength(2);
    expect(results[0].poi.id).toBe('near');
    expect(results[1].poi.id).toBe('far');
    expect(results[0].distance).toBeLessThan(results[1].distance);
  });
});

describe('findActivePoi', () => {
  it('returns the nearest arrived POI', () => {
    const poi = makePoi({ id: 'active', geofenceRadius: 50 });
    const result = findActivePoi(-13.5075, -71.9825, [poi]);
    expect(result).not.toBeNull();
    expect(result!.poi.id).toBe('active');
    expect(result!.level).toBe('arrived');
  });

  it('returns null when no POI is in range', () => {
    const poi = makePoi({ latitude: -13.5, longitude: -71.98, geofenceRadius: 25 });
    const result = findActivePoi(-13.52, -71.98, [poi]);
    expect(result).toBeNull();
  });

  it('returns null for empty POI array', () => {
    const result = findActivePoi(-13.5075, -71.9825, []);
    expect(result).toBeNull();
  });
});

describe('createExtrusionPolygon', () => {
  it('returns a closed polygon with 5 coordinates', () => {
    const poly = createExtrusionPolygon(-13.5075, -71.9825, 20);
    expect(poly).toHaveLength(1);
    expect(poly[0]).toHaveLength(5);
    expect(poly[0][0]).toEqual(poly[0][4]);
  });

  it('scales with size parameter', () => {
    const small = createExtrusionPolygon(-13.5, -71.98, 10);
    const large = createExtrusionPolygon(-13.5, -71.98, 100);
    const smallLonSpan = Math.abs(small[0][1][0] - small[0][0][0]);
    const largeLonSpan = Math.abs(large[0][1][0] - large[0][0][0]);
    expect(largeLonSpan).toBeGreaterThan(smallLonSpan);
  });
});

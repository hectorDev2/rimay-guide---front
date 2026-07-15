import { describe, it, expect } from 'vitest';
import {
  bearing,
  bearingDiff,
  cumulativeDistances,
  projectOnRoute,
  distanceRemaining,
  splitRouteAt,
  walkingEtaMinutes,
  type LngLat,
} from './route';

// Ruta simple oeste→este sobre el paralelo -13.5075 (~1 km total)
const ROUTE: LngLat[] = [
  [-71.9860, -13.5075],
  [-71.9830, -13.5075],
  [-71.9800, -13.5075],
];

describe('bearing', () => {
  it('apunta al este entre dos puntos del mismo paralelo', () => {
    expect(bearing([-71.99, -13.5], [-71.98, -13.5])).toBeCloseTo(90, 0);
  });

  it('apunta al norte cuando solo cambia la latitud', () => {
    expect(bearing([-71.98, -13.51], [-71.98, -13.50])).toBeCloseTo(0, 0);
  });
});

describe('bearingDiff', () => {
  it('devuelve la diferencia mínima', () => {
    expect(bearingDiff(350, 10)).toBe(20);
    expect(bearingDiff(90, 270)).toBe(180);
    expect(bearingDiff(45, 45)).toBe(0);
  });
});

describe('cumulativeDistances', () => {
  it('empieza en 0 y crece monotónicamente', () => {
    const acc = cumulativeDistances(ROUTE);
    expect(acc[0]).toBe(0);
    expect(acc[1]).toBeGreaterThan(300);
    expect(acc[2]).toBeGreaterThan(acc[1]);
  });
});

describe('projectOnRoute', () => {
  it('proyecta un punto al costado de la ruta sobre la línea', () => {
    // 20 m al norte del punto medio del primer segmento
    const off: LngLat = [-71.9845, -13.5073];
    const proj = projectOnRoute(ROUTE, off);
    expect(proj.segmentIndex).toBe(0);
    expect(proj.distanceToRoute).toBeGreaterThan(5);
    expect(proj.distanceToRoute).toBeLessThan(40);
    expect(proj.snapped[1]).toBeCloseTo(-13.5075, 4);
    expect(proj.segmentBearing).toBeCloseTo(90, 0);
  });

  it('hace clamp al vértice inicial cuando el punto está antes del inicio', () => {
    const before: LngLat = [-71.9880, -13.5075];
    const proj = projectOnRoute(ROUTE, before);
    expect(proj.distanceAlong).toBe(0);
    expect(proj.snapped[0]).toBeCloseTo(ROUTE[0][0], 6);
  });
});

describe('distanceRemaining + splitRouteAt', () => {
  it('en el inicio queda toda la ruta por recorrer', () => {
    const proj = projectOnRoute(ROUTE, ROUTE[0]);
    const total = cumulativeDistances(ROUTE).at(-1)!;
    expect(distanceRemaining(ROUTE, proj)).toBeCloseTo(total, 0);
  });

  it('divide la ruta en recorrido y restante en el punto proyectado', () => {
    const mid: LngLat = [-71.9830, -13.5075];
    const proj = projectOnRoute(ROUTE, mid);
    const { done, remaining } = splitRouteAt(ROUTE, proj);
    expect(done.length).toBeGreaterThanOrEqual(2);
    expect(remaining.length).toBeGreaterThanOrEqual(2);
    expect(done.at(-1)).toEqual(proj.snapped);
    expect(remaining[0]).toEqual(proj.snapped);
  });
});

describe('walkingEtaMinutes', () => {
  it('nunca devuelve menos de 1 minuto', () => {
    expect(walkingEtaMinutes(10)).toBe(1);
  });

  it('estima ~5 min para 330 m a paso turístico', () => {
    expect(walkingEtaMinutes(330)).toBe(5);
  });
});

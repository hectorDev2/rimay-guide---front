import { useMemo } from 'react';
import * as THREE from 'three';

export interface SiteModelProps {
  color: string;
  height: number;
}

function StoneEdges({ geometry, color }: { geometry: THREE.BufferGeometry; color: string }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color={color} opacity={0.3} transparent />
    </lineSegments>
  );
}

function BasePlatform({ width, depth, height, color }: { width: number; depth: number; height: number; color: string }) {
  const geo = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  return (
    <group>
      <mesh geometry={geo} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.1} />
      </mesh>
      <StoneEdges geometry={geo} color={color} />
    </group>
  );
}

function SteppedPyramid({ levels, baseWidth, baseDepth, height, color }: { levels: number; baseWidth: number; baseDepth: number; height: number; color: string }) {
  const parts = useMemo(() => {
    const result: { w: number; d: number; h: number; y: number }[] = [];
    let currentY = 0;
    for (let i = 0; i < levels; i++) {
      const t = i / levels;
      const w = baseWidth * (1 - t * 0.5);
      const d = baseDepth * (1 - t * 0.5);
      const h = height / levels;
      result.push({ w, d, h, y: currentY + h / 2 });
      currentY += h;
    }
    return result;
  }, [levels, baseWidth, baseDepth, height]);

  return (
    <group>
      {parts.map((p, i) => (
        <mesh key={i} position={[0, p.y, 0]}>
          <boxGeometry args={[p.w, p.h, p.d]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function TrapezoidalPillar({ width, depth, height, color }: { width: number; depth: number; height: number; color: string }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const topW = width * 0.6;
    shape.moveTo(-topW / 2, 0);
    shape.lineTo(topW / 2, 0);
    shape.lineTo(width / 2, height);
    shape.lineTo(-width / 2, height);
    shape.closePath();
    const extrudeSettings = { depth, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [width, depth, height]);

  return (
    <group>
      <mesh geometry={geo} position={[-depth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.1} flatShading />
      </mesh>
      <StoneEdges geometry={geo} color={color} />
    </group>
  );
}

export function TempleModel({ color, height }: SiteModelProps) {
  const scaledHeight = Math.max(1.5, height * 0.25);
  const darkerColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.7);
    return c.getHexString();
  }, [color]);

  return (
    <group>
      <BasePlatform width={4} depth={3} height={0.3} color={color} />
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[3.2, 1.2, 2.2]} />
        <meshStandardMaterial color={`#${darkerColor}`} roughness={0.9} metalness={0.05} />
      </mesh>
      <SteppedPyramid levels={3} baseWidth={3.4} baseDepth={2.4} height={0.8} color={color} />
      <group position={[0, 0, 1.4]}>
        <group position={[-0.8, 0, 0]}>
          <TrapezoidalPillar width={0.35} depth={0.35} height={scaledHeight} color={color} />
        </group>
        <group position={[0.8, 0, 0]}>
          <TrapezoidalPillar width={0.35} depth={0.35} height={scaledHeight} color={color} />
        </group>
      </group>
    </group>
  );
}

export function FortressModel({ color, height }: SiteModelProps) {
  const zigzagPoints = useMemo(() => {
    const points: { x: number; z: number }[] = [];
    const halfW = 2.5;
    const depth = 2;
    const zigCount = 4;
    const step = (halfW * 2) / zigCount;
    for (let i = 0; i <= zigCount; i++) {
      const x = -halfW + i * step;
      const zDir = i % 2 === 0 ? 1 : -1;
      points.push({ x, z: zDir * depth * 0.3 });
    }
    return points;
  }, []);

  const wallShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(zigzagPoints[0].x, zigzagPoints[0].z);
    for (let i = 1; i < zigzagPoints.length; i++) {
      shape.lineTo(zigzagPoints[i].x, zigzagPoints[i].z);
    }
    shape.lineTo(zigzagPoints[zigzagPoints.length - 1].x, zigzagPoints[zigzagPoints.length - 1].z + 0.5);
    for (let i = zigzagPoints.length - 1; i >= 0; i--) {
      shape.lineTo(zigzagPoints[i].x, zigzagPoints[i].z + 0.5);
    }
    shape.closePath();
    return shape;
  }, [zigzagPoints]);

  const wallGeo = useMemo(() => {
    const extrudeSettings = { depth: 0.4, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
  }, [wallShape]);

  const wallHeight = Math.max(0.8, height * 0.15);
  const darker = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.75);
    return c.getHexString();
  }, [color]);

  return (
    <group>
      <BasePlatform width={5.5} depth={4} height={0.3} color={color} />
      {[-1, 1].map((side) => (
        <group key={side} position={[0, wallHeight / 2, side * 1.2]}>
          <mesh geometry={wallGeo} rotation={[0, side > 0 ? Math.PI : 0, 0]}>
            <meshStandardMaterial color={`#${darker}`} roughness={0.9} metalness={0.05} flatShading />
          </mesh>
          <StoneEdges geometry={wallGeo} color={color} />
        </group>
      ))}
      <mesh position={[2.2, 1.2, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.2]} />
        <meshStandardMaterial color={`#${darker}`} roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[-2.2, 1.2, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.2]} />
        <meshStandardMaterial color={`#${darker}`} roughness={0.85} metalness={0.1} />
      </mesh>
    </group>
  );
}

export function SanctuaryModel({ color, height }: SiteModelProps) {
  const rockGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i,
        pos.getX(i) + (Math.random() - 0.5) * 0.3,
        pos.getY(i) + (Math.random() - 0.5) * 0.2,
        pos.getZ(i) + (Math.random() - 0.5) * 0.3,
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const darker = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.65);
    return c.getHexString();
  }, [color]);

  return (
    <group>
      <BasePlatform width={4.5} depth={3.5} height={0.4} color={color} />
      <mesh geometry={rockGeo} position={[0, 1.2, 0]} scale={[1, 0.8, 0.9]}>
        <meshStandardMaterial color={`#${darker}`} roughness={0.95} metalness={0.0} flatShading />
      </mesh>
      <mesh position={[0.5, 0.6, 0.8]} rotation={[-0.3, 0, 0.2]}>
        <boxGeometry args={[1.2, 0.15, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function MiradorModel({ color, height }: SiteModelProps) {
  const towerHeight = Math.max(2, height * 0.3);
  const darker = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.7);
    return c.getHexString();
  }, [color]);

  return (
    <group>
      <BasePlatform width={3.5} depth={3} height={0.3} color={color} />
      <SteppedPyramid levels={4} baseWidth={2} baseDepth={1.6} height={towerHeight} color={`#${darker}`} />
      <mesh position={[0, towerHeight + 0.3, 0]}>
        <boxGeometry args={[2.2, 0.2, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {[
        [-1, 0], [1, 0], [0, -0.8], [0, 0.8]
      ].map(([dx, dz], i) => (
        <mesh key={i} position={[dx * 1.1, towerHeight + 0.6, dz * 0.9]}>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color={`#${darker}`} roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function PlazaModel({ color, height }: SiteModelProps) {
  const darker = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.8);
    return c.getHexString();
  }, [color]);

  return (
    <group>
      <BasePlatform width={5} depth={4.5} height={0.15} color={color} />
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.5, 0.3, 2]} />
        <meshStandardMaterial color={`#${darker}`} roughness={0.9} metalness={0.0} />
      </mesh>
      {[-2.2, 2.2].flatMap((x) =>
        [-2, 2].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.08, z]}>
            <boxGeometry args={[0.2, 0.08, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.7} metalness={0.15} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function TourStopModel({ color, height }: SiteModelProps) {
  return (
    <group>
      <BasePlatform width={2.5} depth={2} height={0.2} color={color} />
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.6, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0.6]}>
        <planeGeometry args={[1, 0.4]} />
        <meshStandardMaterial color="#f5f0e8" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

const MODEL_COMPONENTS: Record<string, React.ComponentType<SiteModelProps>> = {
  templo: TempleModel,
  fortaleza: FortressModel,
  santuario: SanctuaryModel,
  mirador: MiradorModel,
  plaza: PlazaModel,
  mercado: PlazaModel,
  barrio: PlazaModel,
  tour_stop: TourStopModel,
};

export function getSiteModel(category: string): React.ComponentType<SiteModelProps> {
  return MODEL_COMPONENTS[category] ?? TourStopModel;
}

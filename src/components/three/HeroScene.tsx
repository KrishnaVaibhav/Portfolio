import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
  PerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/use-motion";

/*
  "Distributed core": a refractive glass core (the platform) with services
  orbiting on three tilted rings and request packets travelling between them.
  The scene reads its palette from CSS tokens so it follows light / dark mode.
*/

type Palette = { node: THREE.Color; line: THREE.Color; bg: THREE.Color };

const readToken = (name: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color().setStyle(`hsl(${raw.split(/\s+/).join(", ")})`);
};

const usePalette = (): Palette => {
  const read = () => ({
    node: readToken("--scene-node"),
    line: readToken("--scene-line"),
    bg: readToken("--background"),
  });
  const [palette, setPalette] = useState<Palette>(read);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setPalette(read());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return palette;
};

const RINGS = [
  { radius: 1.95, tilt: [1.25, 0.1, 0.35] as const, speed: 0.16, nodes: 5, offset: 0.2 },
  { radius: 2.55, tilt: [0.35, 0.25, -0.85] as const, speed: -0.11, nodes: 6, offset: 1.1 },
  { radius: 3.15, tilt: [1.85, 0.55, 0.15] as const, speed: 0.07, nodes: 8, offset: 2.4 },
];

const CORE_RADIUS = 1.15;

function Ring({
  radius,
  tilt,
  speed,
  nodes,
  offset,
  palette,
  animate,
}: (typeof RINGS)[number] & { palette: Palette; animate: boolean }) {
  const spin = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Mesh[]>([]);

  const layout = useMemo(() => {
    const points = Array.from({ length: nodes }, (_, i) => {
      const a = (i / nodes) * Math.PI * 2 + offset;
      return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    });
    // Every other node is wired to the core; those links carry packets.
    const links = points
      .filter((_, i) => i % 2 === 0)
      .map((p) => ({ from: p.clone().normalize().multiplyScalar(CORE_RADIUS + 0.05), to: p }));
    const positions = new Float32Array(links.flatMap(({ from, to }) => [...from.toArray(), ...to.toArray()]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { points, links, geometry };
  }, [nodes, offset, radius]);

  useEffect(() => () => layout.geometry.dispose(), [layout]);

  useFrame((state, delta) => {
    if (!animate) return;
    if (spin.current) spin.current.rotation.z += delta * speed;
    const t = state.clock.elapsedTime;
    layout.links.forEach(({ from, to }, i) => {
      const mesh = packets.current[i];
      if (!mesh) return;
      // Alternate direction so traffic reads as request / response.
      const raw = (t * 0.35 + i * 0.37 + offset) % 1;
      const k = i % 2 ? 1 - raw : raw;
      mesh.position.lerpVectors(from, to, k);
      const s = Math.sin(raw * Math.PI);
      mesh.scale.setScalar(0.4 + s * 0.8);
    });
  });

  return (
    <group rotation={tilt as unknown as THREE.Euler}>
      <mesh>
        <torusGeometry args={[radius, 0.0045, 8, 220]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.45} />
      </mesh>
      <group ref={spin}>
        <lineSegments geometry={layout.geometry}>
          <lineBasicMaterial color={palette.node} transparent opacity={0.28} />
        </lineSegments>
        {layout.points.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[i % 2 === 0 ? 0.095 : 0.06, 24, 24]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? palette.node : palette.line}
              emissive={i % 2 === 0 ? palette.node : palette.line}
              emissiveIntensity={i % 2 === 0 ? 0.9 : 0.25}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
        ))}
        {layout.links.map((link, i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) packets.current[i] = m;
            }}
            position={link.from.clone().lerp(link.to, 0.5)}
          >
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color={palette.node} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Core({ palette, quality, animate }: { palette: Palette; quality: number; animate: boolean }) {
  const inner = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!animate || !inner.current) return;
    inner.current.rotation.x += delta * 0.25;
    inner.current.rotation.y += delta * 0.4;
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[CORE_RADIUS, 24]} />
        <MeshTransmissionMaterial
          background={palette.bg}
          samples={quality > 0.5 ? 8 : 4}
          resolution={quality > 0.5 ? 768 : 384}
          transmission={1}
          thickness={1.1}
          roughness={0.04}
          ior={1.3}
          chromaticAberration={0.05}
          anisotropy={0.25}
          distortion={0.25}
          distortionScale={0.45}
          temporalDistortion={animate ? 0.12 : 0}
          clearcoat={1}
          attenuationColor="#ffffff"
          attenuationDistance={12}
          backside
          backsideThickness={0.5}
        />
      </mesh>
      <group ref={inner}>
        <mesh>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color={palette.node}
            emissive={palette.node}
            emissiveIntensity={0.55}
            flatShading
            roughness={0.35}
          />
        </mesh>
        <mesh scale={1.55}>
          <icosahedronGeometry args={[0.38, 1]} />
          <meshBasicMaterial color={palette.node} wireframe transparent opacity={0.22} />
        </mesh>
      </group>
    </group>
  );
}

// Eases the whole system toward the pointer for a little depth parallax.
function Rig({ children, animate }: { children: React.ReactNode; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const g = group.current;
    const targetY = animate ? state.pointer.x * 0.35 + state.clock.elapsedTime * 0.05 : 0.4;
    const targetX = animate ? -state.pointer.y * 0.2 : -0.15;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  const palette = usePalette();
  const reduced = usePrefersReducedMotion();
  const [quality, setQuality] = useState(1);
  const [visible, setVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  // Stop rendering entirely once the hero scrolls away.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = !reduced;

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 8.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={!visible ? "never" : animate ? "always" : "demand"}
        aria-hidden
      >
        <PerformanceMonitor onDecline={() => setQuality(0.4)} onIncline={() => setQuality(1)} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 6, 4]} intensity={1.6} />

        <Rig animate={animate}>
          <Float speed={animate ? 1.4 : 0} rotationIntensity={0.25} floatIntensity={0.6}>
            <Core palette={palette} quality={quality} animate={animate} />
          </Float>
          {RINGS.map((ring, i) => (
            <Ring key={i} {...ring} palette={palette} animate={animate} />
          ))}
        </Rig>

        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
            <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
            <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
            <Lightformer form="ring" color={palette.node} intensity={2.5} rotation-y={Math.PI / 2} position={[-6, 4, 3]} scale={6} />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}

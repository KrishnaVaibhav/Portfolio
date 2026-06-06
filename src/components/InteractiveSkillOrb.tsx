import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Html } from "@react-three/drei";
import * as THREE from "three";

interface SkillOrbProps {
  skill: string;
  color: string;
  position: [number, number, number];
  onClick: () => void;
}

function SkillOrb({ skill, color, position, onClick }: SkillOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        <Sphere
          ref={meshRef}
          args={[0.8, 32, 32]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
          scale={hovered ? 1.2 : 1}
        >
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.4}
            speed={2}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        {hovered && (
          <Html center>
            <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/50 text-foreground text-sm font-semibold whitespace-nowrap">
              {skill}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

export const InteractiveSkillOrb = ({ skills }: { skills: Array<{ name: string; color: string }> }) => {
  const handleSkillClick = (skill: string) => {
    console.log(`Clicked: ${skill}`);
  };

  return (
    <div className="w-full h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <spotLight position={[0, 10, 0]} intensity={0.5} />

        {skills.map((skill, idx) => {
          const angle = (idx / skills.length) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(idx * 0.5) * 1.5;

          return (
            <SkillOrb
              key={idx}
              skill={skill.name}
              color={skill.color}
              position={[x, y, z]}
              onClick={() => handleSkillClick(skill.name)}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

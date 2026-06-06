import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

function FloatingIcon({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <Center position={[position[0], position[1] - 1, position[2]]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.2}
          height={0.1}
          curveSegments={12}
        >
          {text}
          <meshStandardMaterial color={color} />
        </Text3D>
      </Center>
    </Float>
  );
}

export const FloatingTechIcons = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <FloatingIcon position={[-3, 2, 0]} text="React" color="#61dafb" />
        <FloatingIcon position={[3, 2, 0]} text="Java" color="#f89820" />
        <FloatingIcon position={[-2, -1, 1]} text="Native" color="#0078d4" />
        <FloatingIcon position={[2, -1, -1]} text="Azure" color="#00d4ff" />
      </Canvas>
    </div>
  );
};

import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model';
import * as THREE from 'three';

// Animated spacetime fabric grid
const SpacetimeGrid = () => {
  const groupRef = useRef<THREE.Group>(null);

  const { outer, inner } = (() => {
    // Outer dim grid — large, fades into fog
    const outerPoints: number[] = [];
    const outerSize = 30, outerDivs = 30, step = outerSize / outerDivs, half = outerSize / 2;
    for (let i = 0; i <= outerDivs; i++) {
      const z = -half + i * step;
      outerPoints.push(-half, 0, z, half, 0, z);
    }
    for (let i = 0; i <= outerDivs; i++) {
      const x = -half + i * step;
      outerPoints.push(x, 0, -half, x, 0, half);
    }
    const outerGeo = new THREE.BufferGeometry();
    outerGeo.setAttribute('position', new THREE.Float32BufferAttribute(outerPoints, 3));

    // Inner bright grid — closer, more visible
    const innerPoints: number[] = [];
    const innerSize = 8, innerDivs = 16, iStep = innerSize / innerDivs, iHalf = innerSize / 2;
    for (let i = 0; i <= innerDivs; i++) {
      const z = -iHalf + i * iStep;
      innerPoints.push(-iHalf, 0, z, iHalf, 0, z);
    }
    for (let i = 0; i <= innerDivs; i++) {
      const x = -iHalf + i * iStep;
      innerPoints.push(x, 0, -iHalf, x, 0, iHalf);
    }
    const innerGeo = new THREE.BufferGeometry();
    innerGeo.setAttribute('position', new THREE.Float32BufferAttribute(innerPoints, 3));

    return { outer: outerGeo, inner: innerGeo };
  })();

  const outerMat = new THREE.LineBasicMaterial({ color: '#3b1e78', transparent: true, opacity: 0.25 });
  const innerMat = new THREE.LineBasicMaterial({ color: '#7c3aed', transparent: true, opacity: 0.55 });

  // Subtle breathing animation on the grid
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      outerMat.opacity = 0.2 + Math.sin(t * 0.5) * 0.05;
      innerMat.opacity = 0.45 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <lineSegments geometry={outer} material={outerMat} />
      <lineSegments geometry={inner} material={innerMat} />
    </group>
  );
};

export const Experience = ({ audioLevel }: { audioLevel: number }) => {
  return (
    <>
      {/* Fixed camera — no OrbitControls = no zoom bug */}
      <PerspectiveCamera makeDefault position={[0, 1.05, 3.8]} fov={22} />

      {/* Lighting: dramatic with purple rim */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 4]} intensity={0.9} color="#ffffff" castShadow />
      <directionalLight position={[-2, 2, -1]} intensity={0.25} color="#c4b5fd" />
      <directionalLight position={[0, 2, -3.5]} intensity={0.7} color="#7c3aed" />
      <pointLight position={[0, 0.5, 1.5]} intensity={0.25} color="#a78bfa" />

      {/* Spacetime grid */}
      <SpacetimeGrid />

      <Suspense fallback={null}>
        <Model audioLevel={audioLevel} />

        <ContactShadows
          opacity={0.6}
          scale={5}
          blur={2}
          far={4}
          resolution={512}
          color="#4c1d95"
          position={[0, 0.01, 0]}
        />
      </Suspense>

      {/* Fog — grid fades into darkness */}
      <fog attach="fog" args={['#000000', 6, 18]} />
    </>
  );
};

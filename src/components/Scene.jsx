import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  PerspectiveCamera,
  RoundedBox,
  useGLTF,
} from '@react-three/drei';
import {
  Box3,
  Color,
  MathUtils,
  MeshPhysicalMaterial,
  Vector3,
} from 'three';
import CarModel from './CarModel';
import { useAssetPresence } from '../hooks/useAssetPresence';

const mix = (start, end, value) => start + (end - start) * value;
const damp = (current, target, speed, delta) =>
  MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
const clamp01 = (value) => MathUtils.clamp(value, 0, 1);

function SceneLoader() {
  return (
    <Html center>
      <div className="scene-loader">Initializing studio</div>
    </Html>
  );
}

function LoadedStudio() {
  const gltf = useGLTF('/models/studio.glb');

  const { clone, scale, offset } = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const normalizedScale = 18 / maxDimension;

    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material = child.material.clone();
        if ('envMapIntensity' in child.material) child.material.envMapIntensity = 1.1;
        if ('metalness' in child.material)
          child.material.metalness = Math.min(child.material.metalness + 0.05, 1);
      }
    });

    return {
      clone: scene,
      scale: normalizedScale,
      offset: [
        -center.x * normalizedScale,
        -box.min.y * normalizedScale - 0.72,
        -center.z * normalizedScale,
      ],
    };
  }, [gltf.scene]);

  return (
    <group position={offset} scale={scale} rotation={[0, Math.PI * 0.16, 0]}>
      <primitive object={clone} />
    </group>
  );
}

function FallbackStudio() {
  const frameMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#0e1623'),
        metalness: 0.82,
        roughness: 0.24,
        clearcoat: 0.6,
      }),
    [],
  );

  return (
    <group position={[0, -0.62, -0.2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#06080d" roughness={0.96} metalness={0.08} />
      </mesh>
      <mesh position={[0, 3.3, -7.5]} rotation={[0.14, 0, 0]}>
        <torusGeometry args={[6.2, 0.08, 32, 140]} />
        <meshBasicMaterial color="#58d6ff" transparent opacity={0.26} />
      </mesh>
      <mesh position={[0, 2.1, -10]}>
        <planeGeometry args={[28, 12]} />
        <meshStandardMaterial color="#08111d" roughness={0.94} metalness={0.15} />
      </mesh>
      <RoundedBox
        args={[12.5, 6.2, 0.28]}
        radius={0.36}
        smoothness={4}
        position={[0, 2.1, -10.2]}
        material={frameMaterial}
      />
      {[-5.2, 5.2].map((x) => (
        <group key={x} position={[x, 2.2, -3]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 8.4, 16]} />
            <meshBasicMaterial color="#b7f0ff" transparent opacity={0.42} />
          </mesh>
          <mesh position={[0, 0, -2.5]}>
            <planeGeometry args={[0.24, 6.4]} />
            <meshBasicMaterial color="#6dd8ff" transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function StudioEnvironment() {
  const studioAvailable = useAssetPresence('/models/studio.glb');
  if (!studioAvailable) return <FallbackStudio />;
  return (
    <Suspense fallback={<FallbackStudio />}>
      <LoadedStudio />
    </Suspense>
  );
}

function SceneStage({ scrollState }) {
  const carRigRef = useRef(null);
  const studioRigRef = useRef(null);
  const heroGlowRef = useRef(null);
  const keyLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const fillLightRef = useRef(null);

  useFrame((state, delta) => {
    const { camera, pointer, size } = state;
    const compact = size.width < 900;

    const cinematic = scrollState.sections.cinematic ?? 0;
    const design = scrollState.sections.design ?? 0;
    const performance = scrollState.sections.performance ?? 0;
    const studio = scrollState.sections.studio ?? 0;
    const gallery = scrollState.sections.gallery ?? 0;
    const studioPresence = clamp01(studio * 1.08 - gallery * 0.92);
    const galleryPresence = clamp01(gallery * 1.04 - studio * 0.78);

    let carX = compact ? 0.1 : 0.5;
    let carY = compact ? -0.5 : -0.55;
    let carZ = 0;
    let carScale = compact ? 1.05 : 1.4;
    let carRotX = pointer.y * 0.08 + 0.03;
    let carRotY = pointer.x * 0.24 - 0.34;
    let carRotZ = pointer.x * -0.04;

    let cameraX = pointer.x * (compact ? 0.28 : 0.42);
    let cameraY = compact ? 1.6 : 1.8;
    let cameraZ = compact ? 8.5 : 7.2;
    let keyLight = 20;
    let rimLight = 10;
    let fillLight = 7;
    let glowScale = 1;

    if (cinematic > 0) {
      carX = mix(carX, compact ? 0.05 : -0.25, cinematic);
      carY = mix(carY, compact ? -0.5 : -0.55, cinematic);
      carScale = mix(carScale, compact ? 1.2 : 1.6, cinematic);
      carRotX = mix(carRotX, 0.08, cinematic);
      carRotY = mix(carRotY, compact ? 0.6 : 0.92, cinematic);
      cameraX = mix(cameraX, pointer.x * 0.25 - 0.35, cinematic);
      cameraZ = mix(cameraZ, compact ? 7.6 : 6.05, cinematic);
      keyLight = mix(keyLight, 24, cinematic);
      rimLight = mix(rimLight, 14, cinematic);
      glowScale = mix(glowScale, 1.26, cinematic);
    }

    if (design > 0) {
      carX = mix(carX, compact ? 0.24 : 1.45, design);
      carY = mix(carY, compact ? -0.5 : -0.55, design);
      carRotY = mix(carRotY, 0.56, design);
      cameraX = mix(cameraX, compact ? 0.08 : 0.25, design);
      cameraZ = mix(cameraZ, compact ? 8.1 : 7, design);
    }

    if (performance > 0) {
      carX = mix(carX, compact ? -0.05 : 0.22, performance);
      carY = mix(carY, compact ? -0.5 : -0.55, performance);
      carScale = mix(carScale, compact ? 0.95 : 1.4, performance);
      carRotY = mix(carRotY, 1.18, performance);
      carRotZ = mix(carRotZ, -0.05, performance);
      cameraX = mix(cameraX, pointer.x * 0.18 - 0.18, performance);
      cameraY = mix(cameraY, compact ? 1.4 : 1.6, performance);
      cameraZ = mix(cameraZ, compact ? 7.4 : 5.85, performance);
      keyLight = mix(keyLight, 28, performance);
      rimLight = mix(rimLight, 16, performance);
      fillLight = mix(fillLight, 10, performance);
      glowScale = mix(glowScale, 1.42, performance);
    }

    if (studioPresence > 0) {
      carX = mix(carX, compact ? 0.02 : 0.04, studioPresence);
      carY = mix(carY, compact ? -0.48 : -0.52, studioPresence);
      carZ = mix(carZ, compact ? 0.08 : 0.14, studioPresence);
      carScale = mix(carScale, compact ? 1.0 : 1.25, studioPresence);
      carRotX = mix(carRotX, 0.05, studioPresence);
      carRotY = mix(carRotY, compact ? 0.28 : 0.34, studioPresence);
      carRotZ = mix(carRotZ, 0, studioPresence);
      cameraX = mix(cameraX, pointer.x * 0.1 + (compact ? 0 : 0.04), studioPresence);
      cameraY = mix(cameraY, compact ? 1.6 : 1.8, studioPresence);
      cameraZ = mix(cameraZ, compact ? 7.5 : 7.25, studioPresence);
      keyLight = mix(keyLight, 19, studioPresence);
      rimLight = mix(rimLight, 12, studioPresence);
      fillLight = mix(fillLight, 9.5, studioPresence);
      glowScale = mix(glowScale, 0.96, studioPresence);
    }

    if (galleryPresence > 0) {
      carX = mix(carX, compact ? 0.12 : -0.46, galleryPresence);
      carY = mix(carY, compact ? -0.5 : -0.55, galleryPresence);
      carZ = mix(carZ, compact ? -0.04 : -0.12, galleryPresence);
      carScale = mix(carScale, compact ? 0.9 : 1.1, galleryPresence);
      carRotY = mix(carRotY, compact ? -0.08 : -0.18, galleryPresence);
      cameraX = mix(cameraX, pointer.x * 0.16 + 0.08, galleryPresence);
      cameraY = mix(cameraY, compact ? 1.6 : 1.8, galleryPresence);
      cameraZ = mix(cameraZ, compact ? 8 : 8.45, galleryPresence);
    }

    const sceneTiltX = pointer.y * 0.02;
    const sceneTiltY = pointer.x * 0.05;

    if (carRigRef.current) {
      carRigRef.current.position.x = damp(carRigRef.current.position.x, carX, 3.2, delta);
      carRigRef.current.position.y = damp(carRigRef.current.position.y, carY, 3.2, delta);
      carRigRef.current.position.z = damp(carRigRef.current.position.z, carZ, 3.2, delta);
      carRigRef.current.rotation.x = damp(
        carRigRef.current.rotation.x,
        carRotX + sceneTiltX,
        3.4,
        delta,
      );
      carRigRef.current.rotation.y = damp(
        carRigRef.current.rotation.y,
        carRotY + sceneTiltY,
        3.4,
        delta,
      );
      carRigRef.current.rotation.z = damp(carRigRef.current.rotation.z, carRotZ, 3.4, delta);
      carRigRef.current.scale.x = damp(carRigRef.current.scale.x, carScale, 3.2, delta);
      carRigRef.current.scale.y = damp(carRigRef.current.scale.y, carScale, 3.2, delta);
      carRigRef.current.scale.z = damp(carRigRef.current.scale.z, carScale, 3.2, delta);
    }

    if (studioRigRef.current) {
      studioRigRef.current.rotation.y = damp(
        studioRigRef.current.rotation.y,
        pointer.x * 0.08 + studio * 0.08 - gallery * 0.06,
        2.2,
        delta,
      );
      studioRigRef.current.position.x = damp(
        studioRigRef.current.position.x,
        pointer.x * -0.4,
        1.8,
        delta,
      );
      studioRigRef.current.position.y = damp(
        studioRigRef.current.position.y,
        pointer.y * -0.18,
        1.8,
        delta,
      );
    }

    if (heroGlowRef.current) {
      const targetScale = glowScale + Math.abs(pointer.x) * 0.08;
      heroGlowRef.current.scale.x = damp(heroGlowRef.current.scale.x, targetScale, 2.4, delta);
      heroGlowRef.current.scale.y = damp(heroGlowRef.current.scale.y, targetScale, 2.4, delta);
      heroGlowRef.current.material.opacity = damp(
        heroGlowRef.current.material.opacity,
        0.18 + performance * 0.1,
        2.4,
        delta,
      );
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity = damp(keyLightRef.current.intensity, keyLight, 2.2, delta);
      keyLightRef.current.position.x = damp(
        keyLightRef.current.position.x,
        3.6 + pointer.x * 1.2,
        2.2,
        delta,
      );
      keyLightRef.current.position.y = damp(
        keyLightRef.current.position.y,
        4.6 + pointer.y * 0.8,
        2.2,
        delta,
      );
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = damp(rimLightRef.current.intensity, rimLight, 2.2, delta);
      rimLightRef.current.position.x = damp(
        rimLightRef.current.position.x,
        -4.2 - pointer.x * 0.8,
        2.2,
        delta,
      );
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = damp(fillLightRef.current.intensity, fillLight, 2.2, delta);
    }

    camera.position.x = damp(camera.position.x, cameraX, 2.6, delta);
    camera.position.y = damp(camera.position.y, cameraY, 2.6, delta);
    camera.position.z = damp(camera.position.z, cameraZ, 2.6, delta);
    camera.lookAt(carX * 0.3, carY + 0.6, 0);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.8, 8.2]} fov={42} />

      <fog attach="fog" args={['#05070b', 12, 30]} />

      <ambientLight intensity={0.8} color="#8aa3c5" />
      <spotLight
        ref={keyLightRef}
        color="#f4fbff"
        angle={0.42}
        penumbra={0.75}
        position={[3.6, 4.6, 5]}
        intensity={20}
      />
      <pointLight
        ref={rimLightRef}
        color="#59d4ff"
        position={[-4.2, 2.8, -4]}
        intensity={10}
      />
      <pointLight
        ref={fillLightRef}
        color="#ff5a5a"
        position={[1.8, 1.4, -5.5]}
        intensity={7}
      />

      <group ref={studioRigRef}>
        <StudioEnvironment />
      </group>

      <mesh ref={heroGlowRef} position={[0.25, 0.2, -4.4]}>
        <circleGeometry args={[3.8, 48]} />
        <meshBasicMaterial color="#58d6ff" transparent opacity={0.18} />
      </mesh>

      <Float speed={1.1} rotationIntensity={0.16} floatIntensity={0.18}>
        <group ref={carRigRef}>
          <CarModel />
        </group>
      </Float>

      <ContactShadows
        position={[0, -0.58, 0]}
        opacity={0.42}
        width={13}
        height={13}
        blur={2.2}
        far={10}
        color="#000000"
      />

      <Environment preset="night" />
    </>
  );
}

export default function Scene({ scrollState }) {
  const pixelRatio =
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas
        dpr={pixelRatio}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={<SceneLoader />}>
          <SceneStage scrollState={scrollState} />
        </Suspense>
      </Canvas>
    </div>
  );
}

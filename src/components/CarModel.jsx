import { Suspense, useMemo } from 'react';
import { useGLTF, RoundedBox } from '@react-three/drei';
import { Box3, Color, MeshPhysicalMaterial, Vector3 } from 'three';
import { useAssetPresence } from '../hooks/useAssetPresence';

const carModelUrl = '/models/2018_mercedes-amg_gt4.glb';

function NormalizedCarModel() {
  const gltf = useGLTF(carModelUrl);

  const { clone, scale, offset } = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const normalizedScale = 4.8 / maxDimension;

    scene.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material = child.material.clone();

        if ('metalness' in child.material) {
          child.material.metalness = Math.min(child.material.metalness + 0.15, 1);
        }

        if ('roughness' in child.material) {
          child.material.roughness = Math.max(child.material.roughness * 0.72, 0.08);
        }

        if ('envMapIntensity' in child.material) {
          child.material.envMapIntensity = 1.5;
        }
      }
    });

    return {
      clone: scene,
      scale: normalizedScale,
      offset: [
        -center.x * normalizedScale,
        -box.min.y * normalizedScale - 0.08,
        -center.z * normalizedScale,
      ],
    };
  }, [gltf.scene]);

  return (
    <group scale={scale} position={offset}>
      <primitive object={clone} />
    </group>
  );
}

function FallbackCarModel() {
  const shellMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#d6dbe5'),
        metalness: 0.96,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.8,
      }),
    [],
  );

  const shadowMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#10151e'),
        metalness: 0.65,
        roughness: 0.42,
      }),
    [],
  );

  const glassMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#88b9d8'),
        metalness: 0.1,
        roughness: 0.04,
        transmission: 0.72,
        transparent: true,
        opacity: 0.85,
      }),
    [],
  );

  return (
    <group position={[0, -0.26, 0]} scale={0.9}>
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.85, 48]} />
        <meshBasicMaterial color="#59d4ff" transparent opacity={0.08} />
      </mesh>

      <RoundedBox
        args={[4.75, 0.68, 1.9]}
        radius={0.16}
        smoothness={5}
        position={[0, 0.78, 0]}
        material={shellMaterial}
      />

      <RoundedBox
        args={[2.08, 0.6, 1.42]}
        radius={0.18}
        smoothness={5}
        position={[0.15, 1.22, 0]}
        material={glassMaterial}
      />

      <RoundedBox
        args={[1.1, 0.3, 1.82]}
        radius={0.12}
        smoothness={5}
        position={[-1.62, 0.62, 0]}
        material={shadowMaterial}
      />

      <RoundedBox
        args={[1.1, 0.3, 1.82]}
        radius={0.12}
        smoothness={5}
        position={[1.62, 0.62, 0]}
        material={shadowMaterial}
      />

      {[
        [-1.52, 0.38, 1.02],
        [1.52, 0.38, 1.02],
        [-1.52, 0.38, -1.02],
        [1.52, 0.38, -1.02],
      ].map((position) => (
        <group key={position.join('-')} position={position}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.37, 0.37, 0.34, 32]} />
            <meshStandardMaterial color="#0a0d12" metalness={0.55} roughness={0.72} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.37, 0.06, 14, 40]} />
            <meshStandardMaterial color="#c3c9d2" metalness={1} roughness={0.22} />
          </mesh>
        </group>
      ))}

      <mesh position={[2.26, 0.88, 0]}>
        <boxGeometry args={[0.1, 0.08, 1.22]} />
        <meshBasicMaterial color="#6dd8ff" />
      </mesh>

      <mesh position={[-2.27, 0.88, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.28]} />
        <meshBasicMaterial color="#ff5050" />
      </mesh>
    </group>
  );
}

export default function CarModel() {
  const carAvailable = useAssetPresence(carModelUrl);

  if (!carAvailable) {
    return <FallbackCarModel />;
  }

  return (
    <Suspense fallback={<FallbackCarModel />}>
      <NormalizedCarModel />
    </Suspense>
  );
}

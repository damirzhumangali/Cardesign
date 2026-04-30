import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Html,
  PerspectiveCamera,
} from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MathUtils } from 'three';
import CarModel from './CarModel';

gsap.registerPlugin(ScrollTrigger);

const damp = (current, target, speed, delta) =>
  MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));

const mix = (start, end, value) => start + (end - start) * value;

function Loader() {
  return (
    <Html center>
      <div className="scene-loader">Loading GT4</div>
    </Html>
  );
}

function FinalDriveStage({ progressRef }) {
  const rigRef = useRef(null);
  const cameraRef = useRef(null);
  const haloRef = useRef(null);

  useFrame((state, delta) => {
    if (!rigRef.current || !cameraRef.current) {
      return;
    }

    const progress = MathUtils.clamp(progressRef.current ?? 0, 0, 1);
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;
    const compact = state.size.width < 900;

    const sweep = MathUtils.smoothstep(progress, 0.04, 0.72);
    const roof = MathUtils.smoothstep(progress, 0.72, 1);

    const startX = compact ? -4.2 : -5.8;
    const endX = compact ? 4.4 : 6.1;
    const carX = mix(startX, endX, sweep) + pointerX * 0.12;
    const carY = mix(compact ? -1.38 : -1.62, compact ? -1.42 : -1.68, sweep) + roof * 0.18;
    const carZ = mix(0.52, -0.14, sweep) - roof * 0.08;
    const carScale = mix(compact ? 2.15 : 2.45, compact ? 2.28 : 2.62, sweep) - roof * 0.08;
    const carRotX = mix(0.03 + pointerY * 0.02, 0.08, roof);
    const sideSweepRot = mix(-0.7, 0.7, sweep);
    const carRotY = mix(sideSweepRot, 0.14, roof) + pointerX * 0.05;
    const carRotZ = mix(0, 0.04, roof);

    rigRef.current.position.x = damp(rigRef.current.position.x, carX, 2.8, delta);
    rigRef.current.position.y = damp(rigRef.current.position.y, carY, 2.8, delta);
    rigRef.current.position.z = damp(rigRef.current.position.z, carZ, 2.8, delta);
    rigRef.current.rotation.x = damp(rigRef.current.rotation.x, carRotX, 2.8, delta);
    rigRef.current.rotation.y = damp(rigRef.current.rotation.y, carRotY, 2.8, delta);
    rigRef.current.rotation.z = damp(rigRef.current.rotation.z, carRotZ, 2.8, delta);
    rigRef.current.scale.x = damp(rigRef.current.scale.x, carScale, 2.8, delta);
    rigRef.current.scale.y = damp(rigRef.current.scale.y, carScale, 2.8, delta);
    rigRef.current.scale.z = damp(rigRef.current.scale.z, carScale, 2.8, delta);

    const cameraX = mix(compact ? -0.36 : -0.58, compact ? 0.42 : 0.68, sweep) + pointerX * 0.08;
    const cameraY = mix(compact ? 1.08 : 1.18, compact ? 1.18 : 1.28, sweep) + roof * (compact ? 2.2 : 2.8);
    const cameraZ = mix(compact ? 13.8 : 15.2, compact ? 12.8 : 14, sweep) - roof * (compact ? 2.1 : 2.6);

    cameraRef.current.position.x = damp(cameraRef.current.position.x, cameraX, 2.4, delta);
    cameraRef.current.position.y = damp(cameraRef.current.position.y, cameraY, 2.4, delta);
    cameraRef.current.position.z = damp(cameraRef.current.position.z, cameraZ, 2.4, delta);
    cameraRef.current.lookAt(
      mix(compact ? -0.12 : -0.18, compact ? 0.1 : 0.14, sweep),
      mix(0.32, 0.56, roof),
      mix(0.08, -0.04, roof),
    );

    if (haloRef.current) {
      const haloScale = mix(1.16, 1.34, sweep) + roof * 0.18;
      haloRef.current.scale.x = damp(haloRef.current.scale.x, haloScale, 2.4, delta);
      haloRef.current.scale.y = damp(haloRef.current.scale.y, haloScale, 2.4, delta);
      haloRef.current.material.opacity = damp(
        haloRef.current.material.opacity,
        mix(0.12, 0.18, sweep) + roof * 0.04,
        2.4,
        delta,
      );
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[-0.58, 1.18, 15.2]} fov={18} />

      <fog attach="fog" args={['#05070b', 12, 48]} />

      <ambientLight intensity={0.9} color="#aebfd8" />
      <spotLight
        angle={0.42}
        color="#f4fbff"
        intensity={20}
        penumbra={0.8}
        position={[4.4, 4.8, 5.4]}
      />
      <pointLight color="#59d4ff" intensity={9} position={[-4.6, 2.9, -4.6]} />
      <pointLight color="#ff6a5f" intensity={5.6} position={[2.4, 1.4, -5.6]} />

      <mesh ref={haloRef} position={[0.12, 0.96, -6.8]}>
        <circleGeometry args={[8.8, 64]} />
        <meshBasicMaterial color="#58d6ff" transparent opacity={0.12} />
      </mesh>

      <group ref={rigRef} position={[-5.8, -1.62, 0.52]} scale={2.45}>
        <CarModel />
      </group>

      <ContactShadows
        blur={3.2}
        color="#000000"
        far={22}
        height={22}
        opacity={0.52}
        position={[0, -2.15, 0]}
        width={22}
      />

      <Environment preset="night" />
    </>
  );
}

export default function FinalDrive() {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const pixelRatio =
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: ({ progress }) => {
        progressRef.current = progress;
        section.style.setProperty('--drive-progress', progress.toFixed(4));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section className="section final-drive-section" id="drive" ref={sectionRef}>
      <div className="final-drive-sticky">
        <div className="final-drive-frame">
          <Canvas
            className="final-drive-canvas"
            dpr={pixelRatio}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
            }}
          >
            <Suspense fallback={<Loader />}>
              <FinalDriveStage progressRef={progressRef} />
            </Suspense>
          </Canvas>

          <div className="final-drive-backdrop" aria-hidden="true" />
          <div className="final-drive-vignette" aria-hidden="true" />

          <div className="final-drive-copy">
            <p className="section-tag">Final Machine / Mercedes AMG GT4</p>
            <h2 className="final-drive-title">Scroll Down And Let It Move</h2>
          </div>
        </div>
      </div>
    </section>
  );
}

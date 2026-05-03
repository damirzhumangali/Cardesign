import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTextRevealAnimations, createScrollNarrative, hideLoader, setLoaderProgress } from './scrollbar/showcaseAnimation';
import { loadShowcaseCars, updateShowcaseState } from './scrollbar/showcaseCarModel';
import { addShowroomLighting } from './scrollbar/showcaseLights';
import { createSceneApp, getResponsiveView, updateRendererSize } from './scrollbar/showcaseScene';
import './scrollbar/scrollbar-showcase.css';

gsap.registerPlugin(ScrollTrigger);

const showcaseSteps = [
  {
    kind: 'intro',
    eyebrow: 'Act I',
    title: 'Aventador SVJ',
    body:
      'The opening frame belongs to a sharp-edged silhouette, theatrical light, and a slow studio orbit.',
  },
  {
    eyebrow: 'Front Quarter',
    title: 'Aggression held in control.',
    body:
      'The camera stays planted on the nose first, then lets the surfaces catch the light as the body begins to turn.',
  },
  {
    eyebrow: 'Side Profile',
    title: 'Long lines. Tight cabin. Pure tension.',
    body:
      'From the side, the car reads like one continuous gesture under pressure, with every cut and intake working the silhouette.',
  },
  {
    eyebrow: 'Rear Drama',
    title: 'The first machine exits in shadow.',
    body:
      'By the time the rear comes through, the scene shifts from spectacle toward something more technical and deliberate.',
  },
  {
    kind: 'handoff',
    eyebrow: 'Handoff',
    title: 'One silhouette fades. Another takes the stage.',
    body:
      'Lamborghini eases out of the light while Mercedes-AMG GT3 arrives on the same axis with calmer, race-bred purpose.',
  },
  {
    kind: 'final',
    eyebrow: 'Act II',
    title: 'Mercedes-AMG GT3',
    body:
      'The final frame lands on motorsport stance, aero detail, and a disciplined presence that closes the sequence cleanly.',
  },
  {
    kind: 'detail',
    eyebrow: 'Track Stance',
    title: 'Lower, wider, more exact.',
    body:
      'Where the Lamborghini felt theatrical, the AMG reads as calibrated pressure: wheel arches loaded, body settled, every line engineered around grip and braking.',
  },
  {
    kind: 'detail',
    eyebrow: 'Aero Surface',
    title: 'Hardware first. Drama second.',
    body:
      'Splitter, vents, and rear architecture feel less like ornament and more like race hardware exposed under controlled studio light.',
  },
  {
    kind: 'outro',
    eyebrow: 'Final Hold',
    title: 'A proper second act, not just a swap.',
    body:
      'The page now closes with the Mercedes fully established, giving the ending the same visual weight and progression the Lamborghini gets at the start.',
  },
];

export default function ScrollbarShowcase() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const loaderRef = useRef(null);
  const loaderProgressRef = useRef(null);
  const loaderValueRef = useRef(null);
  const progressIndicatorRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const loader = loaderRef.current;
    const loaderProgress = loaderProgressRef.current;
    const loaderValue = loaderValueRef.current;
    const progressIndicator = progressIndicatorRef.current;
    const appShell = root?.closest('.app-shell');

    if (!root || !canvas || !loader || !loaderProgress || !loaderValue) {
      return undefined;
    }

    let showcase = null;
    let frameId = 0;
    let viewState = getResponsiveView(window.innerWidth);
    let isDisposed = false;
    const orbitState = { angle: 0 };
    const transitionState = { blend: 0 };
    const cursor = { x: 0, y: 0 };
    const parallax = { x: 0, y: 0 };
    const clock = new THREE.Clock();
    const app = createSceneApp(canvas);
    const disposeLights = addShowroomLighting(app);

    const applyResponsiveView = (nextView) => {
      app.camera.fov = nextView.fov;
      app.camera.updateProjectionMatrix();
      app.carStage.scale.setScalar(nextView.stageScale);
      app.groundGlow.scale.setScalar(nextView.glowScale);
      app.floorRing.scale.setScalar(nextView.ringScale);
      app.shadowPlane.scale.setScalar(nextView.shadowScale);
    };

    const tick = () => {
      if (isDisposed) {
        return;
      }

      const elapsedTime = clock.getElapsedTime();
      const blend = transitionState.blend;

      app.carStage.position.y = Math.sin(elapsedTime * 1.05) * 0.035;
      app.carStage.rotation.z = Math.sin(elapsedTime * 0.42) * 0.012;

      parallax.x += (cursor.x * viewState.parallaxX - parallax.x) * 0.05;
      parallax.y += (-cursor.y * viewState.parallaxY - parallax.y) * 0.05;

      app.cameraRig.position.x = parallax.x;
      app.cameraRig.position.y = parallax.y;

      if (showcase) {
        updateShowcaseState(showcase, blend);
      }

      const radius = viewState.radius + blend * 0.28;
      const height = viewState.height + blend * 0.06;
      const targetY = viewState.targetY + blend * 0.05;

      const orbitX = Math.sin(orbitState.angle) * radius;
      const orbitZ = Math.cos(orbitState.angle) * radius;

      app.camera.position.set(orbitX, height, orbitZ);
      app.camera.lookAt(0, targetY, 0);
      app.renderer.render(app.scene, app.camera);

      frameId = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event) => {
      cursor.x = event.clientX / window.innerWidth - 0.5;
      cursor.y = event.clientY / window.innerHeight - 0.5;
    };

    const handleResize = () => {
      updateRendererSize(app);
      viewState = getResponsiveView(window.innerWidth);
      applyResponsiveView(viewState);
      ScrollTrigger.refresh();
    };

    const disposeScene = () => {
      disposeLights?.();

      app.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose?.();
        }

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            material?.dispose?.();
          });
        }
      });

      app.renderer.dispose();
    };

    const context = gsap.context(() => {
      createTextRevealAnimations(root);
      createScrollNarrative({
        triggerElement: root,
        orbitState,
        transitionState,
        progressElement: progressIndicator,
      });

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onEnter: () => appShell?.classList.add('scrollbar-showcase-active'),
        onEnterBack: () => appShell?.classList.add('scrollbar-showcase-active'),
        onLeave: () => appShell?.classList.remove('scrollbar-showcase-active'),
        onLeaveBack: () => appShell?.classList.remove('scrollbar-showcase-active'),
      });
    }, root);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize, { passive: true });

    applyResponsiveView(viewState);
    setLoaderProgress(loaderProgress, loaderValue, 0);
    tick();

    const initializeModel = async () => {
      const result = await loadShowcaseCars({
        parent: app.carStage,
        onProgress: (value) => {
          if (!isDisposed) {
            setLoaderProgress(loaderProgress, loaderValue, value);
          }
        },
      });

      if (isDisposed) {
        return;
      }

      showcase = result.showcase;
      updateShowcaseState(showcase, transitionState.blend);
      setLoaderProgress(loaderProgress, loaderValue, 1);
      hideLoader(loader);
      ScrollTrigger.refresh();

      if (result.usingFallback) {
        console.warn(
          'Loaded model was missing or too primitive for a premium showcase. A procedural concept car is being displayed instead.',
        );
      }
    };

    initializeModel();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      appShell?.classList.remove('scrollbar-showcase-active');
      context.revert();
      disposeScene();
    };
  }, []);

  return (
    <section
      className="section scrollbar-showcase"
      id="scrollbar-showcase"
      ref={rootRef}
      aria-label="Dual-car cinematic showcase"
    >
      <div className="scrollbar-showcase__viewport">
        <div className="scrollbar-showcase__loader" ref={loaderRef} role="status" aria-live="polite">
          <div className="scrollbar-showcase__loader-copy">
            <p className="scrollbar-showcase__loader-label">Preparing Dual Showcase</p>
            <h2>Loading Experience</h2>
          </div>
          <div className="scrollbar-showcase__loader-line" aria-hidden="true">
            <div
              className="scrollbar-showcase__loader-progress"
              ref={loaderProgressRef}
            />
          </div>
          <p className="scrollbar-showcase__loader-value" ref={loaderValueRef}>
            0%
          </p>
        </div>

        <div className="scrollbar-showcase__hud" aria-hidden="true">
          <p className="scrollbar-showcase__brand-mark">LAMBORGHINI / AMG</p>
          <p className="scrollbar-showcase__scroll-hint">Scroll to explore</p>
        </div>

        <div className="scrollbar-showcase__progress-indicator" aria-hidden="true">
          <span ref={progressIndicatorRef} />
        </div>

        <canvas
          className="scrollbar-showcase__canvas"
          ref={canvasRef}
          aria-hidden="true"
        />
      </div>

      <div className="scrollbar-showcase__story">
        {showcaseSteps.map((step, index) => {
          const headingTag = index === 0 ? 'h1' : 'h2';
          const Heading = headingTag;

          return (
            <section
              className={`scrollbar-showcase__step scrollbar-showcase__step--${step.kind ?? 'standard'}`}
              key={`${step.eyebrow}-${index}`}
            >
              <div className="scrollbar-showcase__step-card">
                <p className="scrollbar-showcase__eyebrow">{step.eyebrow}</p>
                <Heading className="scrollbar-showcase__title">{step.title}</Heading>
                <p className="scrollbar-showcase__body">{step.body}</p>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

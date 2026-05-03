import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import Hero from './components/Hero';
import ScrollCinematic from './components/ScrollCinematic';
import DesignSection from './components/DesignSection';
import Performance from './components/Performance';
import ScrollbarShowcase from './components/ScrollbarShowcase';
import StudioSection from './components/StudioSection';
import Gallery from './components/Gallery';
import { useLenis } from './hooks/useLenis';
import { useScrollProgress } from './hooks/useScrollProgress';

const sectionIds = [
  'hero',
  'cinematic',
  'design',
  'performance',
  'studio',
  'gallery',
];

export default function App() {
  useLenis();

  const scrollState = useScrollProgress(sectionIds);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const rootStyle = useMemo(
    () => ({
      '--scroll-progress': scrollState.global.toFixed(4),
    }),
    [scrollState.global],
  );

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return undefined;
    }

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    const moveGlowX = gsap.quickTo(cursor, 'x', {
      duration: 0.45,
      ease: 'power3.out',
    });
    const moveGlowY = gsap.quickTo(cursor, 'y', {
      duration: 0.45,
      ease: 'power3.out',
    });
    const moveDotX = gsap.quickTo(cursorDot, 'x', {
      duration: 0.18,
      ease: 'power2.out',
    });
    const moveDotY = gsap.quickTo(cursorDot, 'y', {
      duration: 0.18,
      ease: 'power2.out',
    });

    const handlePointerMove = (event) => {
      moveGlowX(event.clientX);
      moveGlowY(event.clientY);
      moveDotX(event.clientX);
      moveDotY(event.clientY);
      document.documentElement.style.setProperty(
        '--pointer-x',
        `${event.clientX}px`,
      );
      document.documentElement.style.setProperty(
        '--pointer-y',
        `${event.clientY}px`,
      );
    };

    const handlePointerLeave = () => {
      gsap.to([cursor, cursorDot], {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    };

    const handlePointerEnter = () => {
      gsap.to([cursor, cursorDot], {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerenter', handlePointerEnter);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerenter', handlePointerEnter);
    };
  }, []);

  return (
    <div className="app-shell" style={rootStyle}>
      <div className="grid-overlay" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      <div className="frame-lines" aria-hidden="true">
        <span className="frame-line frame-line-top" />
        <span className="frame-line frame-line-right" />
        <span className="frame-line frame-line-bottom" />
        <span className="frame-line frame-line-left" />
      </div>

      <div className="progress-rail" aria-hidden="true">
        <span
          className="progress-fill"
          style={{ transform: `scaleY(${scrollState.global})` }}
        />
      </div>

      <div className="technical-rail" aria-hidden="true">
        <span>SCROLL CONTROL</span>
        <span>ACTIVE AERO</span>
        <span>ELECTRIC DRIVE</span>
        <span>STUDIO MODE</span>
      </div>

      <header className="site-header">
        <a className="brand-mark" href="#hero">
          <span className="brand-mark-symbol">NOVA</span>
          <span className="brand-mark-copy">AERIS GT</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#design">Design</a>
          <a href="#performance">Performance</a>
          <a href="#studio">Studio</a>
        </nav>
      </header>

      <main className="site-shell">
        <Hero />
        <ScrollCinematic />
        <DesignSection />
        <Performance />
        <StudioSection />
        <Gallery />
        <ScrollbarShowcase />
      </main>

      <div className="cursor-glow" ref={cursorRef} aria-hidden="true" />
      <div className="cursor-dot" ref={cursorDotRef} aria-hidden="true" />
    </div>
  );
}

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  useEffect(() => {
    let lenis = null;
    let animationFrame = 0;
    let refreshTimeout = 0;

    try {
      lenis = new Lenis({
        duration: 1.2,
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
        syncTouch: true,
      });

      const raf = (time) => {
        lenis.raf(time);
        animationFrame = window.requestAnimationFrame(raf);
      };

      animationFrame = window.requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);

      refreshTimeout = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    } catch (error) {
      console.error('Lenis initialization failed', error);
    }

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);

    return () => {
      window.clearTimeout(refreshTimeout);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);

      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);
}

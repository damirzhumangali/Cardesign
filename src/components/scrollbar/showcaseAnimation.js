import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function createTextRevealAnimations(root) {
  const blocks = Array.from(
    root.querySelectorAll('.scrollbar-showcase__step-card'),
  );

  blocks.forEach((block, index) => {
    const section = block.closest('.scrollbar-showcase__step');

    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          end: 'bottom 28%',
          scrub: true,
        },
      })
      .fromTo(
        block,
        {
          autoAlpha: 0,
          y: 42,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
      )
      .to(block, {
        autoAlpha: 1,
        y: 0,
        duration: 0.3,
        ease: 'none',
      })
      .to(block, {
        autoAlpha: index === blocks.length - 1 ? 1 : 0,
        y: index === blocks.length - 1 ? 0 : -34,
        duration: 0.35,
        ease: 'power2.in',
      });
  });
}

export function createScrollNarrative({
  triggerElement,
  orbitState,
  transitionState,
  progressElement,
}) {
  const timeline = gsap.timeline({
    defaults: {
      ease: 'none',
    },
    scrollTrigger: {
      trigger: triggerElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.15,
      onUpdate: (self) => {
        if (progressElement) {
          progressElement.style.transform = `scaleY(${self.progress})`;
        }
      },
    },
  });

  timeline.to(orbitState, {
    angle: Math.PI * 0.25,
    duration: 1,
  });

  timeline.to(orbitState, {
    angle: Math.PI * 0.5,
    duration: 1,
  });

  timeline.to(orbitState, {
    angle: Math.PI * 0.75,
    duration: 1,
  });

  timeline.to(orbitState, {
    angle: Math.PI,
    duration: 1,
  });

  timeline.to(transitionState, {
    blend: 1,
    duration: 1,
  });

  timeline.to(
    orbitState,
    {
      angle: Math.PI * 1.1,
      duration: 1,
    },
    '<',
  );

  timeline.to(orbitState, {
    angle: Math.PI * 1.4,
    duration: 1,
  });

  timeline.to(orbitState, {
    angle: Math.PI * 1.7,
    duration: 1,
  });

  timeline.to(orbitState, {
    angle: Math.PI * 2,
    duration: 1,
  });

  return timeline;
}

export function setLoaderProgress(progressBar, label, value) {
  const clampedValue = gsap.utils.clamp(0, 1, value);

  progressBar.style.transform = `scaleX(${clampedValue})`;
  label.textContent = `${Math.round(clampedValue * 100)}%`;
}

export function hideLoader(loader) {
  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.9,
    ease: 'power2.out',
    onComplete: () => {
      loader.setAttribute('aria-hidden', 'true');
      loader.style.pointerEvents = 'none';
    },
  });
}

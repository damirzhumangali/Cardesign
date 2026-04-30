import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import MagneticButton from './MagneticButton';

const stats = [
  ['0-100 km/h', '3.2s'],
  ['Power', '680 HP'],
  ['Range', '720 km'],
  ['Aero Mode', 'Active'],
];

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .from('.hero-kicker', {
          y: 22,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 0.7,
        })
        .from(
          '.hero-title-line',
          {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            stagger: 0.12,
          },
          '-=0.2',
        )
        .from(
          '.hero-copy',
          {
            y: 28,
            opacity: 0,
            filter: 'blur(12px)',
            duration: 0.9,
          },
          '-=0.75',
        )
        .from(
          '.hero-actions > *',
          {
            y: 24,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
          },
          '-=0.55',
        )
        .from(
          '.hero-stat',
          {
            y: 22,
            opacity: 0,
            filter: 'blur(10px)',
            duration: 0.7,
            stagger: 0.08,
          },
          '-=0.55',
        )
        .from(
          '.hero-labels span, .hero-side-meta',
          {
            y: 14,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
          },
          '-=0.55',
        );
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="section hero-section" id="hero" ref={sectionRef}>
      <div className="hero-layout">
        <div className="hero-copy-wrap">
          <p className="hero-kicker">Electric performance concept / cinematic prototype</p>

          <h1 className="hero-title">
            <span className="hero-title-mask">
              <span className="hero-title-line">BEYOND</span>
            </span>
            <span className="hero-title-mask">
              <span className="hero-title-line hero-title-line-accent">MOTION</span>
            </span>
          </h1>

          <p className="hero-copy">
            A cinematic digital experience for the next generation of performance
            vehicles, shaped by silence, light, and torque.
          </p>

          <div className="hero-actions">
            <MagneticButton href="#cinematic">Play Scroll Film</MagneticButton>
            <MagneticButton href="#final" variant="ghost">
              Book Test Drive
            </MagneticButton>
          </div>

          <div className="hero-labels">
            <span>SCROLL-SYNCED OPENING REEL</span>
            <span>ADAPTIVE STUDIO LIGHTING</span>
            <span>LIVE AERO PROFILE</span>
          </div>
        </div>

        <aside className="hero-side-meta">
          <p className="hero-side-line">Hand-finished surfaces. Torque-vector precision.</p>
          <p className="hero-side-line">Built to feel fast before the wheel even turns.</p>
        </aside>
      </div>

      <div className="hero-stats">
        {stats.map(([label, value]) => (
          <div className="hero-stat" key={label}>
            <span className="hero-stat-label">{label}</span>
            <span className="hero-stat-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="scroll-indicator" aria-hidden="true">
        <span>Scroll</span>
        <span className="scroll-indicator-line" />
      </div>
    </section>
  );
}

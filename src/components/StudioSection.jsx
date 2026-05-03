import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const studioFeatures = [
  'Ambient cockpit',
  'AI-assisted interface',
  'Haptic controls',
  'Immersive sound',
];

export default function StudioSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.studio-copy > *', {
        opacity: 0,
        y: 70,
        filter: 'blur(16px)',
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.studio-card', {
        opacity: 0,
        y: 75,
        filter: 'blur(16px)',
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.studio-cards',
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="section studio-section" id="studio" ref={sectionRef}>
      <div className="section-shell studio-grid">
        <div className="studio-copy">
          <p className="section-tag">Scene 05 / Driver Studio</p>
          <h2 className="section-title">Designed Around the Driver</h2>
          <p className="section-body">
            Cabin architecture flows like a private studio set: layered light,
            low reflections, and every control placed within a calm, deliberate
            reach zone.
          </p>
          <p className="section-caption">
            The visual focus stays clean through this section, keeping the studio
            sequence calm, deliberate and free from an extra closing handoff.
          </p>
        </div>

        <div className="studio-panel">
          <div className="studio-cards">
            {studioFeatures.map((feature, index) => (
              <article className="studio-card" key={feature}>
                <span className="studio-card-index">0{index + 1}</span>
                <h3>{feature}</h3>
                <p>
                  {feature === 'Ambient cockpit' &&
                    'A wraparound halo of indirect light builds focus without visual noise.'}
                  {feature === 'AI-assisted interface' &&
                    'Predictive surfaces prioritize the next action before the driver asks.'}
                  {feature === 'Haptic controls' &&
                    'Physical feedback replaces guesswork with instant, tactile certainty.'}
                  {feature === 'Immersive sound' &&
                    'Acoustic tuning turns silence, voice and velocity into one continuous atmosphere.'}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const designFeatures = [
  {
    title: 'Aerodynamic body',
    copy: 'Air channels are carved directly into the silhouette to reduce lift and sustain a planted high-speed posture.',
  },
  {
    title: 'Carbon details',
    copy: 'Lightweight composite architecture sharpens transitions between edge, shadow and reflected studio light.',
  },
  {
    title: 'Adaptive lighting',
    copy: 'Pixel-driven headlamps and intelligent rear signatures react to speed, steering angle and environment.',
  },
  {
    title: 'Wide performance stance',
    copy: 'Long wheel placement and muscular track proportions project control from every angle of approach.',
  },
];

export default function DesignSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.design-copy > *', {
        opacity: 0,
        y: 80,
        filter: 'blur(16px)',
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('.design-card', {
        opacity: 0,
        y: 90,
        filter: 'blur(18px)',
        duration: 0.95,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.design-cards',
          start: 'top 78%',
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="section design-section" id="design" ref={sectionRef}>
      <div className="section-shell design-grid">
        <div className="design-copy">
          <p className="section-tag">Scene 03 / Exterior Language</p>
          <h2 className="section-title">Sculpted by Speed</h2>
          <p className="section-body">
            Every line is engineered to reduce resistance, amplify presence, and
            create a silhouette that feels alive even when standing still.
          </p>
          <p className="section-caption">
            The result is not a collection of parts, but a continuous flow from
            front splitter to rear diffuser, expressed with the confidence of a
            studio-built icon.
          </p>
        </div>

        <div className="design-cards">
          {designFeatures.map((feature, index) => (
            <article className="design-card" key={feature.title}>
              <span className="design-card-index">0{index + 1}</span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const performanceMetrics = [
  {
    value: 680,
    decimals: 0,
    unit: 'HP',
    label: 'Dual-motor output',
    copy: 'Instant torque delivery with predictive traction balancing.',
  },
  {
    value: 3.2,
    decimals: 1,
    unit: 'SEC',
    label: '0-100 km/h',
    copy: 'Launch control calibrated for repeatable, seamless acceleration.',
  },
  {
    value: 320,
    decimals: 0,
    unit: 'KM/H',
    label: 'Top speed',
    copy: 'Active aero and chassis logic maintain composure deep into triple digits.',
  },
  {
    value: 720,
    decimals: 0,
    unit: 'KM',
    label: 'Estimated range',
    copy: 'Long-distance efficiency without sacrificing emotional response.',
  },
];

export default function Performance() {
  const sectionRef = useRef(null);
  const counterRefs = useRef([]);

  useEffect(() => {
    const context = gsap.context(() => {
      counterRefs.current = counterRefs.current.filter(Boolean);

      gsap.from('.performance-copy > *', {
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

      gsap.from('.metric-card', {
        opacity: 0,
        y: 90,
        filter: 'blur(18px)',
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.performance-metrics',
          start: 'top 78%',
        },
      });

      const animations = counterRefs.current.map((node) => {
        const targetValue = Number(node.dataset.value);
        const decimals = Number(node.dataset.decimals);
        const state = { value: 0 };

        return gsap.to(state, {
          value: targetValue,
          duration: 2.2,
          ease: 'power2.out',
          paused: true,
          onUpdate: () => {
            node.textContent = state.value.toFixed(decimals);
          },
        });
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 68%',
        once: true,
        onEnter: () => animations.forEach((animation) => animation.play()),
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="section performance-section" id="performance" ref={sectionRef}>
      <div className="section-shell performance-grid">
        <div className="performance-copy">
          <p className="section-tag">Scene 04 / Technical Dashboard</p>
          <h2 className="section-title">Engineered for the Instant</h2>
          <p className="section-body">
            Numbers here do more than impress. They describe how the platform
            breathes under load, settles under braking and delivers control with
            near-silent violence.
          </p>
        </div>

        <div className="performance-metrics">
          {performanceMetrics.map((metric, index) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-value">
                <span
                  className="metric-number"
                  data-value={metric.value}
                  data-decimals={metric.decimals}
                  ref={(node) => {
                    counterRefs.current[index] = node;
                  }}
                >
                  0
                </span>
                <span className="metric-unit">{metric.unit}</span>
              </div>
              <span className="metric-label">{metric.label}</span>
              <p className="metric-copy">{metric.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

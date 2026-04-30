import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const galleryItems = [
  {
    label: 'Exterior',
    caption: 'Crisp surfacing wrapped around a low-slung electric chassis.',
    detail: 'Reflections sharpen the shoulder line and expose the active aero breaks.',
  },
  {
    label: 'Interior',
    caption: 'The cockpit acts like a lounge cut from carbon, glass and shadow.',
    detail: 'Warm highlights contrast with colder UI light for a balanced studio mood.',
  },
  {
    label: 'Lighting',
    caption: 'Dynamic signatures respond in real time to motion and intent.',
    detail: 'Pixel modules animate the car even when it stands still.',
  },
  {
    label: 'Performance',
    caption: 'Every cooling inlet and pressure release is integrated into the form.',
    detail: 'Beauty stays inseparable from function at speed.',
  },
  {
    label: 'Details',
    caption: 'Machined surfaces and hidden interfaces deliver a tailored finish.',
    detail: 'Closer inspection reveals the obsessive precision behind the whole experience.',
  },
];

export default function Gallery() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.gallery-intro > *', {
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

      const cards = gsap.utils.toArray('.gallery-card');
      gsap.from(cards, {
        opacity: 0,
        y: 90,
        filter: 'blur(18px)',
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.gallery-track',
          start: 'top 82%',
        },
      });

      if (window.matchMedia('(min-width: 960px)').matches) {
        const getDistance = () =>
          Math.max(trackRef.current.scrollWidth - sectionRef.current.clientWidth, 0);

        gsap.to(trackRef.current, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${getDistance() + window.innerHeight * 0.65}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="section gallery-section" id="gallery" ref={sectionRef}>
      <div className="gallery-track" ref={trackRef}>
        <div className="gallery-intro">
          <p className="section-tag">Scene 06 / Curated Views</p>
          <h2 className="section-title">Move Through the Machine</h2>
          <p className="section-body">
            A sequence of immersive frames built to showcase the character of the
            concept from surface, cockpit, light and engineering detail.
          </p>
        </div>

        {galleryItems.map((item, index) => (
          <article className={`gallery-card gallery-card-${index + 1}`} key={item.label}>
            <div className="gallery-card-sheen" />
            <span className="gallery-card-label">{item.label}</span>
            <h3>{item.caption}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from './MagneticButton';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from('.final-copy > *', {
        opacity: 0,
        y: 80,
        filter: 'blur(16px)',
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 76%',
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section className="section final-section" id="final" ref={sectionRef}>
      <div className="section-shell final-shell">
        <div className="final-copy">
          <p className="section-tag">Final Scene / Reservation</p>
          <h2 className="final-title">READY TO EXPERIENCE IT?</h2>
          <p className="section-body final-body">
            Configure your own specification, schedule a private viewing, or book a
            test drive session crafted around the way you like to feel a car.
          </p>

          <div className="hero-actions final-actions">
            <MagneticButton href="#hero">Configure Yours</MagneticButton>
            <MagneticButton href="#hero" variant="ghost">
              Book a Test Drive
            </MagneticButton>
          </div>
        </div>

        <footer className="site-footer">
          <span>NOVA AERIS GT / Concept Edition</span>
          <nav aria-label="Footer">
            <a href="#design">Design</a>
            <a href="#performance">Performance</a>
            <a href="#studio">Studio</a>
          </nav>
        </footer>
      </div>
    </section>
  );
}

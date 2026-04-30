import { useRef } from 'react';
import { gsap } from 'gsap';

export default function MagneticButton({
  href = '#',
  variant = 'primary',
  className = '',
  children,
}) {
  const buttonRef = useRef(null);
  const innerRef = useRef(null);

  const handleMove = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const button = buttonRef.current;
    const inner = innerRef.current;
    const bounds = button.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;

    gsap.to(button, {
      x: offsetX * 0.12,
      y: offsetY * 0.12,
      duration: 0.35,
      ease: 'power2.out',
    });
    gsap.to(inner, {
      x: offsetX * 0.18,
      y: offsetY * 0.18,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const reset = () => {
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
    });
    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
    });
  };

  return (
    <a
      className={`magnetic-button magnetic-button-${variant} ${className}`.trim()}
      href={href}
      ref={buttonRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      <span ref={innerRef}>{children}</span>
    </a>
  );
}

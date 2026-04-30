import { useEffect, useMemo, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function useScrollProgress(sectionIds = []) {
  const initialSections = useMemo(
    () => Object.fromEntries(sectionIds.map((id) => [id, 0])),
    [sectionIds],
  );
  const [scrollState, setScrollState] = useState({
    global: 0,
    sections: initialSections,
  });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY || window.pageYOffset;
      const maxScroll =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;

      const sections = sectionIds.reduce((accumulator, id) => {
        const element = document.getElementById(id);

        if (!element) {
          accumulator[id] = 0;
          return accumulator;
        }

        const sectionStart = element.offsetTop - viewportHeight * 0.65;
        const sectionEnd =
          element.offsetTop + element.offsetHeight - viewportHeight * 0.35;

        accumulator[id] = clamp(
          (scrollTop - sectionStart) / Math.max(sectionEnd - sectionStart, 1),
          0,
          1,
        );

        return accumulator;
      }, {});

      setScrollState({
        global: clamp(scrollTop / Math.max(maxScroll, 1), 0, 1),
        sections,
      });
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [sectionIds]);

  return scrollState;
}

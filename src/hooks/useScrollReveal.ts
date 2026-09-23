import { useEffect, useRef, useState } from 'react';

/**
 * Drives the `.fade-up` / `.is-visible` CSS pair (src/index.css) for a
 * subtle once-per-section reveal as it scrolls into view. Starts `true`
 * (visible) so content already on-screen at load never flashes hidden;
 * the CSS itself skips the animation entirely under prefers-reduced-motion.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      // Fires as soon as the section is within 200px of the viewport (not only
      // once mostly on-screen) -- more forgiving of fast scrolls/short sections,
      // and avoids a visible "pop-in" right at the viewport edge.
      { threshold: 0, rootMargin: '0px 0px 200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

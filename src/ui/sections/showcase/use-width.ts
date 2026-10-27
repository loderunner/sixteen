import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

/**
 * The rendered width of an element, kept current as it resizes, so an SVG can
 * draw in real pixels: text and marks keep their sizes at any width.
 *
 * @param fallback - Width to assume before the first measure.
 */
export function useWidth<T extends Element>(
  fallback: number,
): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const observer = new ResizeObserver((entries) => {
      for (const { contentRect } of entries) {
        if (contentRect.width > 0) {
          setWidth(contentRect.width);
        }
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  return [ref, width];
}

import { useState, useEffect, useCallback } from "react";

/**
 * Returns a scale factor (capped at 1) so that a rectangle of
 * baseWidth × baseHeight fits within the current viewport minus padding.
 *
 * The game's internal coordinate system stays fixed (e.g. 600×800);
 * the CSS `transform: scale()` that consumes this value shrinks
 * the visual rendering without touching game logic.
 */
export function useViewportScale(
  baseWidth: number,
  baseHeight: number,
  padding = 32,
): number {
  const calculate = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sx = (vw - padding) / baseWidth;
    const sy = (vh - padding) / baseHeight;
    return Math.min(sx, sy, 1);
  }, [baseWidth, baseHeight, padding]);

  const [scale, setScale] = useState(calculate);

  useEffect(() => {
    const update = () => setScale(calculate());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [calculate]);

  return scale;
}

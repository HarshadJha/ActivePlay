export function smoothLandmarks(prev, next, alpha = 0.6) {
  if (!next || !Array.isArray(next)) return prev || null;
  if (!prev || !Array.isArray(prev) || prev.length !== next.length) {
    return next;
  }
  // Exponential moving average per coordinate
  return next.map((n, i) => {
    const p = prev[i];
    return {
      x: p.x * alpha + n.x * (1 - alpha),
      y: p.y * alpha + n.y * (1 - alpha),
      z: (p.z ?? 0) * alpha + (n.z ?? 0) * (1 - alpha),
      visibility: (p.visibility ?? 1) * alpha + (n.visibility ?? 1) * (1 - alpha),
    };
  });
}

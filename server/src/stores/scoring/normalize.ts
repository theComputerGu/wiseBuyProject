export function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeScore(
  rawScore: number,
  midpoint: number,
  scale = 8,
): number {
  // Sigmoid → ערך בין 0 ל־1
  const s =
    1 / (1 + Math.exp(-(rawScore - midpoint) / scale));

  // מתיחה ל־1..100
  return clamp(Math.round(s * 100), 1, 100);
}

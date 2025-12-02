export const mapRange = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => outMin + ((x - inMin) * (outMax - outMin)) / (inMax - inMin);
// src/modules/bmi.js
export function calculateBMI(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);

  if (!h || !w) return NaN;

  const heightM = h / 100;
  return w / (heightM * heightM);
}

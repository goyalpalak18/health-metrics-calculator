// src/modules/bmr.js
// Mifflin-St Jeor equation for BMR

export function calculateBMR({ weightKg, heightCm, age, gender }) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  const a = Number(age);
  if (!w || !h || !a || !gender) return null;
  // Mifflin-St Jeor: men +5, women -161
  const sex = (gender === 'male') ? 5 : -161;
  const bmr = 10 * w + 6.25 * h - 5 * a + sex;
  return Number.isFinite(bmr) ? Math.round(bmr) : null;
}
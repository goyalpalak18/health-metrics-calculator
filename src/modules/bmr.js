// src/modules/bmr.js
export function calculateBMR(heightCm, weightKg, ageYears, gender) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  const age = Number(ageYears);
  const g = (gender || '').toLowerCase();

  if (!h || !w || !age || (g !== 'male' && g !== 'female')) {
    return NaN;
  }

  // Mifflin–St Jeor
  if (g === 'male') {
    return 10 * w + 6.25 * h - 5 * age + 5;
  } else {
    return 10 * w + 6.25 * h - 5 * age - 161;
  }
}
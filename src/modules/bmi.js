// src/modules/bmi.js
// simple BMI functions

export function calculateBMI(weightKg, heightCm) {
  const h = Number(heightCm) / 100;
  const w = Number(weightKg);
  if (!w || !h) return null;
  const bmi = w / (h * h);
  return Number.isFinite(bmi) ? bmi : null;
}

export function getBMICategory(bmi) {
  if (bmi === null) return null;
  if (bmi < 18.5) return { label: 'Underweight', level: 'warning' };
  if (bmi < 25) return { label: 'Normal', level: 'good' };
  if (bmi < 30) return { label: 'Overweight', level: 'warning' };
  return { label: 'Obese', level: 'bad' };
}


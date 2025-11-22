// src/modules/riskBands.js
// Map BMI to a band class and short advice text

export function getRiskBand(bmi) {
  if (bmi === null) return null;

  if (bmi < 18.5) {
    return { className: 'band-warning', advice: 'Underweight — consider a balanced diet.' };
  }
  if (bmi < 25) {
    return { className: 'band-good', advice: 'Normal — keep up the good habits.' };
  }
  if (bmi < 30) {
    return { className: 'band-warning', advice: 'Overweight — moderate diet and activity recommended.' };
  }
  return { className: 'band-bad', advice: 'Obese — please consult a health professional.' };
}
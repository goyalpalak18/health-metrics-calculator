// src/modules/riskBands.js
export function getRiskBand(bmi) {
  const value = Number(bmi);
  if (!isFinite(value)) return null;

  if (value < 18.5) {
    return {
      label: 'Underweight',
      category: 'underweight',
      advice: 'Below healthy range'
    };
  }
  if (value < 25) {
    return {
      label: 'Normal',
      category: 'normal',
      advice: 'Healthy range'
    };
  }
  if (value < 30) {
    return {
      label: 'Overweight',
      category: 'overweight',
      advice: 'Above healthy range'
    };
  }

  return {
    label: 'Obese',
    category: 'obese',
    advice: 'High health risk'
  };
}
// ...existing code...
/* app.js — split BMI and BMR calculators; keep storage + debounce */

import { calculateBMI } from './modules/bmi.js';
import { calculateBMR } from './modules/bmr.js';
import { getRiskBand } from './modules/riskBands.js';
import * as storage from './modules/storage.js';

function debounce(fn, wait = 250) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* -- BMI logic -- */
function readBMIForm() {
  const height = parseFloat(document.getElementById('bmi-height').value) || 0;
  const weight = parseFloat(document.getElementById('bmi-weight').value) || 0;
  return { height, weight };
}

function renderBMI({ bmi, band }) {
  const wrapper = document.getElementById('bmi-results');
  const bmiVal = document.getElementById('bmiValue');
  const bmiRisk = document.getElementById('bmiRisk');
  if (!wrapper || !bmiVal || !bmiRisk) return;
  bmiVal.textContent = bmi ? bmi : '-';
  bmiRisk.textContent = band?.band ? `${band.band} — ${band.advice || ''}` : '-';
  wrapper.classList.remove('hidden');
}

/* -- BMR logic -- */
function readBMRForm() {
  const height = parseFloat(document.getElementById('bmr-height').value) || 0;
  const weight = parseFloat(document.getElementById('bmr-weight').value) || 0;
  const age = parseInt(document.getElementById('bmr-age').value, 10) || 0;
  const gender = document.getElementById('bmr-gender').value || '';
  return { height, weight, age, sex: gender };
}

function renderBMR({ bmr }) {
  const wrapper = document.getElementById('bmr-results');
  const bmrVal = document.getElementById('bmrValue');
  if (!wrapper || !bmrVal) return;
  bmrVal.textContent = bmr ? bmr : '-';
  wrapper.classList.remove('hidden');
}

/* -- Handlers -- */
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  const data = storage.getAllRecords ? storage.getAllRecords() : storage.getHistory?.() || [];

  list.innerHTML = '';

  if (!data.length) {
    list.innerHTML = '<li>No history available.</li>';
    return;
  }

  data.forEach(item => {
    const li = document.createElement('li');
    if (item.type === 'bmi') {
      li.textContent = `BMI: ${item.bmi.toFixed(1)} (H: ${item.height}cm, W: ${item.weight}kg)`;
    } else if (item.type === 'bmr') {
      li.textContent = `BMR: ${item.bmr} (H: ${item.height}cm, W: ${item.weight}kg, Age: ${item.age}, ${item.sex})`;
    }
    list.appendChild(li);
  });
}
const handleBMISubmit = (evt) => {
  evt.preventDefault();
  const { height, weight } = readBMIForm();
  const bmi = calculateBMI(height, weight);
  const band = getRiskBand(bmi);
  renderBMI({ bmi, band });
  renderHistory();

  // optional: save BMI history (non-destructive)
  try {
    storage.saveRecord({ type: 'bmi', height, weight, bmi, band, ts: Date.now() });
  } catch (e) { /* ignore storage errors */ }
};

const handleBMRSubmit = (evt) => {
  evt.preventDefault();
  const { height, weight, age, sex } = readBMRForm();
  const bmr = calculateBMR({ height, weight, age, sex });
  renderBMR({ bmr });
  renderHistory();

  // optional: save BMR history
  try {
    storage.saveRecord({ type: 'bmr', height, weight, age, sex, bmr, ts: Date.now() });
  } catch (e) { /* ignore storage errors */ }
};

/* live / debounced preview for BMI inputs (optional, keeps debounce) */
const handleBMILive = debounce(() => {
  const { height, weight } = readBMIForm();
  if (height && weight) {
    const bmi = calculateBMI(height, weight);
    const band = getRiskBand(bmi);
    renderBMI({ bmi, band });
  }
}, 300);

/* init */
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  const bmiForm = document.getElementById('bmiForm');
  const bmrForm = document.getElementById('bmrForm');

  if (bmiForm) {
    bmiForm.addEventListener('submit', handleBMISubmit);
    // live inputs
    ['input', 'change'].forEach(e => {
      bmiForm.addEventListener(e, handleBMILive);
    });
  }

  if (bmrForm) {
    bmrForm.addEventListener('submit', handleBMRSubmit);
    // optional: simple live compute for BMR when all fields filled
    const bmrLive = debounce(() => {
      const { height, weight, age, sex } = readBMRForm();
      if (height && weight && age && sex) {
        const bmr = calculateBMR({ height, weight, age, sex });
        renderBMR({ bmr });
      }
    }, 400);
    ['input', 'change'].forEach(e => {
      bmrForm.addEventListener(e, bmrLive);
    });
  }
});
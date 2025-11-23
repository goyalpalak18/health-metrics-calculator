// src/app.js
import { calculateBMI, getBMICategory } from './modules/bmi.js';
import { calculateBMR } from './modules/bmr.js';
import { getRiskBand } from './modules/riskBands.js';
import { saveEntry, getHistory, undoLast } from './modules/storage.js';

// DOM references (must match your HTML ids)
const form = document.getElementById('healthForm');
const heightEl = document.getElementById('height');
const weightEl = document.getElementById('weight');
const ageEl = document.getElementById('age');
const genderEl = document.getElementById('gender');

const resultsBox = document.getElementById('results');
const bmiEl = document.getElementById('bmiResult');
const bmrEl = document.getElementById('bmrResult');
const riskEl = document.getElementById('riskBand');

// history list id — if not present, the script will create one
let historyList = document.getElementById('history-list');

function ensureHistoryContainer() {
  if (historyList) return;
  const sec = document.createElement('section');
  sec.className = 'history';
  sec.innerHTML = '<h3>History</h3><ul id="history-list"></ul>';
  const calc = document.getElementById('calculator') || document.querySelector('.calculator');
  if (calc) calc.appendChild(sec);
  historyList = document.getElementById('history-list');
}

// render results to UI
function renderResults(bmi, bmr, band) {
  if (!resultsBox) return;
  if (bmi === null) {
    resultsBox.classList.add('hidden');
    return;
  }
  resultsBox.classList.remove('hidden');

  bmiEl.textContent = bmi ? bmi.toFixed(1) : '—';
  bmrEl.textContent = bmr ? bmr : '—';
  riskEl.textContent = band ? band.advice : '—';

  // add color class to results box for visual band (optional)
  resultsBox.classList.remove('band-good','band-warning','band-bad');
  if (band && band.className) resultsBox.classList.add(band.className);
}

// render saved history
function renderHistory() {
  ensureHistoryContainer();
  const items = getHistory();
  historyList.innerHTML = '';
  if (!items || !items.length) {
    historyList.innerHTML = '<li>No previous calculations</li>';
    return;
  }
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = `${item.date} — BMI ${item.bmi.toFixed(1)}, BMR ${item.bmr || '—'}`;
    historyList.appendChild(li);
  }
}

// read inputs (basic)
function readInputs() {
  const height = Number(heightEl.value);
  const weight = Number(weightEl.value);
  const age = Number(ageEl.value);
  const gender = genderEl.value;
  if (!height || !weight) return null;
  return { height, weight, age: age || null, gender };
}

// main compute + render + save
function computeAndRender() {
  const values = readInputs();
  if (!values) {
    renderResults(null, null, null);
    return;
  }
  const bmi = calculateBMI(values.weight, values.height);
  const bmr = (values.age && values.gender) ? calculateBMR({ weightKg: values.weight, heightCm: values.height, age: values.age, gender: values.gender }) : null;
  const band = getRiskBand(bmi);

  renderResults(bmi, bmr, band);

  const entry = {
    date: new Date().toLocaleString(),
    height: values.height,
    weight: values.weight,
    age: values.age,
    gender: values.gender,
    bmi,
    bmr
  };
  saveEntry(entry);
  renderHistory();
}

// debounce helper to avoid too-frequent updates while typing
function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const debouncedCompute = debounce(computeAndRender, 300);

// events wiring
if (form) {
  form.addEventListener('input', (e) => {
    // update when the form fields change
    if (['height','weight','age','gender'].includes(e.target.id)) debouncedCompute();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    computeAndRender();
  });
}

// undo button (if you want to add an undo button with id="undo-btn")
document.addEventListener('click', (e) => {
  if (!e.target) return;
  if (e.target.id === 'undo-btn') {
    undoLast();
    renderHistory();
    const last = getHistory()[0];
    if (last) renderResults(last.bmi, last.bmr, getRiskBand(last.bmi));
    else renderResults(null, null, null);
  }
});

// init
renderHistory();
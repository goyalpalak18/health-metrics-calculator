// src/app.js

import { calculateBMI, getBMICategory } from './modules/bmi.js';
import { calculateBMR } from './modules/bmr.js';
import { getRiskBand } from './modules/riskBands.js';
import { saveEntry, getHistory, undoLast } from './modules/storage.js';

// basic form + input refs
const form = document.getElementById('healthForm');
const heightEl = document.getElementById('height');
const weightEl = document.getElementById('weight');
const ageEl = document.getElementById('age');
const genderEl = document.getElementById('gender');

// result box + spans
const resultsBox = document.getElementById('results');
const bmiEl = document.getElementById('bmiResult');
const bmrEl = document.getElementById('bmrResult');
const riskEl = document.getElementById('riskBand');

// history container (added later if missing)
let historyList = document.getElementById('history-list');

// make sure history section exists
function ensureHistoryContainer() {
  if (historyList) return;
  const sec = document.createElement('section');
  sec.className = 'history';
  sec.innerHTML = '<h3>History</h3><ul id="history-list"></ul>';
  const calc = document.getElementById('calculator') || document.querySelector('.calculator');
  if (calc) calc.appendChild(sec);
  historyList = document.getElementById('history-list');
}

// show results in UI
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

  // risk band color
  resultsBox.classList.remove('band-good','band-warning','band-bad');
  if (band && band.className) resultsBox.classList.add(band.className);
}

// load + show saved history
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

// read inputs from form
function readInputs() {
  const height = Number(heightEl.value);
  const weight = Number(weightEl.value);
  const age = Number(ageEl.value);
  const gender = genderEl.value;

  if (!height || !weight) return null;

  return { height, weight, age: age || null, gender };
}

// calculate + update UI + save history
function computeAndRender() {
  const values = readInputs();

  if (!values) {
    renderResults(null, null, null);
    return;
  }

  const bmi = calculateBMI(values.weight, values.height);
  const bmr = (values.age && values.gender)
    ? calculateBMR({ weightKg: values.weight, heightCm: values.height, age: values.age, gender: values.gender })
    : null;

  const band = getRiskBand(bmi);

  renderResults(bmi, bmr, band);

  // prepare saved entry
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

// debounce so results don’t spam while typing
function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const debouncedCompute = debounce(computeAndRender, 300);

// handle form events
if (form) {
  form.addEventListener('input', (e) => {
    if (['height','weight','age','gender'].includes(e.target.id)) debouncedCompute();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    computeAndRender();
  });
}

// undo last history item (if button exists)
document.addEventListener('click', (e) => {
  if (!e.target) return;

  if (e.target.id === 'undo-btn') {
    undoLast();
    renderHistory();
    const last = getHistory()[0];

    if (last) {
      renderResults(last.bmi, last.bmr, getRiskBand(last.bmi));
    } else {
      renderResults(null, null, null);
    }
  }
});

// initial load
renderHistory();
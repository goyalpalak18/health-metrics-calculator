// src/app.js
import { calculateBMI } from './src/modules/bmi.js';
import { calculateBMR } from './src/modules/bmr.js';
import { getRiskBand } from './src/modules/riskBands.js';

const byId = (id) => document.getElementById(id);

const els = {
  bmiForm: byId('bmiForm'),
  bmrForm: byId('bmrForm'),

  bmiHeight: byId('bmi-height'),
  bmiWeight: byId('bmi-weight'),
  bmiResults: byId('bmi-results'),
  bmiError: byId('bmi-error'),
  bmiOutput: byId('bmi-output'),
  bmiValue: byId('bmiValue'),
  bmiRisk: byId('bmi-risk-band'),

  bmrHeight: byId('bmr-height'),
  bmrWeight: byId('bmr-weight'),
  bmrAge: byId('bmr-age'),
  bmrGender: byId('bmr-gender'),
  bmrResults: byId('bmr-results'),
  bmrError: byId('bmr-error'),
  bmrOutput: byId('bmr-output'),
  bmrValue: byId('bmrValue'),

  historyBody: byId('history-body')
};

const HISTORY_KEY = 'health-metrics-history';
let history = [];

// helpers
const num = (el) => parseFloat(el.value);

const isValidNumber = (v) =>
  typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v);

function show(el, on = true) {
  if (!el) return;

  if (on) {
    el.classList.remove('hidden');   // show element
  } else {
    el.classList.add('hidden');      // hide element
  }
}

function text(el, t = '') {
  if (!el) return;
  el.textContent = t;
}

// Allowed input ranges
const RANGES = {
  heightMin: 30,
  heightMax: 272,
  weightMin: 1,
  weightMax: 200,
  ageMin: 0,
  ageMax: 120
};

function validateRanges(height, weight, age) {
  const errors = [];

  if (height !== undefined && height !== null) {
    if (!isValidNumber(height)) {
      errors.push('Height must be a number.');
    } else if (height < RANGES.heightMin || height > RANGES.heightMax) {
      errors.push(
        `Height should be between ${RANGES.heightMin} cm and ${RANGES.heightMax} cm.`
      );
    }
  }

  if (weight !== undefined && weight !== null) {
    if (!isValidNumber(weight)) {
      errors.push('Weight must be a number.');
    } else if (weight < RANGES.weightMin || weight > RANGES.weightMax) {
      errors.push(
        `Weight should be between ${RANGES.weightMin} kg and ${RANGES.weightMax} kg.`
      );
    }
  }

  if (age !== undefined && age !== null) {
    if (!isValidNumber(age)) {
      errors.push('Age must be a number.');
    } else if (age < RANGES.ageMin || age > RANGES.ageMax) {
      errors.push(
        `Age should be between ${RANGES.ageMin} and ${RANGES.ageMax} years.`
      );
    }
  }

  return errors;
}

// wire events
if (els.bmiForm) {
  els.bmiForm.addEventListener('submit', onBMISubmit);
}

if (els.bmrForm) {
  els.bmrForm.addEventListener('submit', onBMRSubmit);
}

// BMI handler
function onBMISubmit(event) {
  event.preventDefault();

  const h = num(els.bmiHeight);
  const w = num(els.bmiWeight);

  const errors = validateRanges(h, w, undefined);

  if (errors.length > 0) {
    showError(els.bmiError, errors.join(' '));
    show(els.bmiOutput, false);
    show(els.bmiResults, true);
    return;
  }

  const bmi = calculateBMI(h, w);

  if (!Number.isFinite(bmi)) {
    showError(els.bmiError, 'Unable to calculate BMI. Please check your values.');
    show(els.bmiOutput, false);
    show(els.bmiResults, true);
    return;
  }

  text(els.bmiValue, bmi.toFixed(1));
  updateRiskBand(getRiskBand(bmi));
  drawBMIChart(bmi);

  show(els.bmiError, false);
  show(els.bmiOutput, true);
  show(els.bmiResults, true);

  addHistory({
    type: 'BMI',
    time: now(),
    height: h.toFixed(1),
    weight: w.toFixed(1),
    bmi: Number(bmi.toFixed(1)),
    bmr: null
  });
}

// BMR handler
function onBMRSubmit(event) {
  event.preventDefault();

  const h = num(els.bmrHeight);
  const w = num(els.bmrWeight);
  const age = num(els.bmrAge);
  const gender = (els.bmrGender.value || '').toLowerCase();

  const errors = validateRanges(h, w, age);

  if (!gender) {
    errors.unshift('Please select a gender.');
  }

  if (errors.length > 0) {
    showError(els.bmrError, errors.join(' '));
    show(els.bmrOutput, false);
    show(els.bmrResults, true);
    return;
  }

  const bmr = calculateBMR(h, w, age, gender);

  if (!Number.isFinite(bmr)) {
    showError(els.bmrError, 'Unable to calculate BMR. Please check your values.');
    show(els.bmrOutput, false);
    show(els.bmrResults, true);
    return;
  }

  text(els.bmrValue, Math.round(bmr));

  show(els.bmrError, false);
  show(els.bmrOutput, true);
  show(els.bmrResults, true);

  addHistory({
    type: 'BMR',
    time: now(),
    height: h.toFixed(1),
    weight: w.toFixed(1),
    bmi: null,
    bmr: Math.round(bmr)
  });
}

// error + risk band
function showError(el, msg) {
  if (!el) return;
  text(el, msg);
  show(el, true);
}

function updateRiskBand(band) {
  if (!els.bmiRisk || !band) return;

  els.bmiRisk.className = 'risk-band';

  if (band.category) {
    els.bmiRisk.classList.add(band.category);
  }

  text(els.bmiRisk, `${band.label} – ${band.advice}`);
}

// canvas chart
function drawBMIChart(bmi) {
  const canvas = byId('bmiChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const maxBMI = 40;          // maximum BMI value for the chart
  canvas.width = 300;
  canvas.height = 40;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // REAL BMI RANGES (not equal segments)
  const ranges = [
    { label: 'Underweight', max: 18.5, color: '#60a5fa' }, // blue
    { label: 'Normal', max: 24.9, color: '#34d399' }, // green
    { label: 'Overweight', max: 29.9, color: '#fbbf24' }, // yellow
    { label: 'Obese', max: 40, color: '#f87171' }  // red
  ];

  let startX = 0;

  ranges.forEach((range) => {
    const endX = (range.max / maxBMI) * canvas.width;
    const width = endX - startX;

    ctx.fillStyle = range.color;
    ctx.fillRect(startX, 0, width, canvas.height);

    startX = endX;
  });

  // marker at the correct place in the bar
  if (bmi > 0) {
    const clampedBMI = Math.min(bmi, maxBMI);
    const markerX = (clampedBMI / maxBMI) * canvas.width;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(markerX - 1.5, 0, 3, canvas.height);
  }
}

/* ---------- HISTORY (localStorage + table) ---------- */

function now() {
  return new Date().toLocaleString();
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    history = raw ? JSON.parse(raw) : [];
  } catch (error) {
    history = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    // ignore storage errors
  }
}

function addHistory(entry) {
  history.unshift(entry);

  if (history.length > 10) {
    history.length = 10;
  }

  saveHistory();
  renderHistory();
}

function renderHistory() {
  if (!els.historyBody) return;

  els.historyBody.innerHTML = '';

  if (!history.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'history-empty';
    cell.textContent = 'No calculations yet.';
    row.appendChild(cell);
    els.historyBody.appendChild(row);
    return;
  }

  history.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.time}</td>
      <td>${item.type}</td>
      <td>${item.height}</td>
      <td>${item.weight}</td>
      <td>${item.bmi ?? '—'}</td>
      <td>${item.bmr ?? '—'}</td>
    `;
    els.historyBody.appendChild(row);
  });
}

loadHistory();
renderHistory();
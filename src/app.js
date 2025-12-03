// src/app.js
import { calculateBMI } from './modules/bmi.js';
import { calculateBMR } from './modules/bmr.js';
import { getRiskBand } from './modules/riskBands.js';

const $ = id => document.getElementById(id);

const els = {
  bmiForm: $('bmiForm'),
  bmrForm: $('bmrForm'),

  bmiHeight: $('bmi-height'),
  bmiWeight: $('bmi-weight'),
  bmiResults: $('bmi-results'),
  bmiError: $('bmi-error'),
  bmiOutput: $('bmi-output'),
  bmiValue: $('bmiValue'),
  bmiRisk: $('bmi-risk-band'),

  bmrHeight: $('bmr-height'),
  bmrWeight: $('bmr-weight'),
  bmrAge: $('bmr-age'),
  bmrGender: $('bmr-gender'),
  bmrResults: $('bmr-results'),
  bmrError: $('bmr-error'),
  bmrOutput: $('bmr-output'),
  bmrValue: $('bmrValue'),

  historyBody: $('history-body')
};

const HISTORY_KEY = 'health-metrics-history';
let history = [];

const num = el => parseFloat(el.value);
const isValid = v => typeof v === 'number' && v > 0 && Number.isFinite(v);
const show = (el, on = true) => el && el.classList[on ? 'remove' : 'add']('hidden');
const text = (el, t) => el && (el.textContent = t || '');

if (els.bmiForm) els.bmiForm.addEventListener('submit', onBMISubmit);
if (els.bmrForm) els.bmrForm.addEventListener('submit', onBMRSubmit);

function onBMISubmit(e) {
  e.preventDefault();

  const h = num(els.bmiHeight);
  const w = num(els.bmiWeight);

  if (!isValid(h) || !isValid(w)) {
    showError(els.bmiError, 'Please enter valid height and weight (greater than 0).');
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
  drawBMIChart(bmi); // draw the small colored BMI band

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

function onBMRSubmit(e) {
  e.preventDefault();

  const h = num(els.bmrHeight);
  const w = num(els.bmrWeight);
  const age = num(els.bmrAge);
  const gender = (els.bmrGender.value || '').toLowerCase();

  if (!isValid(h) || !isValid(w) || !isValid(age) || !gender) {
    showError(els.bmrError, 'Please enter valid values for all fields.');
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

function showError(el, msg) {
  if (!el) return;
  text(el, msg);
  show(el, true);
}

function updateRiskBand(band) {
  if (!els.bmiRisk || !band) return;
  els.bmiRisk.className = 'risk-band';
  if (band.category) els.bmiRisk.classList.add(band.category);
  text(els.bmiRisk, `${band.label} – ${band.advice}`);
}

function drawBMIChart(bmi) {
  const canvas = document.getElementById('bmiChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 40;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const segments = [
    { max: 18.5, color: '#60a5fa' },
    { max: 24.9, color: '#34d399' },
    { max: 29.9, color: '#fbbf24' },
    { max: 40,   color: '#f87171' }
  ];

  let x = 0;
  const segWidth = canvas.width / 4;

  segments.forEach(seg => {
    ctx.fillStyle = seg.color;
    ctx.fillRect(x, 0, segWidth, 40);
    x += segWidth;
  });

  if (bmi > 0) {
    const markerX = Math.min((bmi / 40) * canvas.width, canvas.width - 2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(markerX, 0, 3, 40);
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
  } catch {
    history = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

function addHistory(entry) {
  history.unshift(entry);
  if (history.length > 10) history.length = 10;
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

  history.forEach(item => {
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
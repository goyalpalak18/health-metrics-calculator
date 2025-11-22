// src/modules/storage.js
// simple localStorage history (max 10)

const KEY = 'hm_calc_history_v1';
const MAX = 10;

export function saveEntry(entry) {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry); // newest first
    if (list.length > MAX) list.splice(MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.warn('storage save error', e);
    return null;
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export function undoLast() {
  try {
    const list = getHistory();
    if (!list.length) return null;
    list.shift(); // remove most recent
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    return null;
  }
}
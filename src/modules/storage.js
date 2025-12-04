// storage helper
const KEY = 'health-history';
const LIMIT = 10;

export const getHistory = () =>
  JSON.parse(localStorage.getItem(KEY) || '[]');

export const saveHistory = list =>
  localStorage.setItem(KEY, JSON.stringify(list));

export function saveEntry(entry) {
  const list = getHistory();
  list.unshift(entry);
  if (list.length > LIMIT) list.length = LIMIT;
  saveHistory(list);
  return list;
}

export function undoLast() {
  const list = getHistory();
  list.shift();
  saveHistory(list);
  return list;
}
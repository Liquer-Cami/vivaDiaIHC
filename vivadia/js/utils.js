/* VivaDia — utilitários (namespace global VD, sem módulos para funcionar abrindo o arquivo direto) */
window.VD = window.VD || {};
window.VD.pages = window.VD.pages || {};

(function (VD) {
  const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseIso(s); d.setDate(d.getDate() + n); return iso(d); };
  const today = () => iso(new Date());
  const weekday = (s) => parseIso(s).getDay();
  const nowTime = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = (n) => { n = Math.max(0, Math.min(1439, n)); return `${pad(Math.floor(n / 60))}:${pad(n % 60)}`; };
  const addMinutes = (t, n) => fromMin(toMin(t) + n);
  const dayMonth = (s) => { const d = parseIso(s); return `${d.getDate()} de ${MONTHS[d.getMonth()]}`; };
  const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const mondayOf = (s) => { const w = weekday(s); return addDays(s, w === 0 ? -6 : 1 - w); };
  const period = (t) => { const m = toMin(t); return m < 720 ? 'morning' : m < 1080 ? 'afternoon' : 'night'; };

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Ícone Material Symbols. opts: {fill, size(rem), cls} */
  const ic = (name, opts = {}) =>
    `<span class="ms${opts.fill ? ' fill' : ''}${opts.cls ? ' ' + opts.cls : ''}" aria-hidden="true"${opts.size ? ` style="font-size:${opts.size}rem"` : ''}>${name}</span>`;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const vibrate = (p) => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p); } catch (e) {} };
  const initial = (name) => (name || '?').trim().charAt(0).toUpperCase();

  Object.assign(VD, { WEEKDAYS, WEEKDAYS_SHORT, MONTHS, pad, iso, parseIso, addDays, today, weekday, nowTime, toMin, fromMin, addMinutes, dayMonth, capital, mondayOf, period, esc, ic, $, $$, shuffle, initial, vibrate });
})(window.VD);

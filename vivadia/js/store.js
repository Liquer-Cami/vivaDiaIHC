/* VivaDia — estado da aplicação (mock). Persiste no localStorage do navegador. */
(function (VD) {
  const KEY = 'vivadia:v1';
  const DEFAULT_SETTINGS = { bigAlert: true, loudSound: true, notifyFamily: true, fontSize: 'large', caregiverId: 'c1' };
  const FONT_STEPS = ['standard', 'large', 'xlarge'];
  let state;
  const subs = [];

  /* ---------- seed ---------- */
  function applies(t, d) {
    if (t.date) return t.date === d;
    if (t.startDate && d < t.startDate) return false;
    if (t.days && !t.days.includes(VD.weekday(d))) return false;
    return true;
  }

  function seed() {
    const td = VD.today();
    const templates = VD.templatesSeed(td);
    const status = {};
    // histórico: últimos 7 dias já feitos (com uma falha de Vitamina D, para o histórico ficar real)
    for (let i = -7; i <= -1; i++) {
      const d = VD.addDays(td, i);
      templates.forEach((t) => {
        if (!applies(t, d)) return;
        if (t.id === 't7' && i === -2) return;
        status[`${t.id}@${d}`] = { status: 'done', doneAt: VD.addMinutes(t.time, 3 + ((i * 7 + 14) % 9)) };
      });
    }
    // hoje: tudo que já passou do horário "já foi feito" para a demonstração ficar viva
    const now = VD.nowTime();
    templates.forEach((t) => {
      if (applies(t, td) && VD.toMin(t.time) < VD.toMin(now) - 90 && t.category !== 'mind') {
        status[`${t.id}@${td}`] = { status: 'done', doneAt: VD.addMinutes(t.time, 4) };
      }
    });
    return {
      v: 1,
      templates,
      meds: JSON.parse(JSON.stringify(VD.MEDS)),
      status,
      settings: { ...DEFAULT_SETTINGS },
      activityLog: [],
      familyLog: [],
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return s; }
    } catch (e) { /* ignora: segue com dados novos */ }
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* navegação privada */ } }
  function commit() { save(); subs.forEach((fn) => fn()); }

  state = load();

  /* ---------- leitura ---------- */
  const S = {
    get state() { return state; },
    get settings() { return state.settings; },
    subscribe(fn) { subs.push(fn); },
    med: (id) => state.meds.find((m) => m.id === id),
    contact: (id) => VD.CONTACTS.find((c) => c.id === id),
    get caregiver() { return S.contact(state.settings.caregiverId) || VD.CONTACTS[0]; },
    template: (id) => state.templates.find((t) => t.id === id),

    /** Tarefas de um dia, já com o status e horário efetivo (adiamentos) */
    dayTasks(d) {
      return state.templates
        .filter((t) => applies(t, d))
        .map((t) => {
          const key = `${t.id}@${d}`;
          const st = state.status[key] || {};
          return { ...t, key, date: d, baseTime: t.time, time: st.time || t.time, status: st.status || 'pending', doneAt: st.doneAt, snoozeCount: st.snoozeCount || 0, reconfirmed: st.reconfirmed || 0 };
        })
        .sort((a, b) => VD.toMin(a.time) - VD.toMin(b.time));
    },
    task(key) { const [id, d] = key.split('@'); return S.dayTasks(d).find((t) => t.id === id) || null; },
    progress(d) { const l = S.dayTasks(d); return { total: l.length, done: l.filter((t) => t.status === 'done').length }; },
    /** próxima tarefa ainda não feita (a primeira pelo horário) */
    nextTask(d) { return S.dayTasks(d).find((t) => t.status !== 'done') || null; },
    history(templateId, days = 5) {
      const out = [];
      for (let i = 1; i <= days; i++) {
        const d = VD.addDays(VD.today(), -i);
        const t = state.templates.find((x) => x.id === templateId);
        if (!t || !applies(t, d)) continue;
        const st = state.status[`${templateId}@${d}`];
        out.push({ date: d, done: !!(st && st.status === 'done'), doneAt: st && st.doneAt });
      }
      return out;
    },

    /* ---------- escrita ---------- */
    complete(key) {
      const prev = state.status[key] || {};
      const t = S.task(key);
      if (prev.status !== 'done' && t && t.medId) { const m = S.med(t.medId); if (m) m.stock = Math.max(0, m.stock - 1); }
      state.status[key] = { ...prev, status: 'done', doneAt: VD.nowTime() };
      commit();
    },
    undo(key) {
      const prev = state.status[key] || {};
      const t = S.task(key);
      if (prev.status === 'done' && t && t.medId) { const m = S.med(t.medId); if (m) m.stock += 1; }
      delete state.status[key];
      commit();
    },
    snooze(key, minutes) {
      const t = S.task(key);
      if (!t) return null;
      const base = VD.toMin(t.time) > VD.toMin(VD.nowTime()) ? t.time : VD.nowTime();
      const newTime = VD.addMinutes(base, minutes);
      const prev = state.status[key] || {};
      state.status[key] = { ...prev, status: 'snoozed', time: newTime, snoozeCount: (prev.snoozeCount || 0) + 1 };
      commit();
      return newTime;
    },
    reconfirm(key) {
      const prev = state.status[key] || {};
      state.status[key] = { ...prev, reconfirmed: (prev.reconfirmed || 0) + 1 };
      commit();
    },
    addTemplate(t) { state.templates.push({ id: 't' + Date.now() + Math.floor(Math.random() * 99), custom: true, ...t }); commit(); },
    removeTemplate(id) {
      state.templates = state.templates.filter((t) => t.id !== id);
      Object.keys(state.status).forEach((k) => { if (k.startsWith(id + '@')) delete state.status[k]; });
      commit();
    },
    addMed({ name, dose, form, instruction, stock, times }) {
      const id = 'm' + Date.now();
      state.meds.push({ id, name, dose, form, instructions: instruction ? [instruction] : ['Tomar conforme a orientação médica.'], stock });
      times.forEach((time, i) => state.templates.push({ id: `t${Date.now()}${i}`, custom: true, time, category: 'med', medId: id, startDate: VD.today(), title: name, desc: `Tomar ${dose}.${instruction ? ' ' + instruction : ''}` }));
      commit();
      return id;
    },
    removeMed(medId) {
      state.templates.filter((t) => t.medId === medId).forEach((t) => {
        Object.keys(state.status).forEach((k) => { if (k.startsWith(t.id + '@')) delete state.status[k]; });
      });
      state.templates = state.templates.filter((t) => t.medId !== medId);
      state.meds = state.meds.filter((m) => m.id !== medId);
      commit();
    },
    setSettings(patch) { state.settings = { ...state.settings, ...patch }; commit(); },
    stepFont(dir) {
      const i = FONT_STEPS.indexOf(state.settings.fontSize);
      const n = Math.max(0, Math.min(FONT_STEPS.length - 1, i + dir));
      if (n !== i) S.setSettings({ fontSize: FONT_STEPS[n] });
      return FONT_STEPS[n];
    },
    logActivity(entry) { state.activityLog.push({ date: VD.today(), at: VD.nowTime(), ...entry }); commit(); },
    notifyFamily(reason) { state.familyLog.push({ date: VD.today(), at: VD.nowTime(), reason, to: S.caregiver.name }); commit(); },
    reset() { state = seed(); commit(); },
  };

  S.FONT_STEPS = FONT_STEPS;
  VD.store = S;
})(window.VD);

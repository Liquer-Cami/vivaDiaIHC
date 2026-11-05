/* VivaDia — componentes compartilhados: toast, diálogos, sheets, selos, som e voz */
(function (VD) {
  const { esc, ic, $ } = VD;

  /* ---------- Toast ---------- */
  function toast(msg, opts = {}) {
    let wrap = $('#toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; wrap.className = 'toast-wrap'; wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = `toast ${opts.kind || ''}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `${ic(opts.icon || 'check_circle', { fill: true })}<div class="grow"><div class="t-bold">${esc(msg)}</div>${opts.sub ? `<div class="t-md" style="opacity:.9">${esc(opts.sub)}</div>` : ''}</div>`;
    wrap.appendChild(el);
    VD.vibrate(40);
    const kill = () => { el.style.transition = 'opacity .25s'; el.style.opacity = 0; setTimeout(() => el.remove(), 260); };
    el.addEventListener('click', kill);
    setTimeout(kill, opts.ms || 3200);
  }

  /* ---------- Overlay / Sheet ---------- */
  function openOverlay(html, { onMount, dismissable = true } = {}) {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="modal">${html}</div>`;
    const close = () => { ov.remove(); document.body.style.overflow = ''; };
    if (dismissable) ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    ov.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
    if (onMount) onMount(ov, close);
    const first = ov.querySelector('[autofocus], .input, .btn');
    if (first && first.tagName === 'INPUT') {} else if (first) first.focus({ preventScroll: true });
    return { el: ov, close };
  }

  /** Diálogo de confirmação (Promise<boolean>) */
  function confirmDialog({ title, text, sub, yes = 'Sim', no = 'Cancelar', icon = 'help', danger = false }) {
    return new Promise((resolve) => {
      const h = `
        <div class="row">
          <div class="iconchip lg round" style="background:var(--accent-soft);color:var(--accent)">${ic(icon, { fill: true, size: 2 })}</div>
          <div><div class="t-small c-accent">Aviso importante</div><h3 class="t-h2">${esc(title)}</h3></div>
        </div>
        <div class="card tint flat stack-xs" style="padding:.9rem 1rem">
          <p class="t-h3">${esc(text)}</p>
          ${sub ? `<p class="t-md muted">${esc(sub)}</p>` : ''}
        </div>
        <div class="stack">
          <button class="btn lg ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${ic('check')}<span>${esc(yes)}</span></button>
          <button class="btn lg btn-soft" data-no>${ic('close')}<span>${esc(no)}</span></button>
        </div>`;
      let answered = false;
      const done = (v, close) => { if (answered) return; answered = true; close(); resolve(v); };
      const { el, close } = openOverlay(h, { dismissable: true });
      el.querySelector('[data-yes]').addEventListener('click', () => done(true, close));
      el.querySelector('[data-no]').addEventListener('click', () => done(false, close));
      el.addEventListener('mousedown', (e) => { if (e.target === el) done(false, close); });
    });
  }

  /* ---------- Selos de status (ícone + texto, nunca só cor) ---------- */
  function statusBadge(status, extra = {}) {
    const map = {
      done: ['done', 'check_circle', extra.label || 'Feita'],
      pending: ['pending', 'schedule', extra.label || 'Pendente'],
      snoozed: ['snoozed', 'snooze', extra.label || 'Adiada'],
      missed: ['missed', 'error', extra.label || 'Não marcada'],
    };
    const [cls, icon, label] = map[status] || map.pending;
    return `<span class="badge ${cls}">${ic(icon)}<span>${esc(label)}</span></span>`;
  }

  function catChip(category, size = '') {
    const c = VD.CATEGORIES[category] || VD.CATEGORIES.med;
    return `<div class="iconchip ${size} cat-${category}">${ic(c.icon, { fill: true })}</div>`;
  }

  function segments(done, total) {
    return `<div class="segments" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('')}</div>`;
  }

  /* ---------- Som (WebAudio) ---------- */
  let audioCtx = null;
  function beep(times = 1, loud = true) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      for (let i = 0; i < times; i++) {
        const t0 = audioCtx.currentTime + i * 0.34;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = i % 2 ? 880 : 1046;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(loud ? 0.5 : 0.18, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + 0.32);
      }
    } catch (e) { /* sem áudio disponível */ }
  }

  /* ---------- Voz ---------- */
  const speech = {
    supported: 'speechSynthesis' in window,
    speak(text, { onstart, onend } = {}) {
      if (!this.supported) return false;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR'; u.rate = 0.9;
      u.onstart = onstart || null; u.onend = onend || null; u.onerror = onend || null;
      window.speechSynthesis.speak(u);
      return true;
    },
    stop() { if (this.supported) window.speechSynthesis.cancel(); },
  };

  VD.ui = { toast, openOverlay, confirmDialog, statusBadge, catChip, segments, beep, speech };
})(window.VD);

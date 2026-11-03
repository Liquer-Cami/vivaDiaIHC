/* Tela: Lembrete "Hora do remédio" em tela cheia */
(function (VD) {
  const { ic, esc } = VD;
  const S = VD.store;

  VD.pages.lembrete = (key) => {
    const t = S.task(key);
    if (!t) return VD.pages.hoje();
    const m = t.medId ? S.med(t.medId) : null;
    const isMed = !!t.medId;
    const heading = isMed ? 'Hora do remédio' : t.category === 'food' ? 'Hora de comer' : t.category === 'exercise' ? 'Hora de se mexer' : t.category === 'mind' ? 'Hora de exercitar a mente' : 'Hora da atividade';
    const icon = VD.CATEGORIES[t.category].icon;
    const tip = isMed ? 'Tome com meio copo de água' : t.category === 'exercise' ? 'Use tênis confortável' : t.category === 'food' ? 'Coma com calma' : 'Sem pressa';
    const tipIcon = isMed ? 'water_drop' : t.category === 'exercise' ? 'footprint' : 'favorite';
    let timer = null;

    return {
      fullscreen: true,
      title: heading,
      html: `<main class="reminder" data-no-rerender>
        <div style="width:100%;display:flex;justify-content:flex-end"><div class="fontsize" role="group" aria-label="Ajustar tamanho do texto">
          <button data-act="fontMinus" aria-label="Diminuir letras">A-</button><button data-act="fontPlus" aria-label="Aumentar letras">A+</button></div></div>
        <div class="card stack" style="width:100%;align-items:center;padding:1.75rem 1.25rem">
          <div class="big-icon"><div class="core">${ic(icon, { fill: true })}</div></div>
          <p class="t-h3 muted upper">${heading}</p>
          <div class="clock">${t.time}</div>
          <div><h1 class="t-h2">${esc(t.title)}</h1><p class="t-lg muted" style="margin-top:.25rem">${m ? esc(m.dose) : esc(t.desc || '')}</p></div>
          <span class="pill-info" style="background:var(--teal-tint);color:var(--text);font-size:1.125rem;padding:.5rem 1.1rem">${ic(tipIcon, { fill: true, cls: 'c-teal' })}${tip}</span>
        </div>
        <div class="stack" style="width:100%">
          <button class="btn xl btn-primary" style="min-height:4.5rem;font-size:1.75rem;letter-spacing:.04em" data-act="remDone" data-key="${t.key}">${ic('check_circle', { fill: true, size: 2.25 })}<span>FEITO</span></button>
          <button class="btn lg btn-soft" data-act="remSnooze" data-key="${t.key}">${ic('alarm', { fill: true, size: 1.9, cls: 'c-accent' })}<span>ADIAR 10 min</span></button>
          <button class="btn-link" style="align-self:center" data-act="remFamily" data-key="${t.key}">${ic('support_agent')}<span>Avisar meu familiar</span></button>
          <button class="btn-link" style="align-self:center;font-size:1rem" data-act="remClose">Voltar para o aplicativo</button>
        </div>
      </main>`,
      mount() {
        if (S.settings.loudSound) { VD.ui.beep(3); timer = setInterval(() => VD.ui.beep(3), 6000); }
        VD.vibrate([300, 150, 300]);
      },
      cleanup() { clearInterval(timer); },
    };
  };

  const leave = (ms = 1400) => setTimeout(() => VD.go('/hoje'), ms);
  VD.on('remDone', (el) => {
    VD.act.done(el.dataset.key, { silent: true });
    VD.ui.toast('Muito bem! Dose confirmada.', { kind: 'ok', sub: 'Atividade marcada como feita.' });
    leave();
  });
  VD.on('remSnooze', (el) => { const t = VD.act.snooze(el.dataset.key, 10); leave(); });
  VD.on('remFamily', () => {
    const cg = S.caregiver; S.notifyFamily('Pediu ajuda no lembrete');
    VD.ui.toast('Mensagem enviada ao cuidador.', { icon: 'mark_chat_read', sub: `${cg.name} foi avisada.` });
  });
  VD.on('remClose', () => VD.go('/hoje'));
})(window.VD);

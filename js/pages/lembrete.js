/* Tela: Lembrete "Hora do medicamento" em tela cheia */
(function (VD) {
  const { ic, esc } = VD;
  const S = VD.store;

  VD.pages.lembrete = (rawKey) => {
    // "?teste" = pré-visualização vinda dos Ajustes: nada é marcado de verdade
    const isTest = /\?teste$/.test(rawKey);
    const key = rawKey.replace(/\?teste$/, '');
    const t = S.task(key);
    if (!t) return VD.pages.hoje();
    const m = t.medId ? S.med(t.medId) : null;
    const isMed = !!t.medId;
    const heading = isMed ? 'Hora do medicamento' : t.category === 'food' ? 'Hora de comer' : t.category === 'exercise' ? 'Hora de se mexer' : t.category === 'mind' ? 'Hora de exercitar a mente' : 'Hora da atividade';
    const icon = VD.CATEGORIES[t.category].icon;
    const tip = isMed ? ((S.med(t.medId) || {}).instructions || [])[0] || 'Siga a orientação do seu médico' : t.category === 'exercise' ? 'Use tênis confortável' : t.category === 'food' ? 'Coma com calma' : 'Sem pressa';
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
        ${isTest ? `<div class="note row start" role="status">${ic('science', { cls: 'c-accent' })}<span class="t-md"><b>Isto é só um teste.</b> Nada será marcado como feito.</span></div>` : ''}
        <div class="stack" style="width:100%">
          ${t.activityId && !isTest ? `<button class="btn xl btn-accent" data-act="playActivity" data-id="${esc(t.activityId)}">${ic('play_circle', { fill: true, size: 2 })}<span>JOGAR AGORA</span></button>` : ''}
          ${isTest ? `<button class="btn xl btn-primary" data-act="remCloseTest">${ic('arrow_back', { size: 2 })}<span>Voltar aos Ajustes</span></button>` : `
          <button class="btn xl btn-primary" style="min-height:4.5rem;font-size:1.75rem;letter-spacing:.04em" data-act="remDone" data-key="${t.key}">${ic('check_circle', { fill: true, size: 2.25 })}<span>${isMed ? 'JÁ TOMEI' : 'FEITO'}</span></button>
          <button class="btn lg btn-soft" data-act="remSnooze" data-key="${t.key}">${ic('alarm', { fill: true, size: 1.9, cls: 'c-accent' })}<span>ADIAR ${VD.SNOOZE_MIN} min</span></button>
          <button class="btn-link" style="align-self:center" data-act="remFamily" data-key="${t.key}">${ic('support_agent')}<span>Avisar meu familiar</span></button>
          <button class="btn-link" style="align-self:center;font-size:1rem" data-act="remClose">Voltar para o aplicativo</button>`}
        </div>
      </main>`,
      mount() {
        if (S.settings.loudSound) { VD.ui.beep(3); if (!isTest) timer = setInterval(() => VD.ui.beep(3), 1000); }
        VD.vibrate([300, 150, 300]);
      },
      cleanup() { clearInterval(timer); },
    };
  };

  const leave = (ms = 1400) => setTimeout(() => VD.go('/hoje'), ms);
  VD.on('remDone', async (el) => {
    const t = S.task(el.dataset.key);
    const ok = await VD.act.done(el.dataset.key, { silent: true });
    if (!ok) return;
    VD.ui.toast(t && t.medId ? 'Muito bem! Dose confirmada.' : 'Muito bem! Atividade feita.', { kind: 'ok', sub: t ? `${t.title} marcada como feita.` : '', action: { label: 'Desfazer', onClick: () => VD.act.undo(el.dataset.key) } });
    leave();
  });
  VD.on('remSnooze', (el) => { VD.act.snooze(el.dataset.key, VD.SNOOZE_MIN); leave(); });
  VD.on('remFamily', () => {
    const cg = S.caregiver; S.notifyFamily('Pediu ajuda no lembrete');
    VD.ui.toast('Mensagem enviada!', { icon: 'mark_chat_read', sub: `${cg.name.split(' ')[0]} recebeu o seu pedido de ajuda.` });
  });
  VD.on('remClose', () => VD.go('/hoje'));
  VD.on('remCloseTest', () => VD.go('/preferencias'));
})(window.VD);

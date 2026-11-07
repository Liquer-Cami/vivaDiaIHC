/* Tela: Como quer ser avisado? (preferências) */
(function (VD) {
  const { ic, esc, $ } = VD;
  const S = VD.store;

  const cur = () => S.settings;
  const toggle = (key, label) => `<button class="switch" role="switch" aria-checked="${cur()[key]}" aria-label="${label}" data-act="toggle" data-key="${key}"><span class="knob">${ic(cur()[key] ? 'check' : 'close')}</span></button>`;
  // texto do estado ao lado de cada chave (não depende só de cor/ícone)
  const STATE = {
    bigAlert: ['Ligado: o aviso ocupa a tela toda', 'Desligado: só aparece uma mensagem pequena'],
    loudSound: ['Ligado: o som toca até você responder', 'Desligado: sem som'],
    notifyFamily: ['Ligado: seu familiar é avisado', 'Desligado: ninguém é avisado'],
  };
  const FONT_LABELS = { standard: ['A', 'Padrão', '1.125rem'], large: ['A+', 'Grande', '1.375rem'], xlarge: ['A++', 'Extra', '1.625rem'] };
  const PREVIEW = { standard: '1.125rem', large: '1.375rem', xlarge: '1.625rem' };

  VD.pages.preferencias = () => {
    const cg = S.contact(cur().caregiverId);
    return {
      title: 'Preferências',
      back: true,
      html: `<div class="page" data-no-rerender id="prefs">
        <div class="stack-xs"><span class="pill-info" style="align-self:flex-start;color:var(--primary)">${ic('tune')}<span class="upper">Ajustes: avisos e letras</span></span>
          <h1 class="t-h1">Como quer ser avisado?</h1><p class="t-md muted">Personalize os alarmes e o tamanho do texto para ver e ouvir com facilidade. <b>Cada mudança é salva na hora.</b></p></div>

        <section class="stack"><div class="row c-teal">${ic('notifications_active')}<h2 class="t-h3" style="color:var(--text)">Tipos de Alerta</h2></div>
          <div class="card stack"><div class="row start pref-row"><div class="iconchip" style="background:var(--teal-fixed);color:var(--primary)">${ic('open_in_full', { fill: true, size: 1.75 })}</div>
            <div class="grow"><h3 class="t-h3">Aviso grande na tela</h3><p class="t-md muted">Mostra um aviso em tela cheia, com letras bem grandes, na hora de cada medicamento ou atividade.</p></div>${toggle('bigAlert', 'Aviso grande na tela')}</div>
            <div class="row between"><span class="t-small c-green" id="lbl-bigAlert"></span></div>
            <button class="btn btn-softteal" data-act="testReminder">${ic('visibility')}<span>Ver como é o aviso</span></button></div>

          <div class="card stack"><div class="row start pref-row"><div class="iconchip" style="background:var(--accent-soft);color:#341100">${ic('volume_up', { fill: true, size: 1.75 })}</div>
            <div class="grow"><h3 class="t-h3">Som forte e repetido</h3><p class="t-md muted">Toca um som alto e claro que repete até você responder ou adiar.</p></div>${toggle('loudSound', 'Som forte e repetido')}</div>
            <div class="row between"><span class="t-small c-green" id="lbl-loudSound"></span>
              <button class="btn sm btn-softteal" style="width:auto" data-act="testSound">${ic('play_circle')}<span>Ouvir teste</span></button></div></div>

          <div class="card stack"><div class="row start pref-row"><div class="iconchip" style="background:var(--container-high);color:var(--teal)">${ic('diversity_1', { fill: true, size: 1.75 })}</div>
            <div class="grow"><h3 class="t-h3">Avisar um familiar</h3><p class="t-md muted">Envia um aviso no WhatsApp do cuidador se um medicamento importante não for marcado a tempo.</p></div>${toggle('notifyFamily', 'Avisar um familiar')}</div>
            <span class="t-small" id="lbl-notifyFamily"></span>
            <div class="card tint flat stack-xs" style="padding:.8rem 1rem"><span class="t-small muted">Familiar responsável:</span>
              <div class="row between cg-row"><div class="row"><div class="contact-av" id="cgAv" style="width:3.25rem;height:3.25rem;font-size:1.3rem">${VD.initial(cg.name)}</div>
                <div><div class="t-bold" id="cgName">${esc(cg.name)}</div><div class="t-small c-teal" id="cgRole">${esc(cg.short)}</div><div class="t-small muted" id="cgPhone">${esc(cg.phone)}</div></div></div></div></div>
                <button class="btn sm btn-soft" style="width:auto" data-act="swapCaregiver">${ic('swap_horiz')}<span>Trocar</span></button></div>
        </section>

        <section class="stack"><div class="row c-teal">${ic('text_fields')}<h2 class="t-h3" style="color:var(--text)">Tamanho das letras</h2></div>
          <p class="t-md muted">Ajuste o tamanho de todo o texto no aplicativo.</p>
          <div class="card stack"><div class="seg" role="radiogroup" aria-label="Tamanho do texto">
            ${S.FONT_STEPS.map((k) => `<button role="radio" aria-checked="${cur().fontSize === k}" data-act="pickFont" data-size="${k}"><span style="font-size:${FONT_LABELS[k][2]}">${FONT_LABELS[k][0]}</span><small>${FONT_LABELS[k][1]}</small></button>`).join('')}</div>
            <div class="card tint flat stack-xs"><span class="t-small c-teal row" style="gap:.3rem">${ic('visibility', { size: 1.25 })}Prévia de como ficará o texto:</span>
              <div class="row" style="background:#fff;padding:.7rem;border-radius:1rem"><div class="iconchip sm round" style="background:var(--accent-soft);color:#341100">${ic('medication')}</div><p id="fontPreview" style="font-size:${PREVIEW[cur().fontSize]};line-height:1.3">Tomar medicamento de pressão às 14:00</p></div></div></div>
        </section>

        <p class="t-md muted center row" style="justify-content:center;gap:.4rem" role="note">${ic('lock', { cls: 'c-green', size: 1.25 })}Tudo é salvo na hora, neste aparelho.</p>

        <section class="card stack" aria-labelledby="acc-t"><div class="row">${ic('account_circle', { fill: true, cls: 'c-teal', size: 1.9 })}<h2 class="t-h3" id="acc-t">Minha conta</h2></div>
          ${VD.auth.isGuest()
            ? `<p class="t-md muted">Você está como <b>visitante</b>: pode olhar tudo, mas nada é salvo.</p>
               <button class="btn lg btn-primary" data-act="guestSignup">${ic('person_add', { fill: true })}<span>Criar minha conta</span></button>
               <button class="btn btn-soft" data-act="logout">${ic('logout')}<span>Sair do modo visitante</span></button>`
            : `<div class="row"><div class="contact-av">${VD.initial(VD.USER.name)}</div><div style="min-width:0"><div class="t-bold">${esc((VD.auth.user() || {}).name)}</div><div class="t-md muted trunc">${esc((VD.auth.user() || {}).email)}</div></div></div>
               <button class="btn lg btn-outline" data-act="logout">${ic('logout')}<span>Sair da conta</span></button>
               <button class="btn btn-dangersoft" data-act="deleteAccount">${ic('person_remove')}<span>Remover minha conta</span></button>`}
        </section>

        ${VD.auth.isGuest() ? '' : `<section class="card sunk stack"><h3 class="t-h3">Para demonstração</h3><p class="t-md muted">Volta tudo ao começo: lembretes, medicamentos, histórico e preferências.</p>
          <button class="btn btn-dangersoft" data-act="resetDemo">${ic('restart_alt')}<span>Restaurar dados de exemplo</span></button></section>`}
      </div>`,
      mount() { refreshLabels(); },
    };
  };

  function refreshLabels() {
    Object.entries(STATE).forEach(([k, [on, off]]) => { const el = document.getElementById('lbl-' + k); if (el) { el.textContent = cur()[k] ? on : off; el.className = 't-small ' + (cur()[k] ? 'c-green' : 'muted'); } });
  }

  VD.on('toggle', (el) => {
    const k = el.dataset.key, on = !cur()[k];
    S.setSettings({ [k]: on });
    el.setAttribute('aria-checked', on);
    el.querySelector('.ms').textContent = on ? 'check' : 'close';
    refreshLabels();
    VD.ui.toast(on ? 'Ligado e salvo' : 'Desligado e salvo', { kind: 'ok', ms: 1600 });
  });
  VD.on('pickFont', (el) => {
    S.setSettings({ fontSize: el.dataset.size });
    VD.render(); // atualiza a prévia, o destaque e o A-/A+ do topo
  });
  VD.on('testSound', () => VD.ui.beep(4, cur().loudSound));
  VD.on('testReminder', () => {
    const next = S.nextTask(VD.today()) || S.dayTasks(VD.today())[0];
    if (!next) return VD.ui.toast('Não há atividades hoje', { icon: 'info' });
    VD.go(`/lembrete/${next.key}?teste`);
  });
  VD.on('swapCaregiver', () => {
    const html = `<div class="row between"><h3 class="t-h2">Quem avisar?</h3><button class="iconbtn" data-close aria-label="Fechar">${ic('close')}</button></div>
      <div class="stack">${VD.CONTACTS.map((c) => `<button class="card flat row" style="text-align:left;${cur().caregiverId === c.id ? 'border-color:var(--teal);background:var(--teal-soft)' : ''}" data-pick="${c.id}">
        <div class="contact-av">${VD.initial(c.name.replace(/^(Dr\.|Dona)\s+/, ''))}</div><div class="grow"><div class="t-bold">${esc(c.name)}</div><div class="t-md muted">${esc(c.role)}</div></div>${cur().caregiverId === c.id ? ic('check_circle', { fill: true, cls: 'c-teal' }) : ''}</button>`).join('')}</div>`;
    VD.ui.openOverlay(html, { onMount(ov, close) {
      ov.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
        const c = S.contact(b.dataset.pick); S.setSettings({ caregiverId: c.id });
        $('#cgName').textContent = c.name; $('#cgRole').textContent = c.short; $('#cgPhone').textContent = c.phone; $('#cgAv').textContent = VD.initial(c.name);
        close();
        VD.ui.toast('Familiar trocado e salvo', { kind: 'ok', sub: `Agora o aviso vai para ${c.name.split(' ')[0]}.`, ms: 2200 });
      }));
    } });
  });
  VD.on('logout', async () => {
    const g = VD.auth.isGuest();
    const ok = await VD.ui.confirmDialog({ title: g ? 'Sair do modo visitante' : 'Sair da conta', text: g ? 'Voltar para a tela de entrada?' : 'Deseja mesmo sair?', sub: g ? '' : 'Seus dados continuam guardados. Basta entrar de novo.', yes: 'Sim, sair', icon: 'logout' });
    if (ok) { VD.auth.logout(); VD.ui.toast('Até logo!', { icon: 'waving_hand' }); VD.go('/entrar'); }
  });
  VD.on('deleteAccount', async () => {
    const ok = await VD.ui.confirmDialog({ title: 'Remover conta', text: 'Remover sua conta para sempre?', sub: 'Todos os seus lembretes, medicamentos e histórico serão apagados. Não dá para desfazer.', yes: 'Sim, remover tudo', icon: 'person_remove', danger: true });
    if (ok) { VD.auth.deleteAccount(); VD.ui.toast('Conta removida', { icon: 'delete' }); VD.go('/entrar'); }
  });
  VD.on('resetDemo', async () => {
    const ok = await VD.ui.confirmDialog({ title: 'Restaurar exemplo', text: 'Voltar tudo ao começo?', sub: 'Lembretes, medicamentos e histórico criados por você serão apagados. Não dá para desfazer.', yes: 'Sim, restaurar', icon: 'restart_alt', danger: true });
    if (ok) { S.reset(); VD.ui.toast('Dados de exemplo restaurados', { kind: 'ok' }); VD.go('/hoje'); }
  });
})(window.VD);

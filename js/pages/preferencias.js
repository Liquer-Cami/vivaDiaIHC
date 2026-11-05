/* Tela: Como quer ser avisado? (preferências) */
(function (VD) {
  const { ic, esc, $ } = VD;
  const S = VD.store;
  let draft = null;

  const toggle = (key, label) => `<button class="switch" role="switch" aria-checked="${draft[key]}" aria-label="${label}" data-act="toggle" data-key="${key}"><span class="knob">${ic(draft[key] ? 'check' : 'close')}</span></button>`;
  const FONT_LABELS = { standard: ['A', 'Padrão', '1.125rem'], large: ['A+', 'Grande', '1.375rem'], xlarge: ['A++', 'Extra', '1.625rem'] };
  const PREVIEW = { standard: '1.125rem', large: '1.375rem', xlarge: '1.625rem' };

  VD.pages.preferencias = () => {
    draft = { ...S.settings };
    const cg = S.contact(draft.caregiverId);
    return {
      title: 'Preferências',
      back: true,
      html: `<div class="page" data-no-rerender id="prefs">
        <div class="stack-xs"><span class="pill-info" style="align-self:flex-start;color:var(--primary)">${ic('tune')}<span class="upper">Notificações e acessibilidade</span></span>
          <h1 class="t-h1">Como quer ser avisado?</h1><p class="t-md muted">Personalize os alarmes e o tamanho do texto para ver e ouvir com facilidade.</p></div>

        <section class="stack"><div class="row c-teal">${ic('notifications_active')}<h2 class="t-h3" style="color:var(--text)">Tipos de Alerta</h2></div>
          <div class="card stack"><div class="row start"><div class="iconchip" style="background:var(--teal-fixed);color:var(--primary)">${ic('open_in_full', { fill: true, size: 1.75 })}</div>
            <div class="grow"><h3 class="t-h3">Aviso grande na tela</h3><p class="t-md muted">Mostra um aviso em tela cheia, com letras bem grandes, na hora de cada remédio ou atividade.</p></div>${toggle('bigAlert', 'Aviso grande na tela')}</div>
            <div class="row between"><span class="t-small c-green" id="lbl-bigAlert"></span><span class="t-small muted">Recomendado</span></div>
            <button class="btn btn-softteal" data-act="testReminder">${ic('visibility')}<span>Ver como é o aviso</span></button></div>

          <div class="card stack"><div class="row start"><div class="iconchip" style="background:var(--accent-soft);color:#341100">${ic('volume_up', { fill: true, size: 1.75 })}</div>
            <div class="grow"><h3 class="t-h3">Som forte e repetido</h3><p class="t-md muted">Toca um som alto e claro que repete até você responder ou adiar.</p></div>${toggle('loudSound', 'Som forte e repetido')}</div>
            <div class="row between"><span class="t-small c-green" id="lbl-loudSound"></span>
              <button class="btn sm btn-softteal" style="width:auto" data-act="testSound">${ic('play_circle')}<span>Ouvir teste</span></button></div></div>

          <div class="card stack"><div class="row start"><div class="iconchip" style="background:var(--container-high);color:var(--teal)">${ic('diversity_1', { fill: true, size: 1.75 })}</div>
            <div class="grow"><h3 class="t-h3">Avisar um familiar</h3><p class="t-md muted">Envia um aviso no WhatsApp do cuidador se um remédio importante não for marcado a tempo.</p></div>${toggle('notifyFamily', 'Avisar um familiar')}</div>
            <div class="card tint flat stack-xs" style="padding:.8rem 1rem"><span class="t-small muted">Familiar responsável conectado:</span>
              <div class="row between"><div class="row"><div class="contact-av" id="cgAv" style="width:3.25rem;height:3.25rem;font-size:1.3rem">${VD.initial(cg.name)}</div>
                <div><div class="t-bold" id="cgName">${esc(cg.name)}</div><div class="t-small c-teal" id="cgRole">${esc(cg.short)}</div><div class="t-small muted" id="cgPhone">${esc(cg.phone)}</div></div></div>
                <button class="btn sm btn-soft" style="width:auto" data-act="swapCaregiver">${ic('swap_horiz')}<span>Trocar</span></button></div></div></div>
        </section>

        <section class="stack"><div class="row c-teal">${ic('text_fields')}<h2 class="t-h3" style="color:var(--text)">Tamanho das letras</h2></div>
          <p class="t-md muted">Ajuste o tamanho de todo o texto no aplicativo.</p>
          <div class="card stack"><div class="seg" role="radiogroup" aria-label="Tamanho do texto">
            ${S.FONT_STEPS.map((k) => `<button role="radio" aria-checked="${draft.fontSize === k}" data-act="pickFont" data-size="${k}"><span style="font-size:${FONT_LABELS[k][2]}">${FONT_LABELS[k][0]}</span><small>${FONT_LABELS[k][1]}</small></button>`).join('')}</div>
            <div class="card tint flat stack-xs"><span class="t-small c-teal row" style="gap:.3rem">${ic('visibility', { size: 1.25 })}Prévia de como ficará o texto:</span>
              <div class="row" style="background:#fff;padding:.7rem;border-radius:1rem"><div class="iconchip sm round" style="background:var(--accent-soft);color:#341100">${ic('medication')}</div><p id="fontPreview" style="font-size:${PREVIEW[draft.fontSize]};line-height:1.3">Tomar remédio de pressão às 14:00</p></div></div></div>
        </section>

        <section class="stack"><button class="btn xl btn-primary" id="saveBtn" data-act="savePrefs">${ic('check_circle', { size: 2 })}<span id="saveTxt">Salvar alterações</span></button>
          <p class="t-md muted center row" style="justify-content:center;gap:.4rem">${ic('lock', { cls: 'c-green', size: 1.25 })}Suas preferências ficam salvas no seu aparelho.</p></section>

        <section class="card stack" aria-labelledby="acc-t"><div class="row">${ic('account_circle', { fill: true, cls: 'c-teal', size: 1.9 })}<h2 class="t-h3" id="acc-t">Minha conta</h2></div>
          ${VD.auth.isGuest()
            ? `<p class="t-md muted">Você está como <b>visitante</b>: pode olhar tudo, mas nada é salvo.</p>
               <button class="btn lg btn-primary" data-act="guestSignup">${ic('person_add', { fill: true })}<span>Criar minha conta</span></button>
               <button class="btn btn-soft" data-act="logout">${ic('logout')}<span>Sair do modo visitante</span></button>`
            : `<div class="row"><div class="contact-av">${VD.initial(VD.USER.name)}</div><div style="min-width:0"><div class="t-bold">${esc((VD.auth.user() || {}).name)}</div><div class="t-md muted trunc">${esc((VD.auth.user() || {}).email)}</div></div></div>
               <button class="btn lg btn-outline" data-act="logout">${ic('logout')}<span>Sair da conta</span></button>
               <button class="btn btn-dangersoft" data-act="deleteAccount">${ic('person_remove')}<span>Excluir minha conta</span></button>`}
        </section>

        ${VD.auth.isGuest() ? '' : `<section class="card sunk stack"><h3 class="t-h3">Para demonstração</h3><p class="t-md muted">Volta tudo ao começo: lembretes, remédios, histórico e preferências.</p>
          <button class="btn btn-dangersoft" data-act="resetDemo">${ic('restart_alt')}<span>Restaurar dados de exemplo</span></button></section>`}
      </div>`,
      mount() { refreshLabels(); },
    };
  };

  function refreshLabels() {
    const set = (k, on, a, b) => { const el = document.getElementById('lbl-' + k); if (el) el.textContent = on ? a : b; };
    set('bigAlert', draft.bigAlert, '● Ativado (tela cheia)', '○ Desativado');
    set('loudSound', draft.loudSound, '● Toque nítido e volume 100%', '○ Desativado (som baixo)');
  }

  VD.on('toggle', (el) => {
    const k = el.dataset.key; draft[k] = !draft[k];
    el.setAttribute('aria-checked', draft[k]);
    el.querySelector('.ms').textContent = draft[k] ? 'check' : 'close';
    refreshLabels();
  });
  VD.on('pickFont', (el) => {
    draft.fontSize = el.dataset.size;
    document.querySelectorAll('[data-act="pickFont"]').forEach((b) => b.setAttribute('aria-checked', b === el));
    $('#fontPreview').style.fontSize = PREVIEW[draft.fontSize];
  });
  VD.on('testSound', () => VD.ui.beep(4, draft.loudSound));
  VD.on('testReminder', () => {
    const next = S.nextTask(VD.today()) || S.dayTasks(VD.today())[0];
    if (!next) return VD.ui.toast('Não há atividades hoje', { icon: 'info' });
    VD.go(`/lembrete/${next.key}`);
  });
  VD.on('swapCaregiver', () => {
    const html = `<div class="row between"><h3 class="t-h2">Quem avisar?</h3><button class="iconbtn" data-close aria-label="Fechar">${ic('close')}</button></div>
      <div class="stack">${VD.CONTACTS.map((c) => `<button class="card flat row" style="text-align:left;${draft.caregiverId === c.id ? 'border-color:var(--teal);background:var(--teal-soft)' : ''}" data-pick="${c.id}">
        <div class="contact-av">${VD.initial(c.name.replace(/^(Dr\.|Dona)\s+/, ''))}</div><div class="grow"><div class="t-bold">${esc(c.name)}</div><div class="t-md muted">${esc(c.role)}</div></div>${draft.caregiverId === c.id ? ic('check_circle', { fill: true, cls: 'c-teal' }) : ''}</button>`).join('')}</div>`;
    VD.ui.openOverlay(html, { onMount(ov, close) {
      ov.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
        const c = S.contact(b.dataset.pick); draft.caregiverId = c.id;
        $('#cgName').textContent = c.name; $('#cgRole').textContent = c.short; $('#cgPhone').textContent = c.phone; $('#cgAv').textContent = VD.initial(c.name);
        close();
      }));
    } });
  });
  VD.on('savePrefs', (el) => {
    S.setSettings(draft);
    document.documentElement.dataset.font = draft.fontSize;
    const t = $('#saveTxt'); const icon = el.querySelector('.ms');
    t.textContent = 'Alterações salvas!'; icon.textContent = 'task_alt'; el.classList.replace('btn-primary', 'btn-success');
    VD.ui.toast('Preferências salvas', { kind: 'ok' });
    setTimeout(() => { t.textContent = 'Salvar alterações'; icon.textContent = 'check_circle'; el.classList.replace('btn-success', 'btn-primary'); }, 2200);
    VD.render(); // atualiza o cabeçalho (A-/A+) — mantém o rascunho
  });
  VD.on('logout', async () => {
    const g = VD.auth.isGuest();
    const ok = await VD.ui.confirmDialog({ title: g ? 'Sair do modo visitante' : 'Sair da conta', text: g ? 'Voltar para a tela de entrada?' : 'Deseja mesmo sair?', sub: g ? '' : 'Seus dados continuam guardados. Basta entrar de novo.', yes: 'Sim, sair', icon: 'logout' });
    if (ok) { VD.auth.logout(); VD.ui.toast('Até logo!', { icon: 'waving_hand' }); VD.go('/entrar'); }
  });
  VD.on('deleteAccount', async () => {
    const ok = await VD.ui.confirmDialog({ title: 'Excluir conta', text: 'Excluir sua conta para sempre?', sub: 'Todos os seus lembretes, remédios e histórico serão apagados. Não dá para desfazer.', yes: 'Sim, excluir tudo', icon: 'person_remove', danger: true });
    if (ok) { VD.auth.deleteAccount(); VD.ui.toast('Conta excluída', { icon: 'delete' }); VD.go('/entrar'); }
  });
  VD.on('resetDemo', async () => {
    const ok = await VD.ui.confirmDialog({ title: 'Restaurar exemplo', text: 'Voltar tudo ao começo?', sub: 'Lembretes, remédios e histórico criados por você serão apagados.', yes: 'Sim, restaurar', icon: 'restart_alt', danger: true });
    if (ok) { S.reset(); VD.ui.toast('Dados de exemplo restaurados', { kind: 'ok' }); VD.go('/hoje'); }
  });
})(window.VD);

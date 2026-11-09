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

  const ROLE_OPTIONS = [
    { value: 'Filho', label: 'Filho' },
    { value: 'Filha', label: 'Filha' },
    { value: 'Sobrinha', label: 'Sobrinha' },
    { value: 'Vizinha', label: 'Vizinha' },
    { value: 'Médico', label: 'Médico' },
    { value: 'Outro', label: 'Outro familiar ou cuidador' },
  ];

  /* ---- helpers de contatos ---- */

  function addContactBtnHTML() {
    const count = (S.extraContacts || []).length;
    const max = 3;
    if (count >= max) {
      return `<p class="t-small muted row" style="gap:.35rem">${ic('info', { size: 1.1 })}Limite de ${max} contatos atingido.</p>`;
    }
    return `<button class="btn btn-softteal" data-act="openAddContact">
      ${ic('person_add')} <span>Adicionar contato (${count}/${max})</span>
    </button>`;
  }

  function familiarCardBodyHTML() {
    const cg = S.caregiver;
    const extra = S.extraContacts || [];
    const hasContacts = extra.length > 0 && cg;

    if (hasContacts) {
      return `
        <div class="card tint flat stack-xs" style="padding:.8rem 1rem">
          <span class="t-small muted">Familiar responsável:</span>
          <div class="row between cg-row">
            <div class="row">
              <div class="contact-av" id="cgAv" style="width:3.25rem;height:3.25rem;font-size:1.3rem">${VD.initial(cg.name)}</div>
              <div>
                <div class="t-bold" id="cgName">${esc(cg.name)}</div>
                <div class="t-small c-teal" id="cgRole">${esc(cg.role)}</div>
                <div class="t-small muted" id="cgPhone">${esc(cg.phone)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="stack-xs" style="gap:.5rem;width:100%">
          <button class="btn btn-soft" data-act="swapCaregiver">${ic('swap_horiz')}<span>Trocar familiar responsável</span></button>
          <div id="add-contact-btn-wrap" style="width:100%">${addContactBtnHTML()}</div>
        </div>`;
    }

    return `
      <div class="card tint flat stack-xs" style="padding:.8rem 1rem">
        <span class="t-small muted">Familiar responsável:</span>
        <p class="t-md muted" style="margin:0">Nenhum contato cadastrado ainda.</p>
      </div>
      <div class="stack-xs" style="gap:.5rem;width:100%">
        <div id="add-contact-btn-wrap" style="width:100%">${addContactBtnHTML()}</div>
      </div>`;
  }

  function familiarCardHTML() {
    return `<div class="card stack" id="card-familiar"><div class="row start pref-row"><div class="iconchip" style="background:var(--container-high);color:var(--teal)">${ic('diversity_1', { fill: true, size: 1.75 })}</div>
        <div class="grow"><h3 class="t-h3">Avisar um familiar</h3><p class="t-md muted">Envia um aviso no WhatsApp do cuidador se um medicamento importante não for marcado a tempo.</p></div>${toggle('notifyFamily', 'Avisar um familiar')}</div>
        <span class="t-small" id="lbl-notifyFamily"></span>
        <div id="familiar-body" class="stack-xs" style="gap:.6rem">${familiarCardBodyHTML()}</div>
      </div>`;
  }

  VD.pages.preferencias = () => {
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

          ${familiarCardHTML()}
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

  function refreshFamiliarCard() {
    const body = document.getElementById('familiar-body');
    if (body) {
      body.innerHTML = familiarCardBodyHTML();
    }
  }

  /* ---- overlay de troca de cuidador (Quem avisar?) ---- */

  function buildSwapListHTML() {
    const extra = S.extraContacts || [];
    if (extra.length === 0) {
      return `<p class="t-md muted" style="padding:.75rem 0">Nenhum contato cadastrado ainda.</p>`;
    }
    const currentCgId = cur().caregiverId || (extra[0] ? extra[0].id : null);
    return extra.map((c) => {
      const isSelected = currentCgId === c.id;
      return `
        <div class="card flat row between cg-row" style="align-items:center;padding:.75rem .9rem;${isSelected ? 'border-color:var(--teal);background:var(--teal-soft)' : ''}">
          <button type="button" class="row grow" style="text-align:left;background:none;border:none;padding:0;cursor:pointer;color:inherit;font:inherit;gap:.75rem" data-pick="${esc(c.id)}" aria-label="Definir ${esc(c.name)} como responsável">
            <div class="contact-av" style="width:3rem;height:3rem;font-size:1.2rem;flex-shrink:0">${VD.initial(c.name)}</div>
            <div class="grow" style="min-width:0">
              <div class="row" style="gap:.4rem;align-items:center">
                <span class="t-bold trunc">${esc(c.name)}</span>
                ${isSelected ? '<span class="tag" style="font-size:.75rem;padding:.15rem .45rem">Responsável</span>' : ''}
              </div>
              <div class="t-small c-teal">${esc(c.role)}</div>
              <div class="t-small muted">${esc(c.phone)}</div>
            </div>
            ${isSelected ? ic('check_circle', { fill: true, cls: 'c-teal', size: 1.5 }) : ''}
          </button>
          <button type="button" class="iconbtn" data-del-contact="${esc(c.id)}" aria-label="Excluir ${esc(c.name)}" title="Excluir contato" style="color:var(--error);margin-left:.5rem;flex-shrink:0">
            ${ic('delete', { size: 1.4 })}
          </button>
        </div>`;
    }).join('');
  }

  function attachSwapOverlayListeners(ov, close) {
    // Escolher responsável
    ov.querySelectorAll('[data-pick]').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (VD.auth && VD.auth.isGuest()) {
          VD.auth.blocked();
          return;
        }
        const c = S.contact(b.dataset.pick);
        if (!c) return;
        S.setSettings({ caregiverId: c.id });
        refreshFamiliarCard();
        close();
        VD.ui.toast('Familiar trocado e salvo', { kind: 'ok', sub: `Agora o aviso vai para ${c.name.split(' ')[0]}.`, ms: 2200 });
      });
    });

    // Excluir contato de dentro da listagem
    ov.querySelectorAll('[data-del-contact]').forEach((b) => {
      b.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (VD.auth && VD.auth.isGuest()) {
          VD.auth.blocked();
          return;
        }
        const id = b.dataset.delContact;
        const c = S.contact(id);
        if (!c) return;

        const ok = await VD.ui.confirmDialog({
          title: 'Excluir contato',
          text: `Deseja excluir ${c.name}?`,
          sub: 'Este contato deixará de ser avisado e será removido da sua lista.',
          yes: 'Sim, excluir',
          no: 'Cancelar',
          icon: 'person_remove',
          danger: true,
        });
        if (!ok) return;

        S.removeExtraContact(id);
        refreshFamiliarCard();

        const remaining = S.extraContacts || [];
        if (remaining.length === 0) {
          close();
          VD.ui.toast('Contato excluído', { icon: 'delete', ms: 2000 });
        } else {
          const listEl = ov.querySelector('#swap-contact-list');
          if (listEl) {
            listEl.innerHTML = buildSwapListHTML();
            attachSwapOverlayListeners(ov, close);
          }
          VD.ui.toast('Contato excluído', { icon: 'delete', ms: 2000 });
        }
      });
    });
  }

  /* ---- eventos ---- */

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
    VD.render();
  });

  VD.on('testSound', () => VD.ui.beep(4, cur().loudSound));

  VD.on('testReminder', () => {
    const next = S.nextTask(VD.today()) || S.dayTasks(VD.today())[0];
    if (!next) return VD.ui.toast('Não há atividades hoje', { icon: 'info' });
    VD.go(`/lembrete/${next.key}?teste`);
  });

  VD.on('swapCaregiver', () => {
    if (VD.auth && VD.auth.isGuest()) {
      VD.auth.blocked();
      return;
    }
    const extra = S.extraContacts || [];
    if (extra.length === 0) {
      VD.ui.toast('Adicione um contato primeiro.', { icon: 'info' });
      return;
    }
    const canAddMore = extra.length < 3;
    const html = `
      <div class="row between">
        <h3 class="t-h2">Quem avisar?</h3>
        <button class="iconbtn" data-close aria-label="Fechar">${ic('close')}</button>
      </div>
      <p class="t-md muted">Toque no nome para escolher quem deve receber os avisos no WhatsApp. Toque na lixeira para excluir.</p>
      <div class="stack" id="swap-contact-list">
        ${buildSwapListHTML()}
      </div>
      ${canAddMore ? `
        <button class="btn btn-softteal" style="margin-top:.75rem" data-act-swap-add>
          ${ic('person_add')}<span>Adicionar outro contato (${extra.length}/3)</span>
        </button>` : ''}`;
    VD.ui.openOverlay(html, {
      onMount(ov, close) {
        attachSwapOverlayListeners(ov, close);
        const addBtn = ov.querySelector('[data-act-swap-add]');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            close();
            const opener = document.querySelector('[data-act="openAddContact"]');
            if (opener) opener.click();
          });
        }
      },
    });
  });

  VD.on('openAddContact', () => {
    if (VD.auth && VD.auth.isGuest()) {
      VD.auth.blocked();
      return;
    }
    if ((S.extraContacts || []).length >= 3) return;
    const roleOpts = ROLE_OPTIONS.map((r) => `<option value="${esc(r.value)}">${esc(r.label)}</option>`).join('');
    const html = `
      <div class="row between">
        <h3 class="t-h2">${ic('person_add')} Novo contato</h3>
        <button class="iconbtn" data-close aria-label="Fechar">${ic('close')}</button>
      </div>
      <p class="t-md muted">Preencha os dados de quem cuida ou ajuda você. É rápido e fácil.</p>
      <form id="add-contact-form" class="stack" novalidate>
        <div class="stack-xs">
          <label class="t-bold" for="ac-name">Nome completo</label>
          <input class="input" id="ac-name" name="name" type="text" placeholder="Ex.: Ana Paula" autocomplete="name" autofocus required maxlength="60">
          <span class="t-small c-accent" id="ac-name-err" style="display:none">Informe o nome da pessoa.</span>
        </div>
        <div class="stack-xs">
          <label class="t-bold" for="ac-phone">Número de telefone (com DDD)</label>
          <input class="input" id="ac-phone" name="phone" type="tel" placeholder="Ex.: (11) 98765-4321" autocomplete="tel" required maxlength="20">
          <span class="t-small c-accent" id="ac-phone-err" style="display:none">Informe o número de telefone com o DDD.</span>
        </div>
        <div class="stack-xs">
          <label class="t-bold" for="ac-role">Papel desta pessoa</label>
          <select class="input" id="ac-role" name="role" required>
            <option value="">Toque para escolher o papel…</option>
            ${roleOpts}
          </select>
          <span class="t-small c-accent" id="ac-role-err" style="display:none">Escolha quem esta pessoa é para você.</span>
        </div>
        <button type="submit" class="btn lg btn-primary">${ic('check')}<span>Salvar contato</span></button>
        <button type="button" class="btn btn-soft" data-close>${ic('close')}<span>Cancelar</span></button>
      </form>`;

    VD.ui.openOverlay(html, {
      onMount(ov, close) {
        const form = ov.querySelector('#add-contact-form');
        const nameIn = ov.querySelector('#ac-name');
        const phoneIn = ov.querySelector('#ac-phone');
        const roleIn = ov.querySelector('#ac-role');

        // Máscara de telefone simples
        phoneIn.addEventListener('input', () => {
          let v = phoneIn.value.replace(/\D/g, '').slice(0, 11);
          if (v.length > 10) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
          else if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
          else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
          phoneIn.value = v;
        });

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = nameIn.value.trim();
          const phone = phoneIn.value.trim();
          const role = roleIn.value;

          ov.querySelector('#ac-name-err').style.display = name ? 'none' : '';
          ov.querySelector('#ac-phone-err').style.display = phone ? 'none' : '';
          ov.querySelector('#ac-role-err').style.display = role ? 'none' : '';
          if (!name || !phone || !role) return;

          const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
          const result = S.addExtraContact({ name, phone, role: roleLabel });
          if (result === false) {
            VD.ui.toast('Limite de 3 contatos atingido.', { icon: 'info' });
            close();
            return;
          }
          close();
          refreshFamiliarCard();
          VD.ui.toast(`${name} adicionado!`, { kind: 'ok', icon: 'person_add', ms: 2200 });
        });
      },
    });
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

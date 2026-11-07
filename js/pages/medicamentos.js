/* Telas: Medicamentos, Detalhe do medicamento e Novo medicamento */
(function (VD) {
  const { ic, esc, $ } = VD;
  const S = VD.store;

  /* ---------------- Lista ---------------- */
  VD.pages.medicamentos = () => {
    const td = VD.today();
    const meds = S.dayTasks(td).filter((t) => t.medId);
    const taken = meds.filter((t) => t.status === 'done').length;
    const pct = meds.length ? Math.round((taken / meds.length) * 100) : 0;
    const current = meds.find((t) => t.status !== 'done');

    const card = (t) => {
      const m = S.med(t.medId) || {};
      const isCur = current && current.key === t.key;
      const doneCard = t.status === 'done';
      return `<article class="card ${isCur ? 'accent-left' : ''} stack" style="${doneCard ? 'opacity:.96' : ''}">
        <div class="row start between card-head">
          <div class="row">
            <div class="iconchip ${doneCard ? '' : 'cat-med'}" style="${doneCard ? 'background:var(--green-soft);color:#00531c' : ''}">${ic(doneCard ? 'done' : isCur ? 'medication_liquid' : 'medication', { fill: true, size: 1.75 })}</div>
            <div><span class="t-time-m">${t.time}</span><p class="t-small ${isCur ? 'c-accent' : 'muted'}">${isCur ? 'Horário atual' : esc(m.dose || '')}</p></div>
          </div>
          ${VD.ui.taskBadge(t, { time: true })}
        </div>
        <button class="stack-xs" style="text-align:left" data-act="openTask" data-key="${t.key}">
          <h2 class="t-h3">${esc(t.title)}</h2>
          <p class="t-md muted">${esc(m.name || '')} • ${esc(m.dose || '')}</p>
          <p class="t-md muted row" style="gap:.4rem">${ic('info', { size: 1.25, cls: 'c-accent' })}<span>${esc(t.desc || '')}</span></p>
        </button>
        ${doneCard
          ? `<button class="btn btn-softteal" data-act="reconfirm" data-key="${t.key}">${ic('check')}<span>Tomado — marcar de novo?</span></button>`
          : isCur
            ? `<button class="btn xl btn-primary" data-act="medTake" data-key="${t.key}">${ic('check_circle', { fill: true, size: 2 })}<span>JÁ TOMEI</span></button>
               <button class="btn btn-soft" data-act="medSnooze" data-key="${t.key}">${ic('snooze')}<span>Adiar ${VD.SNOOZE_MIN} min</span></button>`
            : `<button class="btn lg btn-softteal" data-act="medTake" data-key="${t.key}">${ic('check')}<span>Já tomei</span></button>`}
      </article>`;
    };

    return {
      tab: 'hoje',
      title: 'Medicamentos',
      html: `<div class="page">
      
        <button class="btn lg btn-accent" data-act="goNewMed">${ic('add_circle', { size: 2 })}<span>Adicionar Medicamento</span></button>
        <div class="stack-xs">
          <div class="row c-primary" style="gap:.4rem">${ic('medication', { fill: true, size: 1.75 })}<span class="t-small upper">Rotina diária</span></div>
          <h1 class="t-h1">Medicamentos</h1>
          <p class="t-md muted">Gestão dos seus horários e doses diárias</p>
        </div>
        <section class="card tint stack" aria-label="Resumo dos medicamentos de hoje">
          <div class="row between">
            <div class="row"><div class="iconchip round" style="background:var(--primary);color:#fff">${ic('pill', { fill: true, size: 1.75 })}</div>
              <div><div class="t-h3">${meds.length} medicamento${meds.length === 1 ? '' : 's'} hoje</div><div class="t-md muted">${taken} tomado${taken === 1 ? '' : 's'} • ${meds.length - taken} pendente${meds.length - taken === 1 ? '' : 's'}</div></div></div>
            <div class="ring">${pct}%</div>
          </div>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div>
        </section>
        ${meds.length ? '<div class="cards2">' + meds.map(card).join('') + '</div>' : `<div class="empty">${ic('medication')}<p class="t-lg">Nenhum medicamento cadastrado para hoje.</p></div>`}
      </div>`,
    };
  };

  VD.on('medTake', (el) => VD.act.done(el.dataset.key));
  VD.on('medSnooze', (el) => VD.act.snooze(el.dataset.key, VD.SNOOZE_MIN));
  VD.on('reconfirm', (el) => VD.act.reconfirm(el.dataset.key));
  VD.on('goNewMed', () => VD.go('/medicamentos/novo'));

  /* ---------------- Detalhe ---------------- */
  VD.pages.detalhe = (key) => {
    const t = S.task(key);
    if (!t || !t.medId) return VD.pages.medicamentos();
    const m = S.med(t.medId) || { name: t.title, dose: '', form: '', instructions: [], stock: 0 };
    const cg = S.caregiver;
    const days = m.stock; // 1 dose por dia por horário
    const perDay = Math.max(1, S.state.templates.filter((x) => x.medId === m.id).length);
    const daysLeft = Math.floor(m.stock / perDay);
    const hist = S.history(t.id, 4);
    const period = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' }[VD.period(t.baseTime)];
    const isToday = t.date === VD.today();
    const icons = ['check_small', 'inventory_2', 'info'];

    const badge = t.status === 'done' ? VD.ui.statusBadge('done', { label: `Tomado hoje às ${t.doneAt || ''}` })
      : t.status === 'snoozed' ? VD.ui.statusBadge('snoozed', { label: `Adiado (${t.time})` })
      : `<span class="badge pending">${ic('notifications_active')}<span>Pendente de confirmação</span></span>`;

    return {
      title: 'Detalhes da Rotina',
      back: true,
      html: `<div class="page" style="padding-bottom:2.5rem">
        ${t.status === 'done' ? `<div class="card" style="background:var(--green);color:#fff;border-color:var(--green)"><div class="row">${ic('check_circle', { fill: true, size: 2.25 })}<div><div class="t-h3">Medicamento confirmado!</div><div class="t-md">Parabéns por cuidar da sua saúde hoje.</div></div></div></div>` : ''}
        <div class="card stack">
          <div class="row between wrap"><span class="pill-info" style="background:var(--teal-tint);color:var(--primary)">${ic('schedule')}${t.time} (${period})</span>${badge}</div>
          <div class="stack-xs"><h1 class="t-h1">${esc(m.name)}</h1>
            <p class="t-md muted row" style="gap:.4rem">${ic('medication', { size: 1.4 })}<span>${esc(m.form)} • ${esc(m.dose)}</span></p></div>
          <div class="card tint flat stack">
            <div class="row"><div class="iconchip lg" style="background:#fff;color:var(--teal)">${ic('pill', { fill: true, size: 2.25 })}</div>
              <div><div class="t-bold">Como tomar:</div><div class="t-md muted">Siga as orientações simples abaixo.</div></div></div>
            <ul style="list-style:none;margin:0;padding:0" class="stack">
              ${m.instructions.map((s, i) => `<li class="row start" style="gap:.5rem">${ic(icons[i % 3], { cls: i % 3 === 2 ? 'c-accent' : 'c-teal' })}<span class="t-md">${esc(s)}</span></li>`).join('')}
            </ul>
          </div>
          <div class="row" style="background:var(--teal-tint);padding:.75rem 1rem;border-radius:1rem">
            <div class="iconchip sm round" style="background:var(--container-highest);color:var(--teal)">${ic('pill')}</div>
            <div><div class="t-bold">Restam ${m.stock} ${m.form.toLowerCase().includes('cáps') ? 'cápsulas' : 'comprimidos'}</div><div class="t-small muted">Suficiente para ${daysLeft} dia${daysLeft === 1 ? '' : 's'} de medicação${daysLeft <= 5 ? ' — peça mais à família!' : ''}</div></div>
          </div>
        </div>

        <div class="stack">
          <span class="t-label">O que você deseja fazer agora?</span>
          ${t.status === 'done'
            ? `<button class="btn btn-softteal" data-act="reconfirm" data-key="${t.key}">${ic('check')}<span>Tomado — marcar de novo?</span></button>
               <button class="btn btn-soft" data-act="detUndo" data-key="${t.key}">${ic('undo')}<span>Desfazer: ainda não tomei</span></button>`
            : isToday || t.date < VD.today()
              ? `<button class="btn xl btn-success" data-act="detDone" data-key="${t.key}">${ic('check_circle', { fill: true, size: 2 })}<span>JÁ TOMEI</span></button>
                 <button class="btn lg btn-peach" data-act="detSnooze" data-key="${t.key}">${ic('alarm', { size: 1.75 })}<span>Adiar ${VD.SNOOZE_MIN} min</span></button>`
              : `<p class="t-md muted">Você poderá marcar este medicamento no dia dele.</p>`}
          <a class="btn lg btn-soft" href="tel:${cg.tel}">${ic('call', { cls: 'c-teal', size: 1.75 })}<span>Perguntar para Cuidador (${esc(cg.name.split(' ')[0])})</span></a>
        </div>

        <div class="card stack">
          <div class="row">${ic('history', { cls: 'c-teal' })}<h3 class="t-h3">Histórico recente</h3></div>
          ${hist.length ? hist.map((h) => {
            const d = VD.parseIso(h.date);
            return `<div class="hist"><div><div class="t-bold">${VD.WEEKDAYS[d.getDay()]} (${VD.pad(d.getDate())}/${VD.pad(d.getMonth() + 1)})</div><div class="t-md muted">${h.done ? `Tomado às ${h.doneAt}` : 'Sem confirmação'}</div></div>
              ${VD.ui.statusBadge(h.done ? 'done' : 'missed', { label: h.done ? 'Feita' : 'Não marcada' })}</div>`;
          }).join('') : '<p class="t-md muted">Ainda não há histórico para este medicamento.</p>'}
        </div>
        <button class="btn btn-dangersoft" data-act="delMed" data-id="${m.id}">${ic('delete')}<span>Remover este medicamento</span></button>
      </div>`,
    };
  };

  VD.on('detDone', async (el) => { if (await VD.act.done(el.dataset.key)) window.scrollTo({ top: 0, behavior: 'smooth' }); });
  VD.on('detSnooze', (el) => { VD.act.snooze(el.dataset.key, VD.SNOOZE_MIN); });
  VD.on('detUndo', (el) => VD.act.undo(el.dataset.key));
  VD.on('delMed', async (el) => {
    const m = S.med(el.dataset.id);
    const ok = await VD.ui.confirmDialog({ title: 'Remover medicamento', text: `Remover "${m ? m.name : 'medicamento'}"?`, sub: 'Os lembretes e o histórico dele também serão apagados.', yes: 'Sim, remover', icon: 'delete', danger: true });
    if (ok) { S.removeMed(el.dataset.id); VD.ui.toast('Medicamento removido', { icon: 'delete' }); VD.go('/medicamentos'); }
  });

  /* ---------------- Novo medicamento ---------------- */
  VD.pages.novoRemedio = () => ({
    title: 'Novo medicamento',
    back: true,
    html: `<div class="page" data-no-rerender>
      <div class="stack-xs"><h1 class="t-h1">Adicionar Medicamento</h1><p class="t-md muted">Preencha com calma. Só o nome e um horário são obrigatórios.</p></div>
      <form id="medForm" class="stack-lg" novalidate>
        <div class="field"><label for="f-name">Nome do medicamento</label><input class="input" id="f-name" placeholder="Ex.: Sinvastatina 20mg" autocomplete="off" /><span class="errmsg" id="e-name" role="alert" hidden>Escreva o nome do medicamento.</span></div>
        <div class="field"><label for="f-dose">Quanto tomar</label><input class="input" id="f-dose" value="1 comprimido" autocomplete="off" /></div>
        <div class="field"><label>Tipo</label>
          <div class="chips" id="f-form" role="radiogroup">
            ${['Comprimido', 'Cápsula', 'Gotas', 'Líquido'].map((f, i) => `<button type="button" class="chip${i === 0 ? ' on' : ''}" role="radio" aria-checked="${i === 0}" data-form="${f}">${f}</button>`).join('')}
          </div></div>
        <div class="field"><label>Horários</label><div class="stack" id="times"></div>
          <button type="button" class="btn btn-softteal" id="addTime">${ic('add_alarm')}<span>Adicionar outro horário</span></button>
          <span class="errmsg" id="e-times" role="alert" hidden>Coloque pelo menos um horário.</span></div>
        <div class="field"><label for="f-inst">Como tomar (opcional)</label><input class="input" id="f-inst" placeholder="Ex.: Tomar após o almoço, com água" /></div>
        <div class="field"><label for="f-stock">Quantos tem na caixa</label><input class="input" id="f-stock" type="number" inputmode="numeric" min="0" value="30" /></div>
        <div class="stack"><button class="btn xl btn-primary" type="submit">${ic('check_circle', { fill: true, size: 2 })}<span>Salvar medicamento</span></button>
          <button class="btn btn-soft" type="button" data-act="back">${ic('close')}<span>Cancelar</span></button></div>
      </form></div>`,
    mount(root) {
      const timesBox = $('#times', root);
      const addTime = (v = '08:00') => {
        const row = document.createElement('div');
        row.className = 'timerow';
        row.innerHTML = `<input class="input" type="time" value="${v}" aria-label="Horário" /><button type="button" class="iconbtn" aria-label="Remover este horário" title="Remover este horário">${ic('delete')}</button>`;
        row.querySelector('button').addEventListener('click', () => { if (timesBox.children.length > 1) row.remove(); });
        timesBox.appendChild(row);
      };
      addTime();
      $('#addTime', root).addEventListener('click', () => addTime('20:00'));
      let form = 'Comprimido';
      $('#f-form', root).addEventListener('click', (e) => {
        const b = e.target.closest('[data-form]'); if (!b) return;
        form = b.dataset.form;
        root.querySelectorAll('#f-form .chip').forEach((c) => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-checked', on); });
        const dose = $('#f-dose', root);
        if (/^1 (comprimido|cápsula|gotas|colher)/.test(dose.value)) dose.value = { Comprimido: '1 comprimido', 'Cápsula': '1 cápsula', Gotas: '5 gotas', 'Líquido': '1 colher de sopa' }[form];
      });
      $('#medForm', root).addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = $('#f-name', root).value.trim();
        const times = Array.from(timesBox.querySelectorAll('input')).map((i) => i.value).filter(Boolean);
        const uniq = [...new Set(times)].sort();
        $('#e-name', root).hidden = !!name; $('#f-name', root).classList.toggle('bad', !name); $('#f-name', root).setAttribute('aria-invalid', String(!name));
        $('#e-times', root).hidden = uniq.length > 0;
        if (!name || !uniq.length) { (name ? $('#times input', root) : $('#f-name', root)).focus(); return; }
        $('#f-name', root).setAttribute('aria-invalid', 'false');
        if (S.state.meds.some((m) => m.name.trim().toLowerCase() === name.toLowerCase())) {
          const again = await VD.ui.confirmDialog({ title: 'Medicamento repetido', text: `Você já tem "${name}" cadastrado. Adicionar mesmo assim?`, sub: 'Se for outro horário do mesmo medicamento, use "Adicionar outro horário" no cadastro dele.', yes: 'Sim, adicionar', no: 'Não, voltar', icon: 'content_copy' });
          if (!again) return;
        }
        S.addMed({ name, dose: $('#f-dose', root).value.trim() || '1 unidade', form: { Comprimido: 'Comprimido oral', 'Cápsula': 'Cápsula', Gotas: 'Gotas', 'Líquido': 'Líquido oral' }[form], instruction: $('#f-inst', root).value.trim(), stock: Math.max(0, parseInt($('#f-stock', root).value, 10) || 0), times: uniq });
        VD.ui.toast('Medicamento salvo!', { kind: 'ok', sub: `${name} foi adicionado à sua rotina.` });
        VD.go('/medicamentos');
      });
    },
  });
})(window.VD);
/* Tela: Hoje */
(function (VD) {
  const { ic, esc } = VD;
  const S = VD.store;

  VD.pages.hoje = () => {
    const td = VD.today();
    const tasks = S.dayTasks(td);
    const { done, total } = S.progress(td);
    const next = S.nextTask(td);
    const d = VD.parseIso(td);
    const title = `Hoje, ${VD.dayMonth(td)}`;
    const msg = done === 0 ? 'Vamos começar o dia com calma. Uma coisa de cada vez.'
      : done === total ? 'Parabéns! Você completou tudo por hoje. Descanse tranquilo.'
      : 'Muito bem! Você está cuidando bem do seu dia, sem pressa.';
    const online = navigator.onLine;

    const nextCard = next ? `
      <section class="px" aria-labelledby="prox">
        <div class="card accent-top stack">
          <div class="row between">
            <span class="t-small upper c-teal" id="prox" style="font-weight:700">Próxima atividade</span>
            ${VD.ui.statusBadge(next.status, next.status === 'snoozed' ? { label: 'Adiada' } : {})}
          </div>
          <div class="row wrap" style="align-items:baseline">
            <span class="t-time">${next.time}</span>
            <span class="pill-info" style="background:var(--teal-tint);color:var(--teal)">${ic(VD.CATEGORIES[next.category].icon, { fill: true })}${VD.CATEGORIES[next.category].label}</span>
          </div>
          <h2 class="t-h2">${esc(next.title)}</h2>
          <p class="t-lg muted note">${esc(next.desc || '')}</p>
          <div class="grid2">
            <button class="btn lg btn-success" data-act="nextDone" data-key="${next.key}">${ic('check_circle', { fill: true })}<span>FEITO</span></button>
            <button class="btn lg btn-outline" data-act="nextSnooze" data-key="${next.key}">${ic('update')}<span>ADIAR 10 min</span></button>
          </div>
          <button class="btn-link" style="align-self:center" data-act="openTask" data-key="${next.key}">Ver detalhes</button>
        </div>
      </section>` : `
      <section class="px"><div class="card center stack" style="align-items:center">
        ${ic('celebration', { fill: true, size: 3.5, cls: 'c-green' })}
        <h2 class="t-h2">Tudo feito por hoje!</h2>
        <p class="t-lg muted">Você completou todas as atividades. Que dia bom!</p>
      </div></section>`;

    const rows = tasks.map((t) => {
      const cat = VD.CATEGORIES[t.category];
      const isNext = next && next.key === t.key;
      return `<button class="task-row${isNext ? ' current' : ''}" data-act="openTask" data-key="${t.key}">
        <div class="grow">${VD.ui.catChip(t.category)}
          <div class="txt"><p class="t-bold">${esc(t.title)}</p>
          <p class="t-md ${isNext ? 'c-accent' : 'muted'}" ${isNext ? 'style="font-weight:700"' : ''}>${t.time} • ${isNext ? 'Próxima' : esc(cat.label)}</p></div>
        </div>
        ${VD.ui.statusBadge(t.status, { label: t.status === 'done' ? 'FEITA' : t.status === 'snoozed' ? 'ADIADA' : 'PENDENTE' })}
      </button>`;
    }).join('');

    const areas = [
      ['medicamentos', 'pill', 'Medicamentos', 'cat-med', '/medicamentos'],
      ['food', 'restaurant', 'Alimentação', 'cat-food', null],
      ['exercise', 'directions_walk', 'Exercícios', 'cat-exercise', null],
      ['mental', 'psychology', 'Atividades Mentais', 'cat-mind', '/mental'],
    ].map(([id, icon, label, cls, route]) => `<button class="area" data-act="area" data-id="${id}" ${route ? `data-route="${route}"` : ''}>
        <div class="iconchip ${cls}">${ic(icon, { fill: true })}</div><span>${label}</span></button>`).join('');

    return {
      tab: 'hoje',
      title: 'Hoje',
      html: `
      <div class="page" style="padding-left:0;padding-right:0">
        <div class="px" style="padding:0 var(--margin)">
          <span class="pill-info">${ic(online ? 'check_circle' : 'cloud_off', { fill: true, cls: 'c-green' })}${online ? 'Lembretes ativos' : 'Sem internet: lembretes ativos'}</span>
        </div>
        <div class="stack" style="padding:0 var(--margin)">
          <h1 class="t-h1">${VD.capital(title)}</h1>
          <div class="card flat">
            <div class="row between"><span class="t-bold">Progresso do Dia</span><span class="t-label c-teal">${done} de ${total} feitas</span></div>
            ${VD.ui.segments(done, total)}
            <p class="t-md muted">${msg}</p>
          </div>
        </div>
        <div style="padding:0 var(--margin)">${nextCard}</div>
        <section class="stack" style="padding:0 var(--margin)" aria-labelledby="rot">
          <div class="section-head"><h2 class="t-h3" id="rot">Atividades de hoje</h2><span class="t-small c-teal">${total} itens</span></div>
          ${rows || '<div class="empty">' + ic('event_available') + '<p class="t-lg">Nenhuma atividade para hoje.</p></div>'}
        </section>
        <section class="stack" style="padding:0 var(--margin)" aria-labelledby="areas">
          <div class="section-head"><h2 class="t-h3" id="areas">Áreas de Cuidado</h2><span class="t-small muted">Acesso rápido</span></div>
          <div class="grid2">${areas}</div>
        </section>
      </div>`,
    };
  };

  VD.on('nextDone', (el) => VD.act.done(el.dataset.key));
  VD.on('nextSnooze', (el) => VD.act.snooze(el.dataset.key, 10));
  VD.on('area', (el) => {
    const { id, route } = el.dataset;
    if (route) return VD.go(route);
    VD.ui_agendaFilter = id; // food | exercise
    VD.ui_agendaDate = VD.today();
    VD.go('/agenda');
  });
})(window.VD);

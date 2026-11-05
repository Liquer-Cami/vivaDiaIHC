/* VivaDia — ações compartilhadas (marcar feito, adiar, folha de detalhes) e registro de handlers de clique */
(function (VD) {
  const { ic, esc } = VD;
  const S = VD.store;
  const handlers = {};

  /** Registra um handler para elementos com data-act="nome" */
  VD.on = (name, fn) => { handlers[name] = fn; };
  const WRITE = new Set(['nextDone', 'nextSnooze', 'medTake', 'medSnooze', 'reconfirm', 'goNewMed', 'detDone', 'detSnooze', 'detUndo', 'delMed', 'agMark', 'addReminder', 'savePrefs', 'resetDemo', 'remDone', 'remSnooze', 'remFamily', 'askHelp', 'swapCaregiver', 'deleteAccount']);
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = handlers[el.dataset.act];
    if (WRITE.has(el.dataset.act) && VD.auth && VD.auth.isGuest()) { e.preventDefault(); VD.auth.blocked(); return; }
    if (fn) { e.preventDefault(); fn(el, e); }
  });

  const act = {
    done(key, { silent } = {}) {
      const t = S.task(key);
      S.complete(key);
      if (!silent && t) VD.ui.toast('Atividade registrada!', { kind: 'ok', sub: `${t.title} marcada como feita.` });
      if (t && S.settings.notifyFamily && t.medId) S.notifyFamily(`${t.title} confirmado`);
    },
    snooze(key, minutes) {
      const t = S.task(key);
      const newTime = S.snooze(key, minutes);
      VD.ui.toast(`Adiado para ${newTime}`, { icon: 'snooze', kind: 'warn', sub: `${t ? t.title : 'Lembrete'} será lembrado de novo.` });
      return newTime;
    },
    undo(key) { S.undo(key); VD.ui.toast('Desfeito', { icon: 'undo', sub: 'A atividade voltou para pendente.' }); },
    async reconfirm(key) {
      const ok = await VD.ui.confirmDialog({ title: 'Confirmação de Segurança', text: 'Você já marcou este remédio hoje. Marcar de novo?', sub: 'Essa proteção evita tomar dose dupla por engano.', yes: 'Sim, marcar de novo', icon: 'shield' });
      if (ok) { S.reconfirm(key); VD.ui.toast('Dose reconfirmada', { kind: 'ok' }); }
    },

    /** Folha com detalhes de uma tarefa (para tarefas que não são remédio) */
    open(key) {
      const t = S.task(key);
      if (!t) return;
      if (t.medId) { VD.go(`/medicamentos/${key}`); return; }
      const cat = VD.CATEGORIES[t.category];
      const isPastOrToday = t.date <= VD.today();
      const html = `
        <div class="row start between">
          <div class="row">${VD.ui.catChip(t.category, 'lg')}
            <div><div class="t-small upper cat-text-${t.category}">${esc(cat.label)}</div><div class="t-time-m">${t.time}</div></div>
          </div>
          ${VD.ui.statusBadge(t.status, t.status === 'done' ? { label: `Feita ${t.doneAt || ''}` } : t.status === 'snoozed' ? { label: `Adiada p/ ${t.time}` } : {})}
        </div>
        <div class="stack-xs"><h3 class="t-h2">${esc(t.title)}</h3><p class="t-lg muted">${esc(t.desc || '')}</p></div>
        ${t.note ? `<div class="note row start">${ic('info', { cls: 'c-accent' })}<span class="t-md">${esc(t.note)}</span></div>` : ''}
        <div class="stack">
          ${t.status !== 'done' && isPastOrToday ? `<button class="btn lg btn-success" data-sheet-do="done">${ic('check_circle', { fill: true })}<span>FEITO</span></button>
             <button class="btn btn-outline" data-sheet-do="snooze">${ic('update')}<span>ADIAR 10 min</span></button>` : ''}
          ${t.status === 'done' ? `<button class="btn btn-soft" data-sheet-do="undo">${ic('undo')}<span>Desfazer (marcar como pendente)</span></button>` : ''}
          ${t.status !== 'done' && !isPastOrToday ? `<p class="t-md muted center">Você poderá marcar esta atividade no dia dela.</p>` : ''}
          ${t.custom ? `<button class="btn btn-dangersoft" data-sheet-do="delete">${ic('delete')}<span>Excluir este lembrete</span></button>` : ''}
          <button class="btn btn-soft" data-close>${ic('close')}<span>Fechar</span></button>
        </div>`;
      VD.ui.openOverlay(html, {
        onMount(ov, close) {
          ov.querySelectorAll('[data-sheet-do]').forEach((b) => b.addEventListener('click', async () => {
            const what = b.dataset.sheetDo;
            if (what === 'done') { act.done(key); close(); }
            else if (what === 'snooze') { act.snooze(key, 10); close(); }
            else if (what === 'undo') { act.undo(key); close(); }
            else if (what === 'delete') {
              const ok = await VD.ui.confirmDialog({ title: 'Excluir lembrete', text: `Excluir "${t.title}"?`, sub: 'Ele não aparecerá mais na sua agenda.', yes: 'Sim, excluir', icon: 'delete', danger: true });
              if (ok) { S.removeTemplate(t.id); VD.ui.toast('Lembrete excluído', { icon: 'delete' }); close(); }
            }
          }));
        },
      });
    },
  };

  VD.act = act;
  VD.on('openTask', (el) => act.open(el.dataset.key));
})(window.VD);

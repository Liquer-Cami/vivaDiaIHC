/* VivaDia — ações compartilhadas (marcar feito, adiar, folha de detalhes) e registro de handlers de clique */
(function (VD) {
  const { ic, esc } = VD;
  const S = VD.store;
  const handlers = {};
  VD.SNOOZE_MIN = 10; // um único tempo de "adiar" em todo o app (consistência)

  /** Registra um handler para elementos com data-act="nome" */
  VD.on = (name, fn) => { handlers[name] = fn; };
  const WRITE = new Set(['nextDone', 'nextSnooze', 'medTake', 'medSnooze', 'reconfirm', 'goNewMed', 'detDone', 'detSnooze', 'detUndo', 'delMed', 'agMark', 'addReminder', 'quickAddReminder', 'toggle', 'resetDemo', 'remDone', 'remSnooze', 'remFamily', 'remDelete', 'askHelp', 'swapCaregiver', 'deleteAccount']);
  WRITE.add('playActivity'); // visitante só visualiza: não começa jogos
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = handlers[el.dataset.act];
    if (WRITE.has(el.dataset.act) && VD.auth && VD.auth.isGuest()) { e.preventDefault(); VD.auth.blocked(); return; }
    if (fn) { e.preventDefault(); fn(el, e); }
  });

  const act = {
    /** Marca como feita. Para medicamento muito antes do horário, pede confirmação (evita dose marcada por engano). Retorna true/false. */
    async done(key, { silent } = {}) {
      const t = S.task(key);
      if (t && t.medId && t.status !== 'done' && t.date === VD.today() && VD.toMin(t.time) - VD.toMin(VD.nowTime()) > 60) {
        const ok = await VD.ui.confirmDialog({ title: 'Ainda não é a hora', text: `Este medicamento está marcado para ${t.time}. Marcar como tomado agora?`, sub: 'Essa pergunta evita marcar a dose errada por engano.', yes: 'Sim, já tomei', no: 'Ainda não tomei', icon: 'schedule' });
        if (!ok) return false;
      }
      S.complete(key);
      const notify = !!(t && S.settings.notifyFamily && t.medId);
      if (notify) S.notifyFamily(`${t.title} confirmado`);
      if (!silent && t) VD.ui.toast(t.medId ? 'Medicamento registrado!' : 'Atividade registrada!', { kind: 'ok', sub: `${t.title} marcada como feita.${notify ? ' Aviso enviado para ' + S.caregiver.name.split(' ')[0] + '.' : ''}`, action: { label: 'Desfazer', onClick: () => act.undo(key) } });
      return true;
    },
    snooze(key, minutes = VD.SNOOZE_MIN) {
      const t = S.task(key);
      const newTime = S.snooze(key, minutes);
      VD.ui.toast(`Adiado para ${newTime}`, { icon: 'snooze', kind: 'warn', sub: `${t ? t.title : 'Lembrete'} será lembrado de novo.`, action: { label: 'Desfazer', onClick: () => act.undo(key) } });
      return newTime;
    },
    undo(key) { S.undo(key); VD.ui.toast('Desfeito', { icon: 'undo', sub: 'A atividade voltou para pendente.' }); },
    async reconfirm(key) {
      const ok = await VD.ui.confirmDialog({ title: 'Confirmação de segurança', text: 'Você já marcou este medicamento hoje. Marcar de novo?', sub: 'Essa proteção evita tomar dose dupla por engano.', yes: 'Sim, marcar de novo', no: 'Não, está certo', icon: 'shield' });
      if (ok) { S.reconfirm(key); VD.ui.toast('Dose reconfirmada', { kind: 'ok' }); }
    },

    /** Folha com detalhes de uma tarefa (para tarefas que não são medicamento) */
    open(key) {
      const t = S.task(key);
      if (!t) return;
      if (t.medId) { VD.go(`/medicamentos/${key}`); return; }
      const cat = VD.CATEGORIES[t.category];
      const isPastOrToday = t.date <= VD.today();
      const html = `
        <div class="row start between task-sheet-head">
          <div class="row">${VD.ui.catChip(t.category, 'lg')}
            <div><div class="t-small upper cat-text-${t.category}">${esc(cat.label)}</div><div class="t-time-m">${t.time}</div></div>
          </div>
          ${VD.ui.statusBadge(t.status, t.status === 'done' ? { label: `Feita ${t.doneAt || ''}` } : t.status === 'snoozed' ? { label: `Adiada p/ ${t.time}` } : {})}
        </div>
        <div class="stack-xs"><h3 class="t-h2">${esc(t.title)}</h3><p class="t-lg muted">${esc(t.desc || '')}</p></div>
        ${t.note ? `<div class="note row start">${ic('info', { cls: 'c-accent' })}<span class="t-md">${esc(t.note)}</span></div>` : ''}
        <div class="stack">
          ${t.activityId && t.status !== 'done' ? `<button class="btn lg btn-accent" data-act="playActivity" data-id="${t.activityId}">${ic('play_circle', { fill: true })}<span>Começar agora</span></button>` : ''}
          ${t.status !== 'done' && isPastOrToday ? `<button class="btn lg btn-success" data-sheet-do="done">${ic('check_circle', { fill: true })}<span>Feito</span></button>
             <button class="btn btn-outline" data-sheet-do="snooze">${ic('update')}<span>Adiar ${VD.SNOOZE_MIN} min</span></button>` : ''}
          ${t.status === 'done' ? `<button class="btn btn-soft" data-sheet-do="undo">${ic('undo')}<span>Desfazer (marcar como pendente)</span></button>` : ''}
          ${t.status !== 'done' && !isPastOrToday ? `<p class="t-md muted center">Você poderá marcar esta atividade no dia dela.</p>` : ''}
          ${t.status !== 'done' ? `<button class="btn btn-dangersoft" data-sheet-do="delete">${ic('delete')}<span>Remover este lembrete</span></button>` : ''}
          <button class="btn btn-soft" data-close>${ic('close')}<span>Fechar</span></button>
        </div>`;
      VD.ui.openOverlay(html, {
        onMount(ov, close) {
          ov.querySelectorAll('[data-sheet-do]').forEach((b) => b.addEventListener('click', async () => {
            const what = b.dataset.sheetDo;
            if (what === 'done') { close(); act.done(key); }
            else if (what === 'snooze') { act.snooze(key, VD.SNOOZE_MIN); close(); }
            else if (what === 'undo') { act.undo(key); close(); }
            else if (what === 'delete') {
              const tpl = S.template(t.id);
              const recurring = !!(tpl && !tpl.date);
              const ok = await VD.ui.confirmDialog({ title: 'Remover lembrete', text: `Remover "${t.title}"?`, sub: recurring ? 'Este lembrete se repete todos os dias. Ele será removido de todos os dias da agenda.' : 'Ele não aparecerá mais na sua agenda.', yes: 'Sim, remover', icon: 'delete', danger: true });
              if (ok) { S.removeTemplate(t.id); VD.ui.toast('Lembrete removido', { icon: 'delete' }); close(); }
            }
          }));
        },
      });
    },
  };

  VD.act = act;
  VD.on('openTask', (el) => act.open(el.dataset.key));
  VD.on('playActivity', (el) => { document.querySelectorAll('.overlay').forEach((o) => o.remove()); document.body.style.overflow = ''; VD.go(`/jogo/${el.dataset.id}`); });
})(window.VD);
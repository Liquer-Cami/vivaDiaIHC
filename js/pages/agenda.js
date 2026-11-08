/* Tela: Agenda semanal */
(function (VD) {
  const { ic, esc, $ } = VD;
  const S = VD.store;
  VD.ui_agendaFilter = 'all';
  VD.ui_agendaDate = null;
  VD.ui_agendaMonth = false;
  VD.ui_agendaCalendarMonth = null;
  VD.ui_openReminderOnAgenda = false;

  const FILTERS = [['all', 'checklist', 'Todos'], ['med', 'pill', 'Medicamentos'], ['food', 'restaurant', 'Alimentação'], ['exercise', 'directions_walk', 'Exercícios'], ['mind', 'psychology', 'Mente']];
  const PERIODS = [['morning', 'Manhã', 'light_mode', 'var(--accent-soft)'], ['afternoon', 'Tarde', 'wb_twilight', 'var(--accent-container)'], ['night', 'Noite', 'dark_mode', 'var(--primary-fixed-dim, #90d1d9)']];

  VD.pages.agenda = () => {
    const td = VD.today();
    const sel = VD.ui_agendaDate || td;
    const filter = VD.ui_agendaFilter;
    const monday = VD.mondayOf(td);
    const week = Array.from({ length: 7 }, (_, i) => VD.addDays(monday, i));
    const all = S.dayTasks(sel);
    const { done, total } = S.progress(sel);
    const shown = all.filter((t) => filter === 'all' || VD.CATEGORIES[t.category].group === filter);
    const nextKey = sel === td && S.nextTask(td) ? S.nextTask(td).key : null;
    const selDate = VD.parseIso(sel);
    const canAct = sel <= td;

    const chips = week.map((d) => {
      const p = S.progress(d); const dt = VD.parseIso(d);
      const dot = d > td ? '' : p.total && p.done === p.total ? 'ok' : p.done > 0 ? 'part' : '';
      const dotLabel = d > td ? 'dia futuro' : p.done === p.total ? 'tudo feito' : `${p.done} de ${p.total} feitas`;
      return `<button class="day${d === sel ? ' sel' : ''}" data-act="pickDay" data-date="${d}" ${d === sel ? 'aria-current="date"' : ''} aria-label="${VD.WEEKDAYS[dt.getDay()]}, ${dt.getDate()}, ${dotLabel}">
        <small>${d === td ? 'Hoje' : VD.WEEKDAYS_SHORT[dt.getDay()]}</small><b>${dt.getDate()}</b>
        ${d === td && d !== sel ? '<small style="font-size:.9rem">' + VD.WEEKDAYS_SHORT[dt.getDay()] + '</small>' : d === sel && d === td ? '<small style="font-size:.9rem;background:var(--primary);padding:0 .5rem;border-radius:9999px;color:#fff">' + VD.WEEKDAYS_SHORT[dt.getDay()] + '</small>' : `<span class="dot ${dot}"></span>`}
      </button>`;
    }).join('');
    const calendarMonth = VD.ui_agendaCalendarMonth || `${selDate.getFullYear()}-${VD.pad(selDate.getMonth() + 1)}-01`;
    const calendarDate = VD.parseIso(calendarMonth);
    const monthStart = `${calendarDate.getFullYear()}-${VD.pad(calendarDate.getMonth() + 1)}-01`;
    const monthOffset = VD.weekday(monthStart);
    const monthDays = Array.from({ length: 42 }, (_, i) => VD.addDays(monthStart, i - monthOffset));
    const monthGrid = `<div class="month-grid" role="grid" aria-label="Calendário de ${VD.MONTHS[calendarDate.getMonth()]} ${calendarDate.getFullYear()}">
      ${VD.WEEKDAYS_SHORT.map((d) => `<span class="t-small muted" role="columnheader">${d}</span>`).join('')}
      ${monthDays.map((d) => {
        const dt = VD.parseIso(d);
        const outside = dt.getMonth() !== calendarDate.getMonth() || dt.getFullYear() !== calendarDate.getFullYear();
        const p = S.progress(d);
        const dot = d > td ? '' : p.total && p.done === p.total ? 'ok' : p.done > 0 ? 'part' : '';
        return `<button class="month-day${d === sel ? ' sel' : ''}${outside ? ' outside' : ''}" data-act="pickDay" data-date="${d}" role="gridcell" aria-label="${VD.dayMonth(d)}"${d === sel ? ' aria-current="date"' : ''}><b>${dt.getDate()}</b><span class="dot ${dot}"></span></button>`;
      }).join('')}
    </div>`;

    const pills = FILTERS.map(([id, icon, label]) => {
      const n = id === 'all' ? all.length : all.filter((t) => VD.CATEGORIES[t.category].group === id).length;
      return `<button class="pill${filter === id ? ' on' : ''}" data-act="pickFilter" data-id="${id}" aria-pressed="${filter === id}">${ic(icon)}<span>${label} (${n})</span></button>`;
    }).join('');

    const card = (t) => {
      const cat = VD.CATEGORIES[t.category];
      const isNext = nextKey === t.key;
      const canMark = canAct && t.status !== 'done';
      return `<div class="task-card ${isNext ? 'next' : ''} stack">
        <div class="row start between wrap tc-head" style="gap:0.75rem">
          <div class="row start wrap tc-main" style="flex: 1 1 12rem; min-width:0; gap:0.5rem">
            <span class="t-time-m time ${t.status === 'done' ? '' : 'c-primary'}" style="flex-shrink:0">${t.time}</span>
            <div class="stack-xs" style="flex: 1 1 8rem; min-width:0;">
              <span class="t-small upper cat-text-${t.category} row wrap" style="gap:.3rem">${ic(cat.icon, { size: 1.15 })}<span>${cat.label}</span></span>
              <h3 class="t-h3">${esc(t.title)}</h3>
              <span class="t-small muted">${VD.dayMonth(t.date)}</span>
            </div>
          </div>
          <div class="tc-badge" style="flex-shrink: 0;">
            ${VD.ui.taskBadge(t)}
          </div>
        </div>
        ${t.desc ? `<p class="t-md muted">${esc(t.desc)}</p>` : ''}
        ${t.note ? `<div class="note row start wrap">${ic('info', { cls: 'c-accent' })}<span class="t-md">${esc(t.note)}</span></div>` : ''}
        ${t.status === 'done' && t.doneAt ? `<p class="t-md c-green row wrap" style="gap:.4rem">${ic('done_all', { cls: 'c-green' })}Confirmado às ${t.doneAt}</p>` : ''}
        <div class="row wrap" style="gap:.6rem">
          ${canMark ? `<button class="btn ${t.category === 'consulta' ? 'btn-softteal' : 'btn-primary'}" style="flex:1; min-width:0; height:auto; padding-block:0.75rem;" data-act="agMark" data-key="${t.key}">${ic('check')}<span style="white-space: normal; line-height:1.2">${t.medId ? 'Já tomei' : 'Feito'}</span></button>` : ''}
          <button class="btn btn-soft" style="flex:1; min-width:0; height:auto; padding-block:0.75rem;" data-act="openTask" data-key="${t.key}" aria-label="Ver detalhes de ${esc(t.title)}">${ic('info')}<span style="white-space: normal; line-height:1.2">Detalhes</span></button>
        </div>
      </div>`;
    };

    const sections = PERIODS.map(([id, label, icon, bg]) => {
      const list = shown.filter((t) => VD.period(t.time) === id);
      if (!list.length) return '';
      return `<section class="stack"><div class="period"><div class="iconchip" style="background:${bg};color:var(--on-secondary-fixed,#341100)">${ic(icon)}</div><h2 class="t-h2">${label}</h2><span class="t-small muted" style="margin-left:auto">${list.length} atividade${list.length > 1 ? 's' : ''}</span></div>${list.map(card).join('')}</section>`;
    }).join('');

    const wd = VD.WEEKDAYS[selDate.getDay()];
    return {
      tab: 'agenda',
      title: 'Agenda',
      html: `<div style="padding:0 var(--margin); margin-bottom: 1rem;">
        <button class="btn xl btn-accent" data-act="addReminder">${ic('add_circle', { size: 2 })}<span>Adicionar Novo Lembrete</span></button>
      </div>
      <div style="padding:0 var(--margin)">
          <div class="card sunk row between wrap" style="gap:1rem">
            <div class="row start" style="flex: 1 1 12rem; min-width:0;">
              <div class="iconchip round" style="flex-shrink:0; background:var(--teal-fixed);color:var(--primary)">${ic('calendar_today', { fill: true })}</div>
              <div style="min-width:0; flex:1">
                <div class="t-h3">Semana Organizada</div>
                <div class="t-md muted">${sel === td ? 'Hoje é' : 'Você está vendo'} ${wd}, ${VD.dayMonth(sel)}</div>
              </div>
            </div>
            <div style="background:#fff;border-radius:1.5rem;padding:.4rem 1rem;text-align:center;box-shadow:var(--shadow-card);flex-shrink:0;">
              <div class="t-label c-teal">${done} / ${total}</div>
              <div class="t-small muted" style="line-height:1">Feitos</div>
            </div>
          </div>
        </div>
        <div class="row between wrap" style="padding:10px var(--margin);gap:.75rem"><span class="t-label">Escolha o dia:</span><div class="row wrap" style="gap:.5rem">${sel !== td ? `<button class="btn btn-primary" data-act="goToday">${ic('today')}<span>Voltar para hoje</span></button>` : ''}<button class="btn btn-softteal" data-act="toggleMonth">${ic(VD.ui_agendaMonth ? 'view_week' : 'calendar_month')}<span>${VD.ui_agendaMonth ? 'Ver semana' : 'Ver mês inteiro'}</span></button></div></div>
        <div class="row between" style="padding:0 var(--margin) 10px">
          ${VD.ui_agendaMonth ? `<button class="iconbtn" data-act="previousMonth" aria-label="Mês anterior">${ic('chevron_left')}</button>` : '<span></span>'}
          <span class="t-small c-teal">${VD.capital(VD.MONTHS[calendarDate.getMonth()])} ${calendarDate.getFullYear()}</span>
          ${VD.ui_agendaMonth ? `<button class="iconbtn" data-act="nextMonth" aria-label="Próximo mês">${ic('chevron_right')}</button>` : '<span></span>'}
        </div>
        ${VD.ui_agendaMonth ? monthGrid : `<div class="days no-scrollbar" id="days">${chips}</div>`}
        <div class="filters" role="group" aria-label="Filtrar por tipo">${pills}</div>
        <div class="stack-lg" style="padding:0 var(--margin);">
          ${sections || `<div class="empty">${ic('event_available')}<p class="t-lg">Nenhuma atividade ${filter === 'all' ? 'neste dia' : 'deste tipo neste dia'}.</p></div>`}
        </div>`,
      mount(root) {
        const box = $('#days', root);
        const s = box && box.querySelector('.sel');
        if (s) box.scrollLeft = s.offsetLeft - box.clientWidth / 2 + s.clientWidth / 2;
        if (VD.ui_openReminderOnAgenda) {
          VD.ui_openReminderOnAgenda = false;
          setTimeout(() => {
            const addButton = root.querySelector('[data-act="addReminder"]');
            if (addButton) addButton.click();
          }, 0);
        }
      },
    };
  };

  VD.on('pickDay', (el) => {
    VD.ui_agendaDate = el.dataset.date;
    const selected = VD.parseIso(el.dataset.date);
    VD.ui_agendaCalendarMonth = `${selected.getFullYear()}-${VD.pad(selected.getMonth() + 1)}-01`;
    VD.render();
  });
  VD.on('goToday', () => { VD.ui_agendaDate = VD.today(); VD.ui_agendaCalendarMonth = null; VD.render(); });
  VD.on('toggleMonth', () => { VD.ui_agendaMonth = !VD.ui_agendaMonth; VD.render(); });
  VD.on('previousMonth', () => {
    const current = VD.parseIso(VD.ui_agendaCalendarMonth || VD.ui_agendaDate || VD.today());
    current.setDate(1);
    current.setMonth(current.getMonth() - 1);
    VD.ui_agendaCalendarMonth = `${current.getFullYear()}-${VD.pad(current.getMonth() + 1)}-01`;
    VD.render();
  });
  VD.on('nextMonth', () => {
    const current = VD.parseIso(VD.ui_agendaCalendarMonth || VD.ui_agendaDate || VD.today());
    current.setDate(1);
    current.setMonth(current.getMonth() + 1);
    VD.ui_agendaCalendarMonth = `${current.getFullYear()}-${VD.pad(current.getMonth() + 1)}-01`;
    VD.render();
  });
  VD.on('pickFilter', (el) => { VD.ui_agendaFilter = el.dataset.id; VD.render(); });
  VD.on('agMark', (el) => VD.act.done(el.dataset.key));

  VD.on('addReminder', () => {
    const sel = VD.ui_agendaDate || VD.today();
    let cat = 'food', repeat = 'once';
    const catBtns = [['med', 'medication', 'Medicamento'], ['food', 'restaurant', 'Alimentação'], ['exercise', 'directions_walk', 'Exercício'], ['mind', 'psychology', 'Mente'], ['consulta', 'medical_services', 'Consulta']];
    const html = `
      <div class="row between"><h3 class="t-h2">Novo lembrete</h3><button class="iconbtn" data-close aria-label="Fechar">${ic('close')}</button></div>
      <form id="remForm" class="stack-lg" novalidate>
        <div class="field"><label for="r-title">O que lembrar? <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></label><input class="input" id="r-title" placeholder="Ex.: Beber água" autocomplete="off" /><span class="errmsg" id="r-err" role="alert" hidden>Escreva o que quer lembrar.</span></div>
        <div class="field"><label for="r-date">Data do aviso <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></label><input class="input" id="r-date" type="date" value="${sel < VD.today() ? VD.today() : sel}" min="${VD.today()}" required /><span class="errmsg" id="r-err-date" role="alert" hidden></span></div>
        <div class="field"><label for="r-time">Que horas? <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></label><input class="input" id="r-time" type="time" value="${VD.nowTime()}" style="font-size:1.5rem;font-weight:700" /><span class="errmsg" id="r-err-time" role="alert" hidden></span></div>
        <div class="field"><label>Tipo <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></label><div class="chips" id="r-cat">${catBtns.map(([id, icon, l]) => `<button type="button" class="chip${id === cat ? ' on' : ''}" data-cat="${id}">${ic(icon, { size: 1.3 })}${l}</button>`).join('')}</div></div>
        <div class="note row start" id="r-med-notice" hidden role="status">${ic('info', { cls: 'c-accent' })}<span class="t-md">Este será um aviso somente para o dia selecionado. Para medicamentos diários, cadastre-os na tela de Medicamentos.</span></div>
        <div class="field" id="r-game-wrap" hidden><label for="r-game">Escolha o jogo</label><select class="input" id="r-game">${VD.ACTIVITIES.map((a) => `<option value="${a.id}">${esc(a.title)}</option>`).join('')}</select></div>
        <div class="field"><label>Repetir?</label><div class="chips" id="r-rep">
          <button type="button" class="chip on" data-rep="once" id="r-once">Só em ${VD.dayMonth(sel)}</button><button type="button" class="chip" data-rep="daily">Todos os dias</button></div></div>
        <div class="field"><label for="r-note">Observação <span class="muted" style="font-weight:400">(opcional)</span></label><input class="input" id="r-note" placeholder="Ex.: um copo cheio" /></div>
        <div class="stack"><button class="btn xl btn-primary" type="submit">${ic('check_circle', { fill: true, size: 2 })}<span>Salvar lembrete</span></button>
        <button type="button" class="btn btn-soft" data-close>${ic('close')}<span>Cancelar</span></button></div>
      </form>`;
    VD.ui.openOverlay(html, {
      onMount(ov, close) {
        const pick = (boxSel, attr, cb) => ov.querySelector(boxSel).addEventListener('click', (e) => {
          const b = e.target.closest(`[${attr}]`); if (!b) return;
          ov.querySelectorAll(`${boxSel} .chip`).forEach((c) => c.classList.toggle('on', c === b));
          cb(b.getAttribute(attr));
        });
        const gameWrap = ov.querySelector('#r-game-wrap');
        const medNotice = ov.querySelector('#r-med-notice');
        const onceButton = ov.querySelector('[data-rep="once"]');
        const dailyButton = ov.querySelector('[data-rep="daily"]');
        const updateRepeat = () => {
          const isMed = cat === 'med';
          if (isMed) {
            repeat = 'once';
            onceButton.classList.add('on');
            dailyButton.classList.remove('on');
          }
          onceButton.disabled = isMed;
          dailyButton.disabled = isMed;
          dailyButton.hidden = isMed;
        };
        pick('#r-cat', 'data-cat', (v) => {
          cat = v;
          gameWrap.hidden = cat !== 'mind';
          medNotice.hidden = cat !== 'med';
          updateRepeat();
        });
        pick('#r-rep', 'data-rep', (v) => { repeat = v; });
        // o texto "Só em <dia>" acompanha a data escolhida
        ov.querySelector('#r-date').addEventListener('change', (e) => { if (e.target.value) ov.querySelector('#r-once').textContent = `Só em ${VD.dayMonth(e.target.value)}`; });
        ov.querySelector('#remForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const title = ov.querySelector('#r-title').value.trim();
          const date = ov.querySelector('#r-date').value;
          const time = ov.querySelector('#r-time').value;
          const showErr = (id, msg) => { const el = ov.querySelector('#' + id); el.hidden = !msg; if (msg) el.innerHTML = `${ic('error', { size: 1.2, fill: true })} ${esc(msg)}`; };
          const dateMsg = !date ? 'Escolha o dia do aviso.' : date < VD.today() ? 'Esse dia já passou. Escolha hoje ou um dia que vem.' : '';
          ov.querySelector('#r-err').hidden = !!title;
          ov.querySelector('#r-title').classList.toggle('bad', !title);
          showErr('r-err-date', dateMsg);
          showErr('r-err-time', time ? '' : 'Escolha a hora do aviso.');
          if (!title || dateMsg || !time) {
            ov.querySelector(!title ? '#r-title' : dateMsg ? '#r-date' : '#r-time').focus();
            return;
          }
          const tpl = { time, category: cat, title, desc: ov.querySelector('#r-note').value.trim() };
          if (cat === 'mind') tpl.activityId = ov.querySelector('#r-game').value;
          if (repeat === 'once') tpl.date = date; else tpl.startDate = date;
          // mostra o resultado: vai para o dia do novo lembrete, sem filtro escondendo-o
          VD.ui_agendaDate = date; VD.ui_agendaFilter = 'all';
          const pd = VD.parseIso(date); VD.ui_agendaCalendarMonth = `${pd.getFullYear()}-${VD.pad(pd.getMonth() + 1)}-01`;
          S.addTemplate(tpl);
          VD.ui.toast('Lembrete salvo!', { kind: 'ok', sub: `${title} às ${time}` });
          close();
        });
        setTimeout(() => ov.querySelector('#r-title').focus(), 50);
      },
    });
  });
})(window.VD);
/* VivaDia — roteador por hash, cabeçalho, menu e vigia de lembretes */
(function (VD) {
  const { ic, esc, $ } = VD;
  const S = VD.store;
  VD.pages = VD.pages || {};
  let current = null; // {cleanup}
  const alerted = new Set();

  const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0F5C63"/><circle cx="32" cy="34" r="11" fill="#FE843B"/><g stroke="#FAF8F3" stroke-width="4" stroke-linecap="round"><path d="M32 10v7M12 34h7M45 34h7M18 20l5 5M46 20l-5 5"/></g></svg>`;

  VD.go = (path) => { if (location.hash === '#' + path) render(); else location.hash = path; };
  VD.back = () => { if (history.length > 1) history.back(); else VD.go('/hoje'); };

  /* ---------- rotas ---------- */
  const routes = [
    [/^\/hoje$/, 'hoje'], [/^\/agenda$/, 'agenda'], [/^\/ajuda$/, 'ajuda'],
    [/^\/medicamentos$/, 'medicamentos'], [/^\/medicamentos\/novo$/, 'novoRemedio'], [/^\/medicamentos\/(.+)$/, 'detalhe'],
    [/^\/preferencias$/, 'preferencias'], [/^\/lembrete\/(.+)$/, 'lembrete'],
    [/^\/mental$/, 'mental'], [/^\/jogo\/(\w+)$/, 'jogo'],
    [/^\/entrar$/, 'entrar'], [/^\/cadastro$/, 'cadastro'], [/^\/recuperar$/, 'recuperar'],
  ];
  const AUTH_ROUTES = ['entrar', 'cadastro', 'recuperar'];
  const GUEST_BLOCKED = ['novoRemedio', 'lembrete'];
  GUEST_BLOCKED.push('jogo'); // visitante só visualiza: não abre os jogos
  function match() {
    const path = decodeURIComponent((location.hash || '#/hoje').slice(1)) || '/hoje';
    for (const [re, name] of routes) { const m = path.match(re); if (m) return { name, params: m.slice(1), path }; }
    return { name: 'hoje', params: [], path: '/hoje' };
  }

  /* ---------- casca ---------- */
  function applyFont() { document.documentElement.dataset.font = S.settings.fontSize; }

  function headerHTML(page) {
    const fs = S.FONT_STEPS.indexOf(S.settings.fontSize);
    const left = page.back
      ? `<button class="back" data-act="back" aria-label="Voltar para a tela anterior">${ic('arrow_back', { size: 1.75 })}</button><span class="header-title trunc">${esc(page.title || '')}</span>`
      : `<div class="brand">${LOGO}<b>VivaDia</b></div><span class="header-title desk-only trunc">${esc(page.title || '')}</span>`;
    return `<div class="header-in">
      <div class="row" style="min-width:0">${left}</div>
      <div class="header-right">
        <div class="fontsize" role="group" aria-label="Ajustar tamanho do texto">
          <button data-act="fontMinus" aria-label="Diminuir letras" ${fs === 0 ? 'disabled' : ''}>A-</button>
          <button data-act="fontPlus" aria-label="Aumentar letras" ${fs === S.FONT_STEPS.length - 1 ? 'disabled' : ''}>A+</button>
        </div>
        <button class="avatar" data-act="prefs" aria-label="Preferências e avisos">${VD.initial(VD.USER.name)}</button>
      </div></div>`;
  }

  function navHTML(active, name) {
    const desk = window.matchMedia('(min-width: 900px)').matches;
    const items = [
      ['hoje', 'wb_sunny', 'Hoje', ['hoje'], false],
      ['medicamentos', 'pill', 'Medicamentos', ['medicamentos', 'detalhe', 'novoRemedio'], false],
      ['agenda', 'calendar_month', 'Agenda', ['agenda'], false],
      ['ajuda', 'support', 'Ajuda', ['ajuda'], false],
    ];
    const MED = ['medicamentos', 'detalhe', 'novoRemedio'];
    const links = items.map(([id, icon, label, names, deskOnly]) => {
      // desktop: destaca pela rota; celular: pela aba, mas as telas de medicamento acendem "Medicamentos"
      const here = desk ? names.includes(name) : (active === id && !MED.includes(name)) || (id === 'medicamentos' && MED.includes(name));
      const text = id === 'medicamentos' ? `<span class="lbl-m">Medicamentos</span><span class="lbl-d">${label}</span>` : `<span>${label}</span>`;
      return `<a href="#/${id}"${deskOnly ? ' class="desk-only"' : ''}${here ? ' aria-current="page"' : ''}>${ic(icon)}${text}</a>`;
    }).join('');
    return `<div class="nav-brand">${LOGO}<b>VivaDia</b></div><div class="nav-in">${links}</div>`;
  }

  function render() {
    const route = match();
    const authed = VD.auth.current();
    if (!authed && !AUTH_ROUTES.includes(route.name)) { location.replace('#/entrar'); return; }
    if (authed && AUTH_ROUTES.includes(route.name)) { location.replace('#/hoje'); return; }
    if (authed && authed.guest && GUEST_BLOCKED.includes(route.name)) { VD.auth.blocked(); location.replace('#/hoje'); return; }
    const scroll = window.scrollY;
    const sameRoute = current && current.path === match().path;
    if (current && current.cleanup) { try { current.cleanup(); } catch (e) {} }
    const { name, params, path } = match();
    const page = VD.pages[name](...params) || {};
    current = { path, name, cleanup: page.cleanup };
    applyFont();

    const header = $('#header'), nav = $('#nav'), view = $('#view');
    header.hidden = !!page.fullscreen;
    nav.hidden = !!page.fullscreen;
    document.body.classList.toggle('is-guest', !!(authed && authed.guest));
    $('#app').classList.toggle('fs', !!page.fullscreen);
    $('#app').classList.toggle('notab', !page.tab);
    if (!page.fullscreen) header.innerHTML = headerHTML(page) + (VD.auth.isGuest() ? `<div class="guest-bar" role="status"><span class="grow">${ic('visibility', { size: 1.4 })}Modo visitante: só visualização</span><button data-act="guestSignup">Criar conta</button></div>` : '');
    if (!page.fullscreen) nav.innerHTML = navHTML(page.tab, name);
    view.className = page.tab ? '' : 'no-nav';
    view.innerHTML = page.html;
    if (page.mount) page.mount(view);
    window.scrollTo(0, sameRoute ? scroll : 0);
    document.title = `${page.title || 'VivaDia'} — VivaDia`;
  }
  VD.render = render;

  VD.on('back', () => VD.back());
  VD.on('prefs', () => VD.go('/preferencias'));
  VD.on('guestSignup', () => { VD.auth.logout(); VD.go('/cadastro'); });
  VD.on('fontMinus', () => S.stepFont(-1));
  VD.on('fontPlus', () => S.stepFont(1));

  S.subscribe(() => { if (!$('#view [data-no-rerender]')) render(); else { applyFont(); } });
  window.addEventListener('hashchange', () => { VD.ui.speech.stop(); render(); });

  /* ---------- vigia de lembretes: avisa quando chega a hora ---------- */
  function watchReminders() {
    const td = VD.today(), now = VD.toMin(VD.nowTime());
    if (!VD.auth.isUser() || match().name === 'lembrete') return;
    S.dayTasks(td).forEach((t) => {
      if (t.status === 'done' || t.category === 'consulta') return;
      const diff = now - VD.toMin(t.time);
      const id = `${t.key}|${t.time}`;
      if (diff >= 0 && diff <= 2 && !alerted.has(id)) {
        alerted.add(id);
        if (S.settings.bigAlert) VD.go(`/lembrete/${t.key}`);
        else { VD.ui.toast(`Hora de: ${t.title}`, { icon: 'notifications_active', kind: 'warn', ms: 6000 }); if (S.settings.loudSound) VD.ui.beep(3); }
      }
    });
  }

  function boot() {
    VD.auth.init();
    applyFont();
    render();
    watchReminders();
    setInterval(watchReminders, 15000);
    setInterval(() => { if (['hoje', 'agenda'].includes(current && current.name) && !document.querySelector('.overlay')) render(); }, 60000);
    window.addEventListener('online', () => current && current.name === 'hoje' && render());
    window.addEventListener('offline', () => current && current.name === 'hoje' && render());
  }
  document.addEventListener('DOMContentLoaded', boot);
})(window.VD);
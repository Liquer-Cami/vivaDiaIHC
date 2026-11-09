/* Telas: Entrar, Criar conta e Recuperar senha */
(function (VD) {
  const { ic, esc, $ } = VD;

  const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0F5C63"/><circle cx="32" cy="34" r="11" fill="#FE843B"/><g stroke="#FAF8F3" stroke-width="4" stroke-linecap="round"><path d="M32 10v7M12 34h7M45 34h7M18 20l5 5M46 20l-5 5"/></g></svg>`;
  const fontBar = `<div class="auth-top"><div class="fontsize" role="group" aria-label="Ajustar tamanho do texto"><button data-act="fontMinus" aria-label="Diminuir letras">A-</button><button data-act="fontPlus" aria-label="Aumentar letras">A+</button></div></div>`;
  const brand = (sub) => `<div class="auth-brand">${LOGO}<h1 class="t-h1 c-primary">VivaDia</h1><p class="t-lg muted">${sub}</p></div>`;

  const pwField = (id, label, auto, hint = '') => `<div class="field"><label for="${id}">${label}</label>
    <div class="pw"><input class="input" id="${id}" type="password" autocomplete="${auto}" placeholder="Digite sua senha" /><button type="button" class="pw-toggle" data-act="togglePw" data-for="${id}" aria-label="Mostrar senha">${ic('visibility')}</button></div>
    ${hint}<span class="errmsg" id="e-${id}" role="alert" hidden></span></div>`;
  const err = (root, id, msg) => { const el = $('#e-' + id, root); if (!el) return; el.hidden = !msg; el.innerHTML = msg ? `${ic('error', { size: 1.2, fill: true })} ${esc(msg)}` : ''; const inp = $('#' + id, root); if (inp) { inp.classList.toggle('bad', !!msg); inp.setAttribute('aria-invalid', String(!!msg)); } };
  const banner = (root, msg) => { const b = $('#alert', root); b.hidden = !msg; b.innerHTML = msg ? `${ic('error', { fill: true })}<span>${esc(msg)}</span>` : ''; };
  const eyeToggle = (root) => root.querySelectorAll('[data-act="togglePw"]').forEach(() => {});

  VD.on('togglePw', (el) => {
    const inp = document.getElementById(el.dataset.for); const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    el.querySelector('.ms').textContent = show ? 'visibility_off' : 'visibility';
    el.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
  });

  function strength(p) {
    let n = 0; if (p.length >= 6) n++; if (p.length >= 9) n++; if (/[A-Za-z]/.test(p) && /\d/.test(p)) n++; if (/[^A-Za-z0-9]/.test(p) || (/[A-Z]/.test(p) && /[a-z]/.test(p))) n++;
    return p ? Math.min(3, Math.max(1, n - (p.length < 6 ? 1 : 0))) : 0;
  }
  const strengthHTML = '<div class="strength" id="strength" aria-live="polite"><div class="strength-bar"><i></i><i></i><i></i></div><span class="t-small" id="strength-txt">Use pelo menos 6 caracteres</span></div>';
  function bindStrength(root, id) {
    $('#' + id, root).addEventListener('input', (e) => {
      const lv = strength(e.target.value); const bar = $('#strength', root);
      bar.dataset.lv = lv; $('#strength-txt', root).textContent = ['Use pelo menos 6 caracteres', 'Senha fraca — misture letras e números', 'Senha boa', 'Senha forte!'][lv];
    });
  }

  /* ---------------- Entrar ---------------- */
  VD.pages.entrar = () => ({
    fullscreen: true, title: 'Entrar',
    html: `<main class="auth" data-no-rerender>${fontBar}
      ${brand('Sua rotina. Seu cuidado. Sua autonomia.')}
      <form id="loginForm" class="card stack-lg" novalidate>
        <h2 class="t-h2">Entrar na minha conta</h2>
        <div class="alert" id="alert" role="alert" hidden></div>
        <div class="field"><label for="l-email">E-mail</label><input class="input" id="l-email" type="email" inputmode="email" autocomplete="username" placeholder="exemplo@email.com" autocapitalize="none" /><span class="errmsg" id="e-l-email" role="alert" hidden></span></div>
        ${pwField('l-pass', 'Senha', 'current-password')}
        <button type="button" class="chk" role="checkbox" aria-checked="true" id="remember" data-act="chk"><span class="box">${ic('check', { size: 1.5 })}</span><span class="t-md">Manter conectado</span></button>
        <button class="btn xl btn-primary" type="submit">${ic('login', { size: 2 })}<span>ENTRAR</span></button>
        <a class="btn-link" href="#/recuperar" style="align-self:center">${ic('lock_reset')}<span>Esqueci / trocar minha senha</span></a>
      </form>
      <div class="or"><span>ou</span></div>
      <div class="stack">
        <a class="btn lg btn-outline" href="#/cadastro">${ic('person_add', { fill: true, size: 1.75 })}<span>Criar minha conta</span></a>
        <button class="btn lg btn-soft" data-act="guestLogin">${ic('visibility', { size: 1.75 })}<span>Entrar como visitante</span></button>
        <p class="t-md muted center">Visitante só olha o aplicativo. Nada é salvo.</p>
      </div>
      <div class="card tint flat stack-xs"><span class="t-small c-teal row" style="gap:.3rem">${ic('science', { size: 1.25 })}Conta de demonstração</span>
        <p class="t-md"><b>${VD.auth.DEMO.email}</b><br/>Senha: <b>${VD.auth.DEMO.password}</b></p>
        <button class="btn sm btn-softteal" type="button" data-act="fillDemo">${ic('auto_fix_high')}<span>Preencher para mim</span></button></div>
    </main>`,
    mount(root) {
      const form = $('#loginForm', root);
      form.addEventListener('submit', (e) => {
        e.preventDefault(); banner(root, '');
        const email = $('#l-email', root).value.trim(), pass = $('#l-pass', root).value;
        err(root, 'l-email', !email ? 'Escreva seu e-mail.' : !VD.auth.validEmail(email) ? 'Esse e-mail parece incompleto. Exemplo: nome@email.com' : '');
        err(root, 'l-pass', !pass ? 'Escreva sua senha.' : '');
        if (!email || !pass || !VD.auth.validEmail(email)) { (!email || !VD.auth.validEmail(email) ? $('#l-email', root) : $('#l-pass', root)).focus(); return; }
        const r = VD.auth.login(email, pass, $('#remember', root).getAttribute('aria-checked') === 'true');
        if (!r.ok) { banner(root, r.error); $('#l-pass', root).value = ''; $('#l-pass', root).focus(); return; }
        VD.ui.toast(`Bem-vindo, ${r.user.name.split(' ')[0]}!`, { kind: 'ok', sub: 'Que bom ver você de novo.' });
        VD.go('/hoje');
      });
    },
  });
  VD.on('chk', (el) => { const on = el.getAttribute('aria-checked') !== 'true'; el.setAttribute('aria-checked', on); });
  VD.on('fillDemo', () => { VD.auth.restoreDemo(); document.getElementById('l-email').value = VD.auth.DEMO.email; const p = document.getElementById('l-pass'); p.value = VD.auth.DEMO.password; p.focus(); });
  VD.on('guestLogin', () => { VD.auth.guest(); VD.ui.toast('Você entrou como visitante', { icon: 'visibility', sub: 'Pode olhar tudo, mas nada será salvo.' }); VD.go('/hoje'); });

  /* ---------------- Criar conta ---------------- */
  VD.pages.cadastro = () => ({
    fullscreen: true, title: 'Criar conta',
    html: `<main class="auth" data-no-rerender>
      <div class="auth-top"><a class="back" href="#/entrar" aria-label="Voltar para entrar">${ic('arrow_back', { size: 1.75 })}</a>${fontBar.replace('<div class="auth-top">', '<div style="display:contents">')}</div>
      ${brand('Vamos criar sua conta. É rápido!')}
      <form id="regForm" class="card stack-lg" novalidate>
        <h2 class="t-h2">Criar conta</h2>
        <div class="alert" id="alert" role="alert" hidden></div>
        <div class="field"><label for="r-name">Seu nome <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></label><input class="input" id="r-name" autocomplete="name" placeholder="Ex.: Helena Souza" /><span class="errmsg" id="e-r-name" role="alert" hidden></span></div>
        <div class="field"><label for="r-email">E-mail <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></label><input class="input" id="r-email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" placeholder="exemplo@email.com" /><span class="errmsg" id="e-r-email" role="alert" hidden></span></div>
        <div class="field"><label for="r-phone">Celular <span class="muted" style="font-weight:400">(opcional)</span></label><input class="input" id="r-phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="(11) 91234-5678" maxlength="15" /></div>
        ${pwField('r-pass', 'Crie uma senha <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span>', 'new-password', strengthHTML)}
        ${pwField('r-pass2', 'Repita a senha <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span>', 'new-password')}
        <div class="stack-xs"><button type="button" class="chk" role="checkbox" aria-checked="false" id="terms" data-act="chk"><span class="box">${ic('check', { size: 1.5 })}</span><span class="t-md">Li e aceito os termos de uso <span style="color:var(--error-text); font-weight:400">(Obrigatório)</span></span></button>
          <button type="button" class="btn-link" style="align-self:flex-start" data-act="showTerms">${ic('description')}<span>Ler os termos de uso</span></button>
          <span class="errmsg" id="e-terms" role="alert" hidden style="display:block;margin-top:.4rem"></span></div>
        <button class="btn xl btn-primary" type="submit">${ic('check_circle', { fill: true, size: 2 })}<span>CRIAR CONTA</span></button>
      </form>
      <p class="t-lg center">Já tem conta? <a href="#/entrar" style="color:var(--primary);font-weight:700;text-decoration:underline">Entrar</a></p>
    </main>`,
    mount(root) {
      bindStrength(root, 'r-pass');
      $('#r-phone', root).addEventListener('input', (e) => {
        const d = e.target.value.replace(/\D/g, '').slice(0, 11);
        e.target.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
      });
      $('#regForm', root).addEventListener('submit', (e) => {
        e.preventDefault(); banner(root, '');
        const name = $('#r-name', root).value.trim(), email = $('#r-email', root).value.trim(), pass = $('#r-pass', root).value, pass2 = $('#r-pass2', root).value;
        const terms = $('#terms', root).getAttribute('aria-checked') === 'true';
        const errs = {
          'r-name': name.length < 2 ? 'Escreva seu nome.' : '',
          'r-email': !email ? 'Escreva seu e-mail.' : !VD.auth.validEmail(email) ? 'Esse e-mail parece incompleto. Exemplo: nome@email.com' : '',
          'r-pass': pass.length < 6 ? 'A senha precisa de pelo menos 6 caracteres.' : '',
          'r-pass2': pass2 !== pass ? 'As senhas não são iguais.' : '',
          terms: terms ? '' : 'Para continuar, aceite os termos de uso.',
        };
        Object.entries(errs).forEach(([k, v]) => err(root, k, v));
        const first = Object.keys(errs).find((k) => errs[k]);
        if (first) { (first === 'terms' ? $('#terms', root) : $('#' + first, root)).focus(); return; }
        const r = VD.auth.register({ name, email, phone: $('#r-phone', root).value, password: pass });
        if (!r.ok) { err(root, 'r-email', r.error); $('#r-email', root).focus(); return; }
        VD.ui.toast(`Conta criada! Bem-vindo, ${name.split(' ')[0]}!`, { kind: 'ok', sub: 'Já preparamos uma rotina de exemplo para você.' });
        VD.go('/hoje');
      });
    },
  });
  VD.on('showTerms', () => {
    VD.ui.openOverlay(`<div class="row between"><h3 class="t-h2">Termos de uso</h3><button class="iconbtn" data-close aria-label="Fechar">${ic('close')}</button></div>
      <div class="stack"><p class="t-md">Este é um aplicativo de <b>demonstração</b>. Os dados que você digita ficam apenas neste aparelho, no navegador, e não são enviados a nenhum servidor.</p>
      <p class="t-md">O VivaDia ajuda a lembrar de medicamentos e atividades, mas <b>não substitui</b> a orientação do seu médico. Em emergência, ligue 192 (SAMU).</p></div>
      <button class="btn lg btn-primary" data-close>${ic('check')}<span>Entendi</span></button>`);
  });

  /* ---------------- Trocar senha (nome do perfil + senha antiga) ---------------- */
  VD.pages.recuperar = () => ({
    fullscreen: true, title: 'Trocar senha',
    html: `<main class="auth" data-no-rerender>
      <div class="auth-top"><a class="back" href="#/entrar" aria-label="Voltar para entrar">${ic('arrow_back', { size: 1.75 })}</a>${fontBar.replace('<div class="auth-top">', '<div style="display:contents">')}</div>
      ${brand('Vamos trocar a sua senha.')}
      <form id="recForm" class="card stack-lg" novalidate>
        <h2 class="t-h2">Trocar minha senha</h2>
        <p class="t-md muted">Para sua segurança, confirme o <b>nome do seu perfil</b> e a <b>senha antiga</b>.</p>
        <div class="alert" id="alert" role="alert" hidden></div>
        <div class="field"><label for="p-name">Nome do perfil</label><input class="input" id="p-name" autocomplete="name" placeholder="Ex.: Helena Souza" /><span class="errmsg" id="e-p-name" role="alert" hidden></span></div>
        ${pwField('p-old', 'Senha antiga', 'current-password')}
        ${pwField('n-pass', 'Nova senha', 'new-password', strengthHTML)}
        ${pwField('n-pass2', 'Repita a nova senha', 'new-password')}
        <button class="btn xl btn-success" type="submit">${ic('lock_reset', { size: 1.75 })}<span>SALVAR NOVA SENHA</span></button>
      </form></main>`,
    mount(root) {
      bindStrength(root, 'n-pass');
      $('#recForm', root).addEventListener('submit', (e) => {
        e.preventDefault(); banner(root, '');
        const name = $('#p-name', root).value.trim(), old = $('#p-old', root).value, a = $('#n-pass', root).value, b = $('#n-pass2', root).value;
        const errs = {
          'p-name': name.length < 2 ? 'Escreva o nome do seu perfil.' : '',
          'p-old': !old ? 'Escreva sua senha antiga.' : '',
          'n-pass': a.length < 6 ? 'A senha precisa de pelo menos 6 caracteres.' : (a === old ? 'A nova senha precisa ser diferente da antiga.' : ''),
          'n-pass2': b !== a ? 'As senhas não são iguais.' : '',
        };
        Object.entries(errs).forEach(([k, v]) => err(root, k, v));
        const first = Object.keys(errs).find((k) => errs[k]);
        if (first) { $('#' + first, root).focus(); return; }
        const r = VD.auth.changePassword(name, old, a);
        if (!r.ok) { banner(root, r.error); $('#p-old', root).value = ''; $('#p-old', root).focus(); return; }
        VD.ui.toast('Senha alterada!', { kind: 'ok', sub: 'Agora é só entrar com a nova senha.' });
        VD.go('/entrar');
      });
    },
  });
})(window.VD);

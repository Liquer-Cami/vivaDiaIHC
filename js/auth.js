/* VivaDia — autenticação MOCK (tudo local, nenhum servidor).
   Contas ficam no localStorage; a "senha" é só embaralhada (não é segurança real, é demonstração). */
(function (VD) {
  const USERS_KEY = 'vivadia:users';
  const SESSION_KEY = 'vivadia:session';
  const DEMO = { id: 'u_demo', name: 'Helena', email: 'demo@vivadia.com', phone: '(11) 91234-5678', password: '123456' };
  const S = VD.store;
  let failed = { n: 0, until: 0 };

  const normName = (n) => String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
  const norm = (e) => String(e || '').trim().toLowerCase();
  const hash = (email, pass) => { let h = 2166136261; const t = norm(email) + '|' + pass; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + t.length; };
  const read = (store, key) => { try { return JSON.parse(store.get(key)); } catch (e) { return null; } };
  const users = () => read(VD.local, USERS_KEY) || [];
  const saveUsers = (l) => VD.local.set(USERS_KEY, JSON.stringify(l));

  function ensureDemo() {
    const l = users();
    if (l.some((u) => u.id === DEMO.id)) return; // já existe: preserva a senha que a pessoa tiver trocado
    l.push({ id: DEMO.id, name: DEMO.name, email: DEMO.email, phone: DEMO.phone, pass: hash(DEMO.email, DEMO.password), createdAt: Date.now() });
    saveUsers(l);
  }

  function session() {
    return read(VD.session, SESSION_KEY) || read(VD.local, SESSION_KEY);
  }
  function setSession(sess, remember) {
    VD.session.remove(SESSION_KEY); VD.local.remove(SESSION_KEY);
    if (sess) (remember ? VD.local : VD.session).set(SESSION_KEY, JSON.stringify(sess));
  }

  function attach(sess) {
    if (!sess) { S.attach('none'); VD.USER.name = ''; return null; }
    if (sess.guest) { S.attach('guest'); VD.USER.name = 'Visitante'; VD.USER.email = ''; return { guest: true }; }
    const u = users().find((x) => x.id === sess.userId);
    if (!u) { setSession(null); S.attach('none'); return null; }
    S.attach('user', u.id); VD.USER.name = u.name.split(' ')[0]; VD.USER.email = u.email; VD.USER.fullName = u.name;
    return { user: u };
  }

  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  VD.auth = {
    DEMO, validEmail,
    init() { ensureDemo(); this.state = attach(session()); },
    current() { return this.state || null; },
    isGuest() { return !!(this.state && this.state.guest); },
    isUser() { return !!(this.state && this.state.user); },
    user() { return this.state && this.state.user; },

    login(email, password, remember) {
      const wait = Math.ceil((failed.until - Date.now()) / 1000);
      if (wait > 0) return { ok: false, error: `Muitas tentativas. Aguarde ${wait} segundos e tente de novo.` };
      const u = users().find((x) => x.email === norm(email));
      if (!u || u.pass !== hash(u.email, password)) {
        failed.n++;
        if (failed.n >= 5) { failed = { n: 0, until: Date.now() + 30000 }; return { ok: false, error: 'Muitas tentativas. Aguarde 30 segundos e tente de novo.' }; }
        return { ok: false, error: 'E-mail ou senha incorretos. Confira e tente de novo.' };
      }
      failed = { n: 0, until: 0 };
      setSession({ userId: u.id }, !!remember);
      this.state = attach({ userId: u.id });
      return { ok: true, user: u };
    },
    register({ name, email, phone, password }) {
      const l = users();
      if (l.some((u) => u.email === norm(email))) return { ok: false, field: 'email', error: 'Já existe uma conta com este e-mail. Tente entrar.' };
      const u = { id: 'u' + Date.now().toString(36), name: name.trim(), email: norm(email), phone: phone || '', pass: hash(email, password), createdAt: Date.now() };
      l.push(u); saveUsers(l);
      setSession({ userId: u.id }, true);
      this.state = attach({ userId: u.id });
      return { ok: true, user: u };
    },
    guest() { setSession({ guest: true }, false); this.state = attach({ guest: true }); },
    logout() { setSession(null); this.state = attach(null); },
    emailExists(email) { return users().some((u) => u.email === norm(email)); },
    /* Troca de senha confirmada pelo NOME DO PERFIL + SENHA ANTIGA (sem e-mail). */
    changePassword(name, oldPassword, newPassword) {
      const wait = Math.ceil((failed.until - Date.now()) / 1000);
      if (wait > 0) return { ok: false, error: `Muitas tentativas. Aguarde ${wait} segundos e tente de novo.` };
      const key = normName(name);
      const l = users();
      const u = key ? l.find((x) => normName(x.name) === key && x.pass === hash(x.email, oldPassword)) : null;
      if (!u) {
        failed.n++;
        if (failed.n >= 5) { failed = { n: 0, until: Date.now() + 30000 }; return { ok: false, error: 'Muitas tentativas. Aguarde 30 segundos e tente de novo.' }; }
        return { ok: false, error: 'Nome do perfil ou senha antiga incorretos. Confira e tente de novo.' };
      }
      failed = { n: 0, until: 0 };
      u.pass = hash(u.email, newPassword); saveUsers(l);
      return { ok: true };
    },
    deleteAccount() {
      const u = this.user(); if (!u) return;
      saveUsers(users().filter((x) => x.id !== u.id));
      VD.local.remove(`vivadia:data:${u.id}`);
      this.logout();
    },
    blocked() {
      VD.ui.toast('Modo visitante: só visualização', { icon: 'visibility', kind: 'warn', sub: 'Crie uma conta grátis para salvar e usar tudo.', ms: 3800 });
    },
  };
})(window.VD);

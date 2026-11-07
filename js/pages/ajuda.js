/* Tela: Ajuda e contatos de emergência */
(function (VD) {
  const { ic, esc } = VD;
  const S = VD.store;
  let speaking = false;

  VD.pages.ajuda = () => {
    const cg = S.caregiver;
    const contact = (c) => {
      const initial = VD.initial(c.name.replace(/^(Dr\.|Dona)\s+/, ''));
      return `<article class="card stack">
        <div class="row"><div class="contact-av" aria-hidden="true">${initial}</div>
          <div style="min-width:0">${c.id === cg.id ? '<span class="tag">Principal</span>' : ''}
            <h3 class="t-h3 trunc">${esc(c.name)}</h3><p class="t-md muted" style="font-weight:600">${esc(c.role)}</p>
            ${c.phone && !c.neighbor ? `<p class="t-time-m c-teal" style="letter-spacing:.02em">${esc(c.phone)}</p>` : `<p class="t-bold c-teal">Disponível no prédio</p>`}</div></div>
        <div class="stack">
          <a class="btn lg ${c.id === cg.id ? 'btn-primary' : 'btn-softteal'}" href="tel:${c.tel}" data-act="callLog" data-name="${esc(c.name)}">${ic(c.clinic ? 'local_hospital' : c.neighbor ? 'door_front' : 'phone', { fill: true, size: 1.75 })}<span>Ligar Agora</span></a>
          ${c.wa ? `<a class="btn lg btn-wa" href="https://wa.me/${c.wa}" target="_blank" rel="noopener">${ic('chat', { size: 1.75 })}<span>Conversar no WhatsApp</span></a>` : ''}
        </div></article>`;
    };
    const cgFirst = cg.name.split(' ')[0];
    const faq = VD.FAQ.map((f) => ({ ...f, a: f.a.replace(/\{cg\}/g, esc(cgFirst)) })).map((f) => `<details class="faq"><summary><div class="iconchip sm round" style="background:var(--container-high);color:var(--teal)">${ic(f.icon)}</div><span>${f.q}</span>${ic('expand_more', { cls: 'chev' })}</summary>
      <div class="answer"><p class="t-md">${f.a}</p>${f.phone ? `<a class="btn btn-softteal" href="tel:${f.phone.tel}">${ic('headset_mic')}<span>${f.phone.label}</span></a>` : ''}</div></details>`).join('');

    return {
      tab: 'ajuda',
      title: 'Ajuda',
      html: ` <div class="page">
        <section class="card stack" style="border-color:transparent">
          <div class="row start"><div class="iconchip round" style="background:var(--accent);color:#fff">${ic('volume_up')}</div>
            <div><h3 class="t-h3" style="color:#341100">Prefere ouvir as instruções?</h3><p class="t-md" style="color:#783100">Toque abaixo e o assistente lê as orientações desta tela em voz alta.</p></div></div>
          <button class="btn btn-accent" id="audioBtn" data-act="audio">${ic(speaking ? 'stop_circle' : 'play_circle', { size: 1.75 })}<span id="audioLabel">${speaking ? 'Parar áudio' : 'Ouvir instruções por voz'}</span></button>
        </section>
        <div class="stack-xs"><div class="row" style="gap:.5rem">${ic('health_and_safety', { fill: true, size: 2, cls: 'c-primary' })}<h1 class="t-h1 c-primary">Central de Ajuda e Apoio</h1></div>
          <p class="t-lg muted">Precisa de auxílio ou companhia? Escolha uma opção com apenas um toque.</p></div>
           <button class="btn lg btn-accent" data-act="askHelp">${ic('notifications_active', { fill: true, size: 1.75 })}<span>Avisar ${esc(cgFirst)} que preciso de ajuda</span></button>
        <section class="sos" aria-labelledby="sos-t">
          <div class="row"><div class="iconchip round lg">${ic('emergency_home', { fill: true, size: 2 })}</div>
            <div><h2 class="t-h3" id="sos-t" style="color:var(--error-text)">Emergência Médica</h2><p class="t-md" style="color:var(--error-text);font-weight:600">Atendimento rápido 24 horas</p></div></div>
          <a class="btn xl btn-danger" href="tel:192" data-act="samu" aria-label="Ligar para o SAMU, número 192">${ic('call', { fill: true, size: 2.25 })}<span>LIGAR SAMU (192)</span></a>
        </section>
        <section class="stack contacts"><div class="section-head"><h2 class="t-h2 row" style="gap:.4rem">${ic('groups', { cls: 'c-teal', size: 1.9 })}Pessoas de Confiança</h2><span class="pill-info">${VD.CONTACTS.length} contatos</span></div>
          ${VD.CONTACTS.map(contact).join('')}</section>
        <section class="stack"><h2 class="t-h2 row" style="gap:.4rem">${ic('help', { cls: 'c-teal', size: 1.9 })}Dúvidas Frequentes</h2>${faq}</section>
      </div>`,
      cleanup() { speaking = false; VD.ui.speech.stop(); },
    };
  };

  // Ligações de emergência/contato nunca são bloqueadas nem atrasadas: o aviso ao familiar é só um extra (respeita a opção em Ajustes)
  const tellFamily = (reason) => {
    if (VD.auth.isGuest() || !S.settings.notifyFamily) return;
    S.notifyFamily(reason);
    VD.ui.toast('Ligando...', { icon: 'call', sub: `${S.caregiver.name.split(' ')[0]} será avisado(a) desta ligação.`, ms: 3500 });
  };
  VD.on('samu', () => { VD.vibrate([200, 100, 200]); tellFamily('Ligou para o SAMU (192)'); });
  VD.on('callLog', (el) => { tellFamily(`Ligou para ${el.dataset.name}`); });
  VD.on('askHelp', async () => {
    const cg = S.caregiver, first = cg.name.split(' ')[0];
    const ok = await VD.ui.confirmDialog({ title: 'Pedir ajuda', text: `Avisar ${first} agora?`, sub: `${first} receberá uma mensagem dizendo que você precisa de apoio.`, yes: 'Sim, avisar', no: 'Não avisar', icon: 'notifications_active' });
    if (ok) { S.notifyFamily('Pedido de ajuda'); VD.ui.toast('Mensagem enviada!', { kind: 'ok', icon: 'mark_chat_read', sub: `${first} recebeu o seu pedido de ajuda.` }); }
  });
  VD.on('audio', () => {
    const label = document.getElementById('audioLabel');
    if (!VD.ui.speech.supported) { VD.ui.toast('Seu aparelho não tem leitura em voz', { icon: 'volume_off', kind: 'warn' }); return; }
    if (speaking) { VD.ui.speech.stop(); speaking = false; if (label) label.textContent = 'Ouvir novamente por voz'; return; }
    VD.ui.speech.speak(VD.audioGuide(S.caregiver.name.split(' ')[0]), { onstart() { speaking = true; if (label) label.textContent = 'Parar áudio'; }, onend() { speaking = false; const l = document.getElementById('audioLabel'); if (l) l.textContent = 'Ouvir novamente por voz'; } });
  });
})(window.VD);
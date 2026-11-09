/* Telas: Atividades Mentais e jogos (memória, atenção, palavras, raciocínio) */
(function (VD) {
  const { ic, esc, $ } = VD;
  const S = VD.store;

  VD.pages.mental = () => {
    const td = VD.today();
    const planned = S.dayTasks(td).find((t) => t.activityId);
    const act = planned && VD.ACTIVITIES.find((a) => a.id === planned.activityId);
    const played = S.state.activityLog.filter((l) => l.date === td).length;
    const cg = S.caregiver ? S.caregiver.name.split(' ')[0] : 'Sua família';

    const card = (a) => {
      const isPlanned = planned && planned.activityId === a.id;
      return `<article class="card stack">
        <div class="row"><div class="iconchip lg ${isPlanned ? '' : 'cat-med'}" style="${isPlanned ? 'background:var(--teal-fixed);color:var(--primary)' : ''}">${ic(a.icon, { fill: true, size: 2 })}</div>
          <div><h3 class="t-h3">${a.title}</h3><span class="t-small muted row" style="gap:.3rem">${ic('timer', { size: 1.2 })}${a.minutes} minutos</span></div></div>
        <p class="t-md muted">${a.desc}</p>
        <div class="emoji-strip" aria-hidden="true">${a.strip}</div>
        ${isPlanned ? `<div class="row" style="background:var(--teal-tint);padding:.6rem .8rem;border-radius:1rem">${ic('event_available', { fill: true, cls: 'c-teal' })}<span class="t-small c-teal">Programado para hoje às ${planned.time}</span></div>` : ''}
        <button class="btn lg ${isPlanned ? 'btn-primary' : 'btn-soft'}" style="margin-top:auto" data-act="playActivity" data-id="${a.id}">${ic('play_arrow', { fill: true })}<span>${a.cta}</span></button>
      </article>`;
    };

    return {
      tab: 'hoje',
      title: 'Atividades Mentais',
      back: true,
      html: `<div class="page">
        <div class="stack-xs">
          <span class="pill-info" style="align-self:flex-start;background:var(--teal-fixed);color:var(--primary)">${ic('psychology', { fill: true })}<span class="upper">Estímulo cognitivo</span></span>
          <h1 class="t-h1 c-primary">Atividades Mentais</h1>
          <p class="t-md muted">Exercícios divertidos para manter a mente ativa e afiada todos os dias.</p>
        </div>
        ${act ? `<section class="card accent-left teal stack" aria-labelledby="today-t">
          <div class="row between wrap"><span class="t-small upper c-primary">Planejada para hoje</span>${VD.ui.statusBadge(planned.status, planned.status === 'done' ? { label: `Feita ${planned.doneAt || ''}` } : { label: `Às ${planned.time} • ${planned.status === 'snoozed' ? 'Adiada' : 'Pendente'}` })}</div>
          <div class="emoji-strip" style="font-size:2.8rem;padding:1.1rem" aria-hidden="true">🍎 🍌 🍇 🍊 🌻 🌷</div>
          <div><h2 class="t-h2" id="today-t">${act.title}: Cores do Dia</h2><p class="t-md muted mt-xs">Encontre os pares iguais para treinar a atenção e a lembrança recente.</p></div>
          <button class="btn xl btn-accent" data-act="playActivity" data-id="${act.id}">${ic('play_circle', { fill: true, size: 2 })}<span>${planned.status === 'done' ? 'JOGAR DE NOVO' : 'COMEÇAR AGORA'}</span></button>
          <p class="t-md muted center row" style="justify-content:center;gap:.4rem">${ic('volunteer_activism', { cls: 'c-teal', size: 1.3 })}Pode fazer no seu tempo, sem pressa.</p>
        </section>` : ''}
        <section class="stack" aria-labelledby="cats"><div class="section-head"><h2 class="t-h3" id="cats">Escolha por categoria</h2><span class="t-small c-teal">${VD.ACTIVITIES.length} opções</span></div>
          <div class="mental-cols">${VD.ACTIVITIES.map(card).join('')}</div></section>
        <aside class="card tint stack">
          <div class="row start"><div class="iconchip round" style="background:var(--green-soft);color:#004716">${ic('favorite', { fill: true, size: 1.75 })}</div>
            <div><h4 class="t-h3">Cuidado diário</h4><p class="t-md muted">Treinar a mente por apenas 5 a 10 minutos ao dia estimula a memória e o bem-estar. ${played ? `Hoje você já jogou ${played} vez${played > 1 ? 'es' : ''}!` : ''}</p></div></div>
          <div class="row" style="background:#fff;padding:.75rem;border-radius:1rem">${ic('family_restroom', { cls: 'c-teal' })}<p class="t-md">Seu progresso é salvo e compartilhado com <b class="c-teal">${esc(cg)}</b>.</p></div>
        </aside>
      </div>`,
    };
  };

  /* ---------------- fim de jogo ---------------- */
  function finishGame(id, score, summary) {
    S.logActivity({ id, score });
    const linked = S.dayTasks(VD.today()).find((t) => t.activityId === id && t.status !== 'done');
    if (linked) S.complete(linked.key);
    const cg = S.caregiver ? S.caregiver.name.split(' ')[0] : 'Sua família';
    const stars = score >= 90 ? 3 : score >= 60 ? 2 : 1;
    VD.ui.beep(2, false);
    VD.ui.openOverlay(`
      <div class="center stack" style="align-items:center">
        <div class="stars" aria-label="${stars} de 3 estrelas">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <h2 class="t-h1">Muito bem!</h2>
        <p class="t-lg muted">${summary}</p>
        ${linked ? `<span class="badge done">${ic('check_circle')}<span>Atividade de hoje marcada como feita</span></span>` : ''}
        <p class="t-md muted">${esc(cg)} vai ver o seu progresso. 💙</p>
      </div>
      <div class="stack">
        <button class="btn lg btn-primary" data-again>${ic('replay')}<span>Jogar de novo</span></button>
        <button class="btn lg btn-soft" data-back>${ic('arrow_back')}<span>Voltar às atividades</span></button>
      </div>`, {
      dismissable: false,
      onMount(ov, close) {
        ov.querySelector('[data-again]').addEventListener('click', () => { close(); VD.render(); });
        ov.querySelector('[data-back]').addEventListener('click', () => { close(); VD.go('/mental'); });
      },
    });
  }

  const shell = (title, sub, inner) => `<div class="page game" data-no-rerender>
    <div class="stack-xs"><h1 class="t-h1">${title}</h1><p class="t-md muted">${sub}</p></div>${inner}
    <p class="t-md muted center">Sem pressa. Você pode sair a qualquer momento.</p></div>`;

  /* ---------------- Jogo 1: memória ---------------- */
  function memoria() {
    return {
      title: 'Jogo de memória', back: true,
      html: shell('Jogo de memória', 'Toque nas cartas e encontre os pares iguais.', `
        <div class="card flat row between"><span class="t-bold">Pares: <span id="m-pairs">0</span>/6</span><span class="t-bold">Jogadas: <span id="m-moves">0</span></span></div>
        <div class="mem-grid" id="m-grid" role="group" aria-label="Cartas do jogo"></div>`),
      mount(root) {
        const cards = VD.shuffle([...VD.MEMORY_EMOJIS, ...VD.MEMORY_EMOJIS]);
        const grid = $('#m-grid', root);
        let first = null, lock = false, pairs = 0, moves = 0;
        grid.innerHTML = cards.map((e, i) => `<button class="mem-card" data-i="${i}" aria-label="Carta ${i + 1} virada para baixo">${ic('help', { fill: true })}</button>`).join('');
        grid.addEventListener('click', (ev) => {
          const b = ev.target.closest('.mem-card');
          if (!b || lock || b.classList.contains('up') || b.classList.contains('matched')) return;
          const i = +b.dataset.i;
          b.classList.add('up'); b.innerHTML = cards[i]; b.setAttribute('aria-label', 'Carta ' + cards[i]);
          if (first === null) { first = i; return; }
          moves++; $('#m-moves', root).textContent = moves;
          const a = grid.children[first], c = b;
          if (cards[first] === cards[i]) {
            a.classList.add('matched'); c.classList.add('matched'); pairs++; first = null;
            $('#m-pairs', root).textContent = pairs;
            VD.vibrate(30);
            if (pairs === 6) setTimeout(() => finishGame('memoria', Math.max(40, Math.round(100 - (moves - 6) * 6)), `Você achou todos os pares em ${moves} jogadas.`), 500);
          } else {
            lock = true;
            setTimeout(() => { [a, c].forEach((x) => { x.classList.remove('up'); x.innerHTML = ic('help', { fill: true }); x.setAttribute('aria-label', 'Carta virada para baixo'); }); first = null; lock = false; }, 900);
          }
        });
      },
    };
  }

  /* ---------------- Jogo 2: atenção (3 diferenças) ---------------- */
  function atencao() {
    return {
      title: 'Atenção e Foco', back: true,
      html: shell('Ache as 3 diferenças', 'Toque, no jardim da direita, no que está diferente do da esquerda.', `
        <div class="card flat row between"><span class="t-bold">Rodada <span id="a-round">1</span>/2</span><span class="t-bold">Achadas: <span id="a-found">0</span>/3</span></div>
        <div class="pair-wrap"><div><p class="t-small muted" style="margin-bottom:.3rem">Jardim de referência</p><div class="egrid" id="a-left" aria-hidden="true"></div></div>
        <div><p class="t-small muted" style="margin-bottom:.3rem">Toque aqui nas diferenças</p><div class="egrid" id="a-right"></div></div></div>
        <button class="btn btn-softteal" id="a-hint">${ic('lightbulb')}<span>Preciso de uma dica</span></button>`),
      mount(root) {
        let round = 0, errors = 0, found = new Set(), diffs = [], base = [], alt = [];
        const left = $('#a-left', root), right = $('#a-right', root);
        function setup() {
          const pool = VD.ATTENTION_POOL;
          base = Array.from({ length: 16 }, () => pool[Math.floor(Math.random() * pool.length)]);
          diffs = VD.shuffle([...Array(16).keys()]).slice(0, 3);
          alt = base.slice();
          diffs.forEach((i) => { const others = pool.filter((p) => p !== base[i]); alt[i] = others[Math.floor(Math.random() * others.length)]; });
          found = new Set();
          $('#a-round', root).textContent = round + 1; $('#a-found', root).textContent = 0;
          left.innerHTML = base.map((e) => `<span>${e}</span>`).join('');
          right.innerHTML = alt.map((e, i) => `<button data-i="${i}" aria-label="Figura ${i + 1}">${e}</button>`).join('');
        }
        right.addEventListener('click', (ev) => {
          const b = ev.target.closest('button'); if (!b) return;
          const i = +b.dataset.i;
          if (found.has(i)) return;
          if (diffs.includes(i)) {
            found.add(i); b.classList.add('found'); $('#a-found', root).textContent = found.size;
            VD.ui.toast('Achou!', { kind: 'ok', ms: 1200 });
            if (found.size === 3) {
              round++;
              if (round === 2) setTimeout(() => finishGame('atencao', Math.max(40, 100 - errors * 10), `Você achou todas as diferenças${errors ? ` (com ${errors} tentativa${errors > 1 ? 's' : ''} a mais)` : ' sem errar nenhuma'}.`), 500);
              else setTimeout(() => { VD.ui.toast('Próxima rodada!', { icon: 'arrow_forward', ms: 1500 }); setup(); }, 700);
            }
          } else {
            errors++; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 400);
          }
        });
        $('#a-hint', root).addEventListener('click', () => {
          const pending = diffs.filter((i) => !found.has(i)); if (!pending.length) return;
          const el = right.children[pending[0]]; el.style.outline = '4px dashed var(--accent-bright)'; setTimeout(() => { el.style.outline = ''; }, 1600);
          errors++;
        });
        setup();
      },
    };
  }

  /* ---------------- Jogo 3: caça-palavras ---------------- */
  function palavras() {
    return {
      title: 'Palavras', back: true,
      html: shell('Caça-palavras', 'Toque na primeira letra da palavra e depois na última.', `
        <div class="card flat stack"><span class="t-bold">Ache as palavras:</span><div class="words" id="w-list"></div></div>
        <div class="wgrid" id="w-grid" role="group" aria-label="Grade de letras"></div>
        <button class="btn btn-soft" id="w-clear">${ic('backspace')}<span>Limpar seleção</span></button>`),
      mount(root) {
        const { size, words, filler } = VD.WORDSEARCH;
        const grid = Array.from({ length: size }, () => Array(size).fill(''));
        words.forEach(([w, r, c, dr, dc]) => { for (let i = 0; i < w.length; i++) grid[r + dr * i][c + dc * i] = w[i]; });
        let k = 0;
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = filler[k++ % filler.length];
        const list = words.map((x) => x[0]);
        const foundWords = new Set(); let start = null; let wrong = 0;
        const g = $('#w-grid', root);
        $('#w-list', root).innerHTML = list.map((w) => `<span data-w="${w}">${w}</span>`).join('');
        g.innerHTML = grid.flatMap((row, r) => row.map((ch, c) => `<button data-r="${r}" data-c="${c}" aria-label="Letra ${ch}">${ch}</button>`)).join('');
        const cell = (r, c) => g.children[r * size + c];
        const clear = () => { if (start) cell(start.r, start.c).classList.remove('start'); start = null; };
        $('#w-clear', root).addEventListener('click', clear);
        g.addEventListener('click', (ev) => {
          const b = ev.target.closest('button'); if (!b) return;
          const r = +b.dataset.r, c = +b.dataset.c;
          if (!start) { start = { r, c }; b.classList.add('start'); return; }
          const dr = Math.sign(r - start.r), dc = Math.sign(c - start.c);
          const len = Math.max(Math.abs(r - start.r), Math.abs(c - start.c)) + 1;
          const straight = r === start.r || c === start.c || Math.abs(r - start.r) === Math.abs(c - start.c);
          const cells = []; let s = '';
          if (straight) for (let i = 0; i < len; i++) { cells.push(cell(start.r + dr * i, start.c + dc * i)); s += grid[start.r + dr * i][start.c + dc * i]; }
          const rev = s.split('').reverse().join('');
          const hit = list.find((w) => (w === s || w === rev) && !foundWords.has(w));
          if (straight && hit) {
            foundWords.add(hit); cells.forEach((x) => x.classList.add('found'));
            $(`#w-list [data-w="${hit}"]`, root).classList.add('found');
            VD.ui.toast(`Achou: ${hit}`, { kind: 'ok', ms: 1400 });
            clear();
            if (foundWords.size === list.length) setTimeout(() => finishGame('palavras', Math.max(40, 100 - wrong * 8), 'Você achou todas as palavras.'), 500);
          } else { wrong++; clear(); VD.ui.toast('Quase! Tente outra vez.', { icon: 'sentiment_neutral', ms: 1400 }); }
        });
      },
    };
  }

  /* ---------------- Jogo 4: raciocínio ---------------- */
  function raciocinio() {
    return {
      title: 'Raciocínio', back: true,
      html: shell('Raciocínio', 'Escolha a resposta que parece certa. Sem pressa!', `<div class="card stack" id="r-box"></div>`),
      mount(root) {
        let i = 0, right = 0;
        const box = $('#r-box', root);
        const show = () => {
          const q = VD.RIDDLES[i];
          box.innerHTML = `<div class="row between"><span class="t-small muted">Pergunta ${i + 1} de ${VD.RIDDLES.length}</span><span class="t-small c-green">${right} certas</span></div>
            <h2 class="t-h2">${esc(q.q)}</h2>
            <div class="options">${q.opts.map((o, n) => `<button class="option" data-n="${n}"><span class="iconchip sm" style="background:var(--teal-tint);color:var(--teal)">${'ABC'[n]}</span>${esc(o)}</button>`).join('')}</div>
            <button class="btn btn-softteal" id="r-hint">${ic('lightbulb')}<span>Dica</span></button><p class="t-md c-accent" id="r-hinttext" hidden>💡 ${esc(q.hint)}</p>`;
          $('#r-hint', box).addEventListener('click', () => { $('#r-hinttext', box).hidden = false; });
          let locked = false;
          box.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => {
            if (locked) return; locked = true;
            const n = +b.dataset.n, ok = n === q.a;
            b.classList.add(ok ? 'right' : 'wrong');
            if (!ok) box.querySelectorAll('.option')[q.a].classList.add('right');
            if (ok) right++;
            VD.ui.toast(ok ? 'Muito bem!' : 'Quase! A resposta certa está em verde.', { kind: ok ? 'ok' : '', icon: ok ? 'check_circle' : 'lightbulb', ms: 1500 });
            setTimeout(() => { i++; if (i < VD.RIDDLES.length) show(); else finishGame('raciocinio', Math.round((right / VD.RIDDLES.length) * 100), `Você acertou ${right} de ${VD.RIDDLES.length} perguntas.`); }, 1500);
          }));
        };
        show();
      },
    };
  }

  const GAMES = { memoria, atencao, palavras, raciocinio };
  VD.pages.jogo = (id) => (GAMES[id] || memoria)();
})(window.VD);
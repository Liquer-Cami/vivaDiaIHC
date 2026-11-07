/* VivaDia — dados mockados (tudo fictício). Edite aqui para mudar a demonstração. */
window.VD = window.VD || {};

(function (VD) {
  /** Categorias de tarefa: ícone, rótulo e grupo do filtro da agenda */
  VD.CATEGORIES = {
    med:      { label: 'Medicamento',     icon: 'medication',      group: 'med' },
    consulta: { label: 'Consulta médica', icon: 'medical_services', group: 'med' },
    food:     { label: 'Alimentação',     icon: 'restaurant',      group: 'food' },
    exercise: { label: 'Exercício',       icon: 'directions_walk', group: 'exercise' },
    mind:     { label: 'Atividade Mental', icon: 'psychology',     group: 'mind' },
  };

  VD.USER = { name: 'Helena' };

  VD.CONTACTS = [
    { id: 'c1', name: 'Carla Silveira', role: 'Filha • Cuidadora', short: 'Filha (Cuidadora principal)', phone: '(11) 98765-4321', tel: '11987654321', wa: '5511987654321', main: true },
    { id: 'c2', name: 'Dr. Eduardo Moreira', role: 'Médico', short: 'Cardiologista', phone: '(11) 3245-1200', tel: '1132451200', clinic: true },
    { id: 'c3', name: 'Dona Maria', role: 'Vizinha', short: 'Vizinha', phone: '(11) 97123-9876', tel: '11971239876', neighbor: true },
  ];

  VD.MEDS = [
    { id: 'm1', name: 'Metformina 500mg', dose: '1 comprimido', form: 'Comprimido oral', instructions: ['Tomar com água após o café da manhã.', 'Caixa branca guardada na cozinha, ao lado do açucareiro.', 'Em caso de enjoo, avisar a família.'], stock: 18 },
    { id: 'm2', name: 'Losartana Potássica 50mg', dose: '1 comprimido', form: 'Comprimido oral', instructions: ['Tomar com meio copo de água após o almoço.', 'Caixa azul guardada na gaveta da cabeceira.', 'Em caso de tontura, sentar e acionar a família.'], stock: 12 },
    { id: 'm3', name: 'Vitamina D 2.000 UI', dose: '1 cápsula', form: 'Cápsula', instructions: ['Tomar antes do jantar.', 'Frasco guardado na prateleira da sala.'], stock: 25 },
  ];

  /**
   * Modelos de tarefas (recorrentes). days: null = todos os dias, ou lista de 0 (dom) a 6 (sáb).
   * date: tarefa de um dia só.
   */
  VD.templatesSeed = (todayIso) => [
    { id: 't1', time: '07:30', category: 'food', title: 'Café da manhã', desc: 'Café com leite, 2 torradas integrais e mamão.' },
    { id: 't2', time: '08:00', category: 'med', medId: 'm1', title: 'Medicamento da manhã', desc: 'Tomar 1 comprimido com água após o café.' },
    { id: 't3', time: '12:30', category: 'food', title: 'Almoço', desc: 'Arroz, feijão, frango grelhado e salada de legumes cozidos.' },
    { id: 't4', time: '14:00', category: 'med', medId: 'm2', title: 'Medicamento de pressão', desc: 'Tomar 1 comprimido com meio copo de água após o almoço.' },
    { id: 't5', time: '16:00', category: 'exercise', title: 'Caminhada guiada', desc: '20 minutos no jardim ou calçada plana, com tênis confortável.' },
    { id: 't6', time: '17:00', category: 'mind', activityId: 'memoria', title: 'Jogo de memória', desc: 'Jogo de 5 minutos no aplicativo. Sem pressa!' },
    { id: 't7', time: '19:00', category: 'med', medId: 'm3', title: 'Vitamina D', desc: 'Tomar 1 cápsula antes do jantar.' },
    { id: 't8', time: '19:30', category: 'food', title: 'Jantar leve', desc: 'Sopa de mandioquinha com legumes ou omelete simples.' },
    { id: 't9', time: '21:00', category: 'food', title: 'Chá calmante', desc: 'Infusão morna de camomila com melissa para dormir bem.' },
    { id: 't10', time: '15:00', category: 'consulta', date: VD.addDays(todayIso, 1), title: 'Dr. Eduardo (Cardiologista)', desc: 'Clínica São Marcos - Sala 204.', note: 'Levar os últimos exames de sangue impressos.' },
  ];

  /** Perguntas frequentes. {cg} vira o primeiro nome do familiar escolhido em Ajustes (não fica preso a uma pessoa). */
  VD.FAQ = [
    { icon: 'format_size', q: 'Como aumentar o tamanho da letra?', a: 'No topo direito de qualquer tela, toque no botão <b>A+</b> e as letras aumentam na hora. Também dá para escolher em <b>Ajustes</b>: toque no círculo com a sua inicial (e uma engrenagem) no topo, ou no botão <b>Ajustes</b> da tela Hoje.' },
    { icon: 'medication', q: 'Como avisar que já tomei meu medicamento?', a: 'Abra a aba <b>Medicamentos</b> no menu de baixo e toque no grande botão <b>JÁ TOMEI</b>. Se a opção estiver ligada em Ajustes, {cg} recebe a confirmação.' },
    { icon: 'add_circle', q: 'Como cadastrar um medicamento novo?', a: 'Na aba <b>Medicamentos</b>, toque em <b>Adicionar Medicamento</b>. Só o nome e um horário são obrigatórios. Os lembretes diários são criados sozinhos.' },
    { icon: 'event', q: 'Como criar um lembrete (consulta, água, caminhada)?', a: 'Na aba <b>Agenda</b>, toque em <b>Adicionar Novo Lembrete</b>, escolha o dia, a hora e o tipo. Depois toque em <b>Salvar lembrete</b>.' },
    { icon: 'undo', q: 'Marquei sem querer. Como desfazer?', a: 'Logo depois de marcar, toque em <b>Desfazer</b> no aviso que aparece na tela. Se o aviso já sumiu, toque no item para abrir os detalhes e use o botão <b>Desfazer</b>.' },
    { icon: 'delete', q: 'Como remover um lembrete ou um medicamento?', a: 'Toque no item para abrir os detalhes e use o botão vermelho <b>Remover</b>. O app sempre pergunta antes de apagar.' },
    { icon: 'warning', q: 'Esqueci se tomei ou tenho dúvida na dose. O que faço?', a: 'Não tome outra dose por conta própria. Ligue para {cg} ou para o seu médico. Se estiver passando mal, ligue agora para o SAMU.', phone: { tel: '192', label: 'Ligar SAMU (192)' } },
  ];

  /** Texto lido em voz alta na tela de Ajuda — segue a ordem real da tela e usa os contatos cadastrados */
  VD.audioGuide = (cg) => `Você está na Central de Ajuda do VivaDia. Primeiro, há um botão para avisar ${cg} de que você precisa de ajuda. Logo abaixo está o botão vermelho grande para ligar direto para o SAMU, número 192. Depois estão os seus contatos de confiança: ${VD.CONTACTS.map((c) => `${c.name}, ${c.role.replace('•', 'e')}`).join('; ')}. Em cada um, toque em Ligar Agora para telefonar.`;

  /* ---------- Atividades mentais ---------- */
  VD.ACTIVITIES = [
    { id: 'memoria', title: 'Jogo de memória', cat: 'Memória', icon: 'style', desc: 'Guarde imagens e encontre os pares no seu ritmo, exercitando o foco.', cta: 'Jogar Memória', strip: '🍎 🍌 🍇', minutes: 5 },
    { id: 'atencao', title: 'Atenção e Foco', cat: 'Atenção', icon: 'travel_explore', desc: 'Ache as 3 diferenças entre os dois jardins.', cta: 'Explorar Atenção', strip: '🌻 🌷 🦋', minutes: 5 },
    { id: 'palavras', title: 'Palavras', cat: 'Palavras', icon: 'spellcheck', desc: 'Caça-palavras fácil com letras grandes e temas do dia a dia.', cta: 'Explorar Palavras', strip: 'F L O R', minutes: 5 },
    { id: 'raciocinio', title: 'Raciocínio', cat: 'Raciocínio', icon: 'extension', desc: 'Sequências lógicas e charadas divertidas do cotidiano.', cta: 'Explorar Raciocínio', strip: '2 · 4 · 6 · ?', minutes: 5 },
  ];

  VD.MEMORY_EMOJIS = ['🍎', '🍌', '🍇', '🍊', '🌻', '🌷'];
  VD.ATTENTION_POOL = ['🌻', '🌷', '🌼', '🌳', '🦋', '🐝', '🍄', '🌿'];
  VD.WORDSEARCH = {
    size: 6,
    // [palavra, linha, coluna, passo na linha, passo na coluna]
    words: [['FLOR', 0, 0, 0, 1], ['SOL', 2, 1, 0, 1], ['CAFE', 0, 5, 1, 0], ['LUA', 5, 0, 0, 1]],
    filler: 'MPTDNRBGVHIEUAOSCMLRTNPDEG',
  };
  VD.RIDDLES = [
    { q: 'Qual número continua a sequência?  2 · 4 · 6 · ?', opts: ['7', '8', '9'], a: 1, hint: 'Vai de dois em dois.' },
    { q: 'Manhã, tarde, … O que vem depois?', opts: ['Almoço', 'Noite', 'Ontem'], a: 1, hint: 'Pense nas partes do dia.' },
    { q: 'Qual destes NÃO é uma fruta?', opts: ['Banana', 'Cadeira', 'Uva'], a: 1, hint: 'Uma delas não se come.' },
    { q: 'Qual número falta?  10 · 20 · ? · 40', opts: ['25', '30', '35'], a: 1, hint: 'Vai de dez em dez.' },
    { q: 'O que usamos para ver as horas?', opts: ['Relógio', 'Escova', 'Colher'], a: 0, hint: 'Ele tem ponteiros.' },
  ];

})(window.VD);
/* VivaDia — dados mockados (tudo fictício). Edite aqui para mudar a demonstração. */
window.VD = window.VD || {};

(function (VD) {
  /** Categorias de tarefa: ícone, rótulo e grupo do filtro da agenda */
  VD.CATEGORIES = {
    med:      { label: 'Medicamento',     icon: 'medication',      group: 'med' },
    consulta: { label: 'Consulta médica', icon: 'medical_services', group: 'med' },
    food:     { label: 'Alimentação',     icon: 'restaurant',      group: 'food' },
    exercise: { label: 'Exercício',       icon: 'directions_walk', group: 'exercise' },
  };

  VD.USER = { name: 'Helena' };

  VD.CONTACTS = [
    { id: 'c1', name: 'Carla Silveira', role: 'Filha • Cuidadora', short: 'Filha (Cuidadora principal)', phone: '(11) 98765-4321', tel: '11987654321', wa: '5511987654321', main: true },
    { id: 'c2', name: 'Dr. Eduardo Moreira', role: 'Médico Cardiologista', short: 'Cardiologista', phone: '(11) 3245-1200', tel: '1132451200', clinic: true },
    { id: 'c3', name: 'Dona Maria', role: 'Vizinha (Apartamento 42)', short: 'Vizinha', phone: '(11) 97123-9876', tel: '11971239876', neighbor: true },
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
    { id: 't2', time: '08:00', category: 'med', medId: 'm1', title: 'Remédio da manhã', desc: 'Tomar 1 comprimido com água após o café.' },
    { id: 't3', time: '12:30', category: 'food', title: 'Almoço', desc: 'Arroz, feijão, frango grelhado e salada de legumes cozidos.' },
    { id: 't4', time: '14:00', category: 'med', medId: 'm2', title: 'Remédio de pressão', desc: 'Tomar 1 comprimido com meio copo de água após o almoço.' },
    { id: 't5', time: '16:00', category: 'exercise', title: 'Caminhada guiada', desc: '20 minutos no jardim ou calçada plana, com tênis confortável.' },
    { id: 't7', time: '19:00', category: 'med', medId: 'm3', title: 'Vitamina D', desc: 'Tomar 1 cápsula antes do jantar.' },
    { id: 't8', time: '19:30', category: 'food', title: 'Jantar leve', desc: 'Sopa de mandioquinha com legumes ou omelete simples.' },
    { id: 't9', time: '21:00', category: 'food', title: 'Chá calmante', desc: 'Infusão morna de camomila com melissa para dormir bem.' },
    { id: 't10', time: '15:00', category: 'consulta', date: VD.addDays(todayIso, 1), title: 'Dr. Eduardo (Cardiologista)', desc: 'Clínica São Marcos - Sala 204.', note: 'Levar os últimos exames de sangue impressos.' },
  ];

  VD.FAQ = [
    { icon: 'format_size', q: 'Como aumentar o tamanho da letra?', a: 'No topo direito de qualquer tela, procure o botão <b>A- A+</b>. Toque no <b>A+</b> para as letras aumentarem na hora. Também dá para escolher em <b>Preferências</b> (toque na sua foto no topo).' },
    { icon: 'medication', q: 'Como avisar que já tomei meu remédio?', a: 'Vá até a tela <b>Hoje</b> no menu de baixo. No cartão do remédio, aperte o grande botão verde <b>FEITO</b>. Sua filha Carla recebe a confirmação!' },
  ];

  VD.AUDIO_GUIDE = 'Você está na Central de Ajuda VivaDia. No topo da tela há um botão vermelho grande para ligar direto para o SAMU, número 192. Logo abaixo estão os telefones da sua filha Carla, do seu cardiologista Doutor Eduardo e da sua vizinha Dona Maria. Toque no botão para ligar.';

})(window.VD);

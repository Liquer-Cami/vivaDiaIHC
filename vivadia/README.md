# VivaDia — Sua rotina. Seu cuidado. Sua autonomia.

App de rotina para idosos feito só com **HTML, CSS e JavaScript puros**. Sem build, sem npm, sem internet.
Todos os dados são **mockados** (ficam em `js/data.js`) e as alterações são salvas no `localStorage` do navegador.

## Como abrir
Dê duplo clique em `index.html`. Pronto.
(Opcional, se preferir um servidor: `python3 -m http.server 8000` e abra http://localhost:8000)

Dica: no computador, aperte F12 e ative o modo celular para ver como no telefone.

## Telas e o que funciona em cada uma
| Tela | Rota | O que dá para fazer |
|---|---|---|
| Hoje | `#/hoje` | Progresso do dia, próxima atividade (FEITO / ADIAR 10 min), lista do dia (toque abre detalhes), atalhos para as áreas de cuidado |
| Medicamentos | `#/medicamentos` | Resumo e % do dia, JÁ TOMEI, adiar 15 min, "toque para rever" com **proteção contra dose dupla**, adicionar remédio |
| Detalhe do medicamento | `#/medicamentos/:id@data` | Como tomar, estoque (diminui ao tomar), histórico, ligar para o cuidador, desfazer, remover remédio |
| Novo remédio | `#/medicamentos/novo` | Formulário com vários horários; cria os lembretes diários automaticamente |
| Agenda semanal | `#/agenda` | Escolher o dia da semana, filtrar por tipo, marcar como feito, **criar** e excluir lembretes |
| Atividades mentais | `#/mental` | 4 jogos jogáveis: Memória, Atenção (3 diferenças), Caça-palavras e Raciocínio. Ao terminar, marca a tarefa do dia como feita |
| Ajuda e emergência | `#/ajuda` | Ligar SAMU 192, ligar/WhatsApp para contatos, pedir ajuda, **ler instruções em voz alta**, perguntas frequentes |
| Como quer ser avisado | `#/preferencias` (toque na sua inicial no topo) | Liga/desliga alertas, testar som, trocar familiar, tamanho da letra com prévia, salvar, restaurar dados de exemplo |
| Lembrete "Hora do remédio" | `#/lembrete/:id` | Tela cheia com som repetido, FEITO, ADIAR 10 min, avisar familiar |

### Lembretes automáticos
Com o app aberto, quando chega a hora de uma atividade pendente aparece o aviso em tela cheia (ou um aviso menor, se você
desligar "Aviso grande na tela"). Para ver sem esperar: Preferências → **Ver como é o aviso**.

### Acessibilidade (do DESIGN.md)
Fonte Atkinson Hyperlegible, nada abaixo de 16px, botões com 48–68px, status sempre com ícone + texto, botões **A- / A+**
no topo (3 tamanhos, tudo escala junto), contraste alto.

## Organização
```
index.html
css/style.css          tokens do design + componentes
fonts/                 fontes locais (funciona offline)
js/
  utils.js             datas, ícones, helpers
  data.js              DADOS MOCKADOS (remédios, rotina, contatos, jogos, FAQ)
  store.js             estado + persistência (localStorage) + regras (feito, adiar, estoque...)
  components.js        toast, diálogos, selos de status, som, voz
  actions.js           ações compartilhadas + folha de detalhes
  app.js               roteador (hash), cabeçalho, menu, vigia de lembretes
  pages/               uma tela por arquivo
```
Para recomeçar do zero: Preferências → Restaurar dados de exemplo (ou apague o localStorage do site).

/* =========================================================
   MEU PLANO PORTUGAL — script.js
   Estado guardado no localStorage do navegador.
   Nenhum dado é enviado para nenhum servidor.
   ========================================================= */

const STORAGE_KEY = "planoPortugalV1";

let universidadesData = [];
let profissoesData = [];
let state = null;

/* ---------- UTIL ---------- */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    perfil: {
      nome: "",
      ano: "",
      cidade: "Curitiba/PR",
      cursoAtual: "Técnico em Desenvolvimento de Sistemas",
      previsaoConclusao: "",
      notaEnem: "",
      metaEnem: "",
      orcamento: "",
      paises: "Portugal",
      areas: "Comunicação Política",
      universidadesFavoritas: []
    },
    favoritos: [],
    comparador: [],
    enemSimulacoes: [],
    financeiro: {
      mensalidade: 0,
      percentualBolsa: 0,
      parcelas: 10,
      taxas: 0,
      aluguel: 0,
      alimentacao: 0,
      transporte: 0,
      celular: 0,
      materiais: 0,
      lazer: 0,
      passagem: 0,
      reserva: 0,
      economizado: 0,
      moeda: "EUR",
      cotacao: 5.4,
      dataCotacao: ""
    },
    carreira: [
      {
        id: uid(), titulo: "2026", itens: [
          { id: uid(), texto: "Terminar Ensino Médio/Técnico", feito: false },
          { id: uid(), texto: "Melhorar desempenho no ENEM", feito: false },
          { id: uid(), texto: "Construir portfólio", feito: false },
          { id: uid(), texto: "Pesquisar Portugal", feito: false },
          { id: uid(), texto: "Pesquisar bolsas", feito: false }
        ]
      },
      {
        id: uid(), titulo: "2027", itens: [
          { id: uid(), texto: "ENEM / candidatura", feito: false },
          { id: uid(), texto: "Decidir universidade", feito: false },
          { id: uid(), texto: "Preparar documentação", feito: false },
          { id: uid(), texto: "Continuar acumulando experiência", feito: false }
        ]
      },
      {
        id: uid(), titulo: "Durante a graduação", itens: [
          { id: uid(), texto: "Estudar Comunicação/Publicidade/RP ou área relacionada", feito: false },
          { id: uid(), texto: "Buscar estágio", feito: false },
          { id: uid(), texto: "Trabalhar com comunicação institucional", feito: false },
          { id: uid(), texto: "Desenvolver portfólio", feito: false },
          { id: uid(), texto: "Participar de projetos acadêmicos", feito: false },
          { id: uid(), texto: "Aprender análise de dados, pesquisa e estratégia", feito: false }
        ]
      },
      {
        id: uid(), titulo: "Depois da graduação", itens: [
          { id: uid(), texto: "Considerar pós em Comunicação Política", feito: false },
          { id: uid(), texto: "Considerar pós em Marketing Político", feito: false },
          { id: uid(), texto: "Considerar pós em Ciência Política", feito: false },
          { id: uid(), texto: "Considerar pós em Comunicação Pública", feito: false },
          { id: uid(), texto: "Trabalhar com comunicação política", feito: false }
        ]
      }
    ],
    portfolio: [],
    projetosFuturos: [
      "Campanha política fictícia para fins acadêmicos",
      "Calendário editorial de comunicação pública",
      "Análise de comunicação de uma instituição",
      "Estratégia de redes sociais",
      "Identidade visual",
      "Roteiro de vídeo",
      "Estudo de comunicação política",
      "Análise de mídia e opinião pública"
    ].map(t => ({ id: uid(), titulo: t, descricao: "", academico: true })),
    checklist: [
      "Pesquisar universidades",
      "Comparar cursos",
      "Verificar aceitação do ENEM",
      "Verificar bolsas",
      "Verificar descontos",
      "Conferir documentação",
      "Conferir prazos",
      "Pesquisar alojamento",
      "Pesquisar custo de vida",
      "Pesquisar transporte",
      "Pesquisar seguro/saúde",
      "Verificar requisitos de visto/residência",
      "Fazer orçamento",
      "Organizar documentos",
      "Preparar candidatura",
      "Fazer matrícula",
      "Planejar viagem"
    ].map(t => ({ id: uid(), texto: t, status: "pendente", prazo: "", observacao: "", link: "", documento: "" }))
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // mescla com default para garantir que chaves novas existam
    const base = defaultState();
    return Object.assign(base, parsed);
  } catch (e) {
    console.error("Erro ao carregar dados salvos:", e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("status " + res.status);
    return await res.json();
  } catch (e) {
    console.warn("Não foi possível carregar " + path + ". Se você abriu o arquivo direto (file://), use um servidor local (veja README).", e);
    return [];
  }
}

/* ---------- ROUTING ---------- */

const VIEWS = {
  dashboard: renderDashboard,
  perfil: renderPerfil,
  enem: renderEnem,
  universidades: renderUniversidades,
  comparador: renderComparador,
  calculadora: renderCalculadora,
  carreira: renderCarreira,
  portfolio: renderPortfolio,
  profissoes: renderProfissoes,
  checklist: renderChecklist,
  dados: renderDados
};

function currentView() {
  const h = location.hash.replace("#", "");
  return VIEWS[h] ? h : "dashboard";
}

function route() {
  const view = currentView();
  document.querySelectorAll(".sidenav a").forEach(a => {
    a.classList.toggle("active", a.dataset.view === view);
  });
  const app = document.getElementById("app");
  app.innerHTML = "";
  VIEWS[view](app);
  closeMobileNav();
  window.scrollTo(0, 0);
}

function closeMobileNav() {
  document.getElementById("sidenav").classList.remove("open");
  document.getElementById("navOverlay").classList.remove("open");
}

/* ---------- DASHBOARD ---------- */

function categoryProgress() {
  const checklistDone = kw => {
    const items = state.checklist.filter(i => kw.some(k => i.texto.toLowerCase().includes(k)));
    if (items.length === 0) return 0;
    return Math.round((items.filter(i => i.status === "concluido").length / items.length) * 100);
  };

  const enem = state.perfil.metaEnem && state.enemSimulacoes.length
    ? Math.min(100, Math.round((ultimaMediaEnem() / Number(state.perfil.metaEnem)) * 100))
    : checklistDone(["enem"]);

  const universidades = Math.min(100, state.favoritos.length * 20) || checklistDone(["universidades", "comparar cursos"]);
  const bolsas = checklistDone(["bolsa", "desconto"]);
  const dinheiro = checklistDone(["orçamento", "custo de vida"]);
  const documentos = checklistDone(["documenta", "visto", "residência", "prazo"]);
  const portfolioPct = Math.min(100, state.portfolio.length * 15);
  const carreiraTotal = state.carreira.reduce((acc, f) => acc + f.itens.length, 0);
  const carreiraFeitos = state.carreira.reduce((acc, f) => acc + f.itens.filter(i => i.feito).length, 0);
  const carreira = carreiraTotal ? Math.round((carreiraFeitos / carreiraTotal) * 100) : 0;

  return { enem, universidades, bolsas, dinheiro, documentos, portfolio: portfolioPct, carreira };
}

function ultimaMediaEnem() {
  if (!state.enemSimulacoes.length) return 0;
  return state.enemSimulacoes[state.enemSimulacoes.length - 1].media;
}

function proximoPrazo() {
  const hojeStr = hoje();
  const prazos = state.checklist
    .filter(i => i.prazo && i.status !== "concluido" && i.prazo >= hojeStr)
    .sort((a, b) => a.prazo.localeCompare(b.prazo));
  return prazos[0] || null;
}

function proximaTarefa() {
  for (const fase of state.carreira) {
    const pend = fase.itens.find(i => !i.feito);
    if (pend) return `${pend.texto} (${fase.titulo})`;
  }
  const pendChecklist = state.checklist.find(i => i.status !== "concluido");
  return pendChecklist ? pendChecklist.texto : "Tudo em dia por aqui!";
}

function calcularFinanceiro() {
  const f = state.financeiro;
  const mensalidadeComBolsa = Number(f.mensalidade) * (1 - Number(f.percentualBolsa) / 100);
  const custoMensal = mensalidadeComBolsa + Number(f.aluguel) + Number(f.alimentacao) + Number(f.transporte) + Number(f.celular) + Number(f.materiais) + Number(f.lazer);
  const custoAnual = custoMensal * 12 + Number(f.taxas) + Number(f.passagem);
  const economiaBolsa = (Number(f.mensalidade) - mensalidadeComBolsa) * 12;
  const guardarAntesViagem = Number(f.passagem) + Number(f.reserva) + custoMensal;
  return { mensalidadeComBolsa, custoMensal, custoAnual, economiaBolsa, guardarAntesViagem };
}

function renderDashboard(app) {
  const p = categoryProgress();
  const overall = Math.round((p.enem + p.universidades + p.bolsas + p.dinheiro + p.documentos + p.portfolio + p.carreira) / 7);
  const fin = calcularFinanceiro();
  const prazo = proximoPrazo();
  const favUni = state.favoritos.length ? universidadesData.find(u => u.id === state.favoritos[0]) : null;

  app.innerHTML = `
    <div class="view-head">
      <h1>Meu Plano Portugal</h1>
      <p>Visão geral do seu planejamento para estudar em Portugal e construir carreira em comunicação política.</p>
    </div>

    <div class="grid">
      <div class="card">
        <div class="metric-label">Nota ENEM atual</div>
        <div class="metric">${state.perfil.notaEnem || (state.enemSimulacoes.length ? ultimaMediaEnem() : "—")}</div>
      </div>
      <div class="card">
        <div class="metric-label">Meta ENEM</div>
        <div class="metric">${escapeHtml(state.perfil.metaEnem) || "—"}</div>
      </div>
      <div class="card">
        <div class="metric-label">Universidade favorita</div>
        <div class="metric" style="font-size:1.1rem;">${favUni ? escapeHtml(favUni.universidade) : "Nenhuma ainda"}</div>
      </div>
      <div class="card">
        <div class="metric-label">Maior bolsa/desconto encontrado</div>
        <div class="metric" style="font-size:1.1rem;">Não confirmado</div>
      </div>
      <div class="card">
        <div class="metric-label">Valor mensal estimado</div>
        <div class="metric">€ ${fin.custoMensal.toFixed(0)}</div>
      </div>
      <div class="card">
        <div class="metric-label">Quanto já economizei</div>
        <div class="metric">€ ${Number(state.financeiro.economizado || 0).toFixed(0)}</div>
      </div>
      <div class="card">
        <div class="metric-label">Próximo prazo</div>
        <div class="metric" style="font-size:1.1rem;">${prazo ? escapeHtml(prazo.texto) + " — " + prazo.prazo : "Nenhum prazo marcado"}</div>
      </div>
      <div class="card">
        <div class="metric-label">Próxima tarefa</div>
        <div class="metric" style="font-size:1.1rem;">${escapeHtml(proximaTarefa())}</div>
      </div>
    </div>

    <hr class="divider" />

    <h2>Preparação para Portugal — ${overall}%</h2>
    <div class="progress-bar" style="margin-bottom:1.2rem;"><span style="width:${overall}%"></span></div>

    <div class="grid">
      ${barraCategoria("ENEM", p.enem)}
      ${barraCategoria("Universidades", p.universidades)}
      ${barraCategoria("Bolsas", p.bolsas)}
      ${barraCategoria("Dinheiro", p.dinheiro)}
      ${barraCategoria("Documentos", p.documentos)}
      ${barraCategoria("Portfólio", p.portfolio)}
      ${barraCategoria("Carreira", p.carreira)}
    </div>
  `;
}

function barraCategoria(nome, valor) {
  return `
    <div class="card">
      <h3 style="margin-bottom:.5rem;">${nome}</h3>
      <div class="progress-bar"><span style="width:${valor}%"></span></div>
      <div class="metric-label" style="margin-top:.4rem;">${valor}%</div>
    </div>
  `;
}

/* ---------- PERFIL ---------- */

function renderPerfil(app) {
  const p = state.perfil;
  app.innerHTML = `
    <div class="view-head">
      <h1>Meu Perfil</h1>
      <p>Essas informações alimentam o painel e não saem do seu navegador.</p>
    </div>
    <div class="card" style="max-width:640px;">
      <div class="field-row">
        <div class="field"><label>Nome</label><input id="f-nome" value="${escapeHtml(p.nome)}" /></div>
        <div class="field"><label>Ano atual</label><input id="f-ano" value="${escapeHtml(p.ano)}" placeholder="Ex: 3º ano técnico" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Cidade</label><input id="f-cidade" value="${escapeHtml(p.cidade)}" /></div>
        <div class="field"><label>Curso atual</label><input id="f-cursoAtual" value="${escapeHtml(p.cursoAtual)}" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Previsão de conclusão</label><input id="f-previsaoConclusao" value="${escapeHtml(p.previsaoConclusao)}" placeholder="Ex: dez/2026" /></div>
        <div class="field"><label>Orçamento disponível (referência)</label><input id="f-orcamento" value="${escapeHtml(p.orcamento)}" placeholder="Ex: a definir" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Nota ENEM (mais recente)</label><input id="f-notaEnem" value="${escapeHtml(p.notaEnem)}" /></div>
        <div class="field"><label>Meta ENEM</label><input id="f-metaEnem" value="${escapeHtml(p.metaEnem)}" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Países de interesse</label><input id="f-paises" value="${escapeHtml(p.paises)}" /></div>
        <div class="field"><label>Áreas profissionais de interesse</label><input id="f-areas" value="${escapeHtml(p.areas)}" /></div>
      </div>
      <button class="btn" onclick="salvarPerfil()">Salvar perfil</button>
      <p class="note" style="margin-top:1rem;">Evite colocar documentos reais (RG, passaporte, etc.) aqui — este é apenas um espaço de planejamento.</p>
    </div>
  `;
}

function salvarPerfil() {
  const ids = ["nome", "ano", "cidade", "cursoAtual", "previsaoConclusao", "orcamento", "notaEnem", "metaEnem", "paises", "areas"];
  ids.forEach(id => state.perfil[id] = document.getElementById("f-" + id).value);
  saveState();
  route();
}

/* ---------- ENEM ---------- */

function renderEnem(app) {
  const sims = state.enemSimulacoes;
  app.innerHTML = `
    <div class="view-head">
      <h1>Meu ENEM</h1>
      <p>Registre suas simulações e acompanhe a evolução até a sua meta.</p>
    </div>

    <div class="card" style="max-width:640px; margin-bottom:1.5rem;">
      <h3>Nova simulação</h3>
      <div class="field-row">
        <div class="field"><label>Linguagens</label><input type="number" id="e-linguagens" min="0" max="1000" /></div>
        <div class="field"><label>Ciências Humanas</label><input type="number" id="e-humanas" min="0" max="1000" /></div>
        <div class="field"><label>Ciências da Natureza</label><input type="number" id="e-natureza" min="0" max="1000" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Matemática</label><input type="number" id="e-matematica" min="0" max="1000" /></div>
        <div class="field"><label>Redação</label><input type="number" id="e-redacao" min="0" max="1000" /></div>
        <div class="field"><label>Tipo</label>
          <select id="e-tipo"><option value="estimada">Estimada</option><option value="oficial">Oficial</option></select>
        </div>
      </div>
      <button class="btn" onclick="adicionarSimulacaoEnem()">Registrar simulação</button>
    </div>

    ${sims.length ? `
    <div class="chart-wrap section-block">
      <h3>Evolução da média</h3>
      ${gerarGraficoEnem(sims, state.perfil.metaEnem)}
    </div>
    <table class="section-block">
      <thead><tr><th>Data</th><th>Tipo</th><th>Ling.</th><th>Hum.</th><th>Nat.</th><th>Mat.</th><th>Red.</th><th>Média</th><th></th></tr></thead>
      <tbody>
        ${sims.map(s => `
          <tr>
            <td>${s.data}</td><td>${s.tipo}</td><td>${s.linguagens}</td><td>${s.humanas}</td>
            <td>${s.natureza}</td><td>${s.matematica}</td><td>${s.redacao}</td><td><strong>${s.media}</strong></td>
            <td><button class="btn ghost small" onclick="removerSimulacaoEnem('${s.id}')">Excluir</button></td>
          </tr>`).join("")}
      </tbody>
    </table>` : `<div class="empty-state">Nenhuma simulação registrada ainda.</div>`}

    <hr class="divider" />
    <h2>Como minha nota pode afetar minhas opções?</h2>
    <p class="note">Estas informações são apenas o que consta nos dados de exemplo do projeto — nenhuma relação entre nota e bolsa foi presumida. Confirme sempre no site oficial de cada universidade.</p>
    <table>
      <thead><tr><th>Universidade / Curso</th><th>Aceita ENEM?</th><th>Regras para brasileiros</th></tr></thead>
      <tbody>
        ${universidadesData.map(u => `
          <tr>
            <td>${escapeHtml(u.universidade)} — ${escapeHtml(u.curso)}</td>
            <td>${escapeHtml(u.aceita_enem)}</td>
            <td>${escapeHtml(u.regras_brasileiros)}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function adicionarSimulacaoEnem() {
  const vals = ["linguagens", "humanas", "natureza", "matematica", "redacao"].map(id => Number(document.getElementById("e-" + id).value) || 0);
  const tipo = document.getElementById("e-tipo").value;
  const media = Math.round((vals.reduce((a, b) => a + b, 0) / 5) * 10) / 10;
  state.enemSimulacoes.push({
    id: uid(), data: hoje(), tipo,
    linguagens: vals[0], humanas: vals[1], natureza: vals[2], matematica: vals[3], redacao: vals[4],
    media
  });
  saveState();
  route();
}

function removerSimulacaoEnem(id) {
  state.enemSimulacoes = state.enemSimulacoes.filter(s => s.id !== id);
  saveState();
  route();
}

function gerarGraficoEnem(sims, meta) {
  const max = 1000;
  const barras = sims.map(s => {
    const h = Math.max(4, Math.round((s.media / max) * 140));
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;flex:1;min-width:36px;">
      <div style="font-size:.72rem;color:var(--ink-soft);">${s.media}</div>
      <div style="width:100%;max-width:28px;height:${h}px;background:var(--wine);border-radius:4px 4px 0 0;"></div>
      <div style="font-size:.68rem;color:var(--ink-soft);">${s.data.slice(5)}</div>
    </div>`;
  }).join("");
  const metaLine = meta ? `<p class="metric-label">Linha de meta: ${escapeHtml(meta)} pontos</p>` : "";
  return `<div style="display:flex;align-items:flex-end;gap:.5rem;height:170px;">${barras}</div>${metaLine}`;
}

/* ---------- UNIVERSIDADES ---------- */

let filtroUni = { busca: "", categoria: "", cidade: "" };

function renderUniversidades(app) {
  const categorias = [...new Set(universidadesData.map(u => u.categoria))];
  const cidades = [...new Set(universidadesData.map(u => u.cidade))];

  const lista = universidadesData.filter(u => {
    const texto = (u.universidade + " " + u.curso).toLowerCase();
    return texto.includes(filtroUni.busca.toLowerCase())
      && (!filtroUni.categoria || u.categoria === filtroUni.categoria)
      && (!filtroUni.cidade || u.cidade === filtroUni.cidade);
  });

  app.innerHTML = `
    <div class="view-head">
      <h1>Universidades em Portugal</h1>
      <p>Dados de exemplo — sempre confirme mensalidades, bolsas e regras no site oficial de cada instituição antes de decidir.</p>
    </div>
    <div class="filters">
      <input id="u-busca" placeholder="Buscar por universidade ou curso" value="${escapeHtml(filtroUni.busca)}" oninput="filtroUni.busca=this.value; renderUniversidadesBody();" />
      <select id="u-categoria" onchange="filtroUni.categoria=this.value; renderUniversidadesBody();">
        <option value="">Todas as categorias</option>
        ${categorias.map(c => `<option value="${escapeHtml(c)}" ${filtroUni.categoria === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
      </select>
      <select id="u-cidade" onchange="filtroUni.cidade=this.value; renderUniversidadesBody();">
        <option value="">Todas as cidades</option>
        ${cidades.map(c => `<option value="${escapeHtml(c)}" ${filtroUni.cidade === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
      </select>
    </div>
    <p class="metric-label">${state.comparador.length}/5 selecionadas para o comparador — <a href="#comparador">ver comparador</a></p>
    <div id="uni-list" class="grid-2"></div>
  `;
  renderUniversidadesBody(lista);
}

function renderUniversidadesBody(listaParam) {
  const categorias = [...new Set(universidadesData.map(u => u.categoria))];
  const cidades = [...new Set(universidadesData.map(u => u.cidade))];
  const lista = listaParam || universidadesData.filter(u => {
    const texto = (u.universidade + " " + u.curso).toLowerCase();
    return texto.includes(filtroUni.busca.toLowerCase())
      && (!filtroUni.categoria || u.categoria === filtroUni.categoria)
      && (!filtroUni.cidade || u.cidade === filtroUni.cidade);
  });
  const el = document.getElementById("uni-list");
  if (!el) return;
  el.innerHTML = lista.length ? lista.map(u => uniCardHtml(u)).join("") : `<div class="empty-state">Nenhuma universidade encontrada com esses filtros.</div>`;
}

function uniCardHtml(u) {
  const isFav = state.favoritos.includes(u.id);
  const inComparador = state.comparador.includes(u.id);
  const comparadorCheio = state.comparador.length >= 5 && !inComparador;
  return `
    <div class="card uni-card">
      <div class="uni-top">
        <div>
          <h3 style="margin-bottom:.1rem;">${escapeHtml(u.universidade)}</h3>
          <div class="metric-label">${escapeHtml(u.curso)} · ${escapeHtml(u.cidade)}</div>
        </div>
        <button class="fav-btn" onclick="toggleFavorito('${u.id}')" title="Favoritar">${isFav ? "♥" : "♡"}</button>
      </div>
      <div class="badge-list">
        <span class="tag">${escapeHtml(u.categoria)}</span>
        <span class="tag">${escapeHtml(u.duracao)}</span>
        <span class="tag exemplo">EXEMPLO</span>
      </div>
      <label class="pill-check">
        <input type="checkbox" ${inComparador ? "checked" : ""} ${comparadorCheio ? "disabled" : ""} onchange="toggleComparador('${u.id}')" />
        <span>Comparar</span>
      </label>
      <details>
        <summary style="cursor:pointer; color:var(--wine); font-weight:600; font-size:.88rem;">Ver detalhes</summary>
        <div style="margin-top:.6rem; font-size:.87rem;">
          <p><strong>Disciplinas principais:</strong> ${u.disciplinas_principais.map(escapeHtml).join(", ")}</p>
          <p><strong>Disciplinas de política/comunicação:</strong> ${u.disciplinas_politica_comunicacao.map(escapeHtml).join(", ")}</p>
          <p><strong>Estágio:</strong> ${escapeHtml(u.estagio)}</p>
          <p><strong>Saídas profissionais:</strong> ${u.saidas_profissionais.map(escapeHtml).join(", ")}</p>
          <p><strong>Mensalidade:</strong> ${u.mensalidade_eur ? "€ " + u.mensalidade_eur : "Não confirmado — verificar no site oficial."}</p>
          <p><strong>Aceita ENEM:</strong> ${escapeHtml(u.aceita_enem)}</p>
          <p><strong>Regras para brasileiros:</strong> ${escapeHtml(u.regras_brasileiros)}</p>
          <p><strong>Bolsas:</strong> ${u.bolsas.map(b => escapeHtml(b.nome) + " — " + escapeHtml(b.detalhe)).join("; ")}</p>
        </div>
      </details>
      <p class="fonte">Fonte oficial: <a href="${u.fonte_oficial}" target="_blank" rel="noopener">${escapeHtml(u.fonte_oficial)}</a><br/>Última verificação: ${escapeHtml(u.ultima_verificacao)}</p>
    </div>
  `;
}

function toggleFavorito(id) {
  const i = state.favoritos.indexOf(id);
  if (i >= 0) state.favoritos.splice(i, 1); else state.favoritos.push(id);
  saveState();
  renderUniversidadesBody();
}

function toggleComparador(id) {
  const i = state.comparador.indexOf(id);
  if (i >= 0) {
    state.comparador.splice(i, 1);
  } else if (state.comparador.length < 5) {
    state.comparador.push(id);
  }
  saveState();
  route();
}

/* ---------- COMPARADOR ---------- */

function renderComparador(app) {
  const selecionadas = state.comparador.map(id => universidadesData.find(u => u.id === id)).filter(Boolean);
  app.innerHTML = `
    <div class="view-head">
      <h1>Comparador</h1>
      <p>Compare até 5 universidades/cursos lado a lado. Não é um ranking — é para você ver o que combina com seu objetivo.</p>
    </div>
    ${selecionadas.length === 0
      ? `<div class="empty-state">Você ainda não selecionou universidades. <br/><a class="btn" href="#universidades" style="margin-top:.8rem;">Ir para Universidades</a></div>`
      : `<div style="overflow-x:auto;">
          <table class="compare-table">
            <thead><tr><th></th>${selecionadas.map(u => `<th>${escapeHtml(u.universidade)}<br/><span class="metric-label">${escapeHtml(u.curso)}</span><br/><button class="btn ghost small" onclick="toggleComparador('${u.id}')">Remover</button></th>`).join("")}</tr></thead>
            <tbody>
              <tr><td>Cidade</td>${selecionadas.map(u => `<td>${escapeHtml(u.cidade)}</td>`).join("")}</tr>
              <tr><td>Duração</td>${selecionadas.map(u => `<td>${escapeHtml(u.duracao)}</td>`).join("")}</tr>
              <tr><td>Estágio</td>${selecionadas.map(u => `<td>${escapeHtml(u.estagio)}</td>`).join("")}</tr>
              <tr><td>Aceita ENEM</td>${selecionadas.map(u => `<td>${escapeHtml(u.aceita_enem)}</td>`).join("")}</tr>
              <tr><td>Mensalidade</td>${selecionadas.map(u => `<td>${u.mensalidade_eur ? "€ " + u.mensalidade_eur : "Não confirmado"}</td>`).join("")}</tr>
              <tr><td>Pontos que combinam com meu objetivo</td>${selecionadas.map(u => `<td>${u.pontos_fortes.map(escapeHtml).join("<br/>")}</td>`).join("")}</tr>
              <tr><td>Pontos para considerar</td>${selecionadas.map(u => `<td>${u.pontos_atencao.map(escapeHtml).join("<br/>")}</td>`).join("")}</tr>
              <tr><td>Custos</td>${selecionadas.map(u => `<td>Mensalidade: ${u.mensalidade_eur ? "€ " + u.mensalidade_eur : "não confirmado"}<br/>Taxas: ${u.taxas_eur ? "€ " + u.taxas_eur : "não confirmado"}</td>`).join("")}</tr>
              <tr><td>Requisitos</td>${selecionadas.map(u => `<td>${u.requisitos.map(escapeHtml).join("<br/>")}</td>`).join("")}</tr>
              <tr><td>Informações ainda não confirmadas</td>${selecionadas.map(u => `<td>${u.nao_confirmado.map(escapeHtml).join("<br/>")}</td>`).join("")}</tr>
            </tbody>
          </table>
        </div>`
    }
  `;
}

/* ---------- CALCULADORA ---------- */

function renderCalculadora(app) {
  const f = state.financeiro;
  const r = calcularFinanceiro();
  const conv = v => f.moeda === "BRL" ? (v * Number(f.cotacao || 0)).toFixed(2) : v.toFixed(2);
  const simbolo = f.moeda === "BRL" ? "R$" : "€";

  app.innerHTML = `
    <div class="view-head">
      <h1>Calculadora Financeira — Portugal</h1>
      <p>Preencha os valores que você já souber. Os campos vazios contam como zero.</p>
    </div>
    <div class="grid-2">
      <div class="card">
        <h3>Entradas</h3>
        <div class="field-row">
          <div class="field"><label>Mensalidade (€)</label><input type="number" id="c-mensalidade" value="${f.mensalidade}" oninput="atualizarFinanceiro('mensalidade', this.value)" /></div>
          <div class="field"><label>% Bolsa/desconto</label><input type="number" id="c-percentualBolsa" value="${f.percentualBolsa}" oninput="atualizarFinanceiro('percentualBolsa', this.value)" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Parcelas/ano</label><input type="number" id="c-parcelas" value="${f.parcelas}" oninput="atualizarFinanceiro('parcelas', this.value)" /></div>
          <div class="field"><label>Taxas (€/ano)</label><input type="number" id="c-taxas" value="${f.taxas}" oninput="atualizarFinanceiro('taxas', this.value)" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Aluguel (€/mês)</label><input type="number" id="c-aluguel" value="${f.aluguel}" oninput="atualizarFinanceiro('aluguel', this.value)" /></div>
          <div class="field"><label>Alimentação (€/mês)</label><input type="number" id="c-alimentacao" value="${f.alimentacao}" oninput="atualizarFinanceiro('alimentacao', this.value)" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Transporte (€/mês)</label><input type="number" id="c-transporte" value="${f.transporte}" oninput="atualizarFinanceiro('transporte', this.value)" /></div>
          <div class="field"><label>Celular/internet (€/mês)</label><input type="number" id="c-celular" value="${f.celular}" oninput="atualizarFinanceiro('celular', this.value)" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Materiais (€/mês)</label><input type="number" id="c-materiais" value="${f.materiais}" oninput="atualizarFinanceiro('materiais', this.value)" /></div>
          <div class="field"><label>Lazer (€/mês)</label><input type="number" id="c-lazer" value="${f.lazer}" oninput="atualizarFinanceiro('lazer', this.value)" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Passagem aérea (€)</label><input type="number" id="c-passagem" value="${f.passagem}" oninput="atualizarFinanceiro('passagem', this.value)" /></div>
          <div class="field"><label>Reserva de emergência (€)</label><input type="number" id="c-reserva" value="${f.reserva}" oninput="atualizarFinanceiro('reserva', this.value)" /></div>
        </div>
        <div class="field"><label>Quanto já economizei (€)</label><input type="number" id="c-economizado" value="${f.economizado}" oninput="atualizarFinanceiro('economizado', this.value)" /></div>

        <hr class="divider" />
        <h3>Câmbio</h3>
        <div class="field-row">
          <div class="field"><label>Moeda para exibir</label>
            <select id="c-moeda" onchange="atualizarFinanceiro('moeda', this.value)">
              <option value="EUR" ${f.moeda === "EUR" ? "selected" : ""}>EUR (€)</option>
              <option value="BRL" ${f.moeda === "BRL" ? "selected" : ""}>BRL (R$)</option>
            </select>
          </div>
          <div class="field"><label>Cotação manual (1€ = X R$)</label><input type="number" step="0.01" id="c-cotacao" value="${f.cotacao}" oninput="atualizarFinanceiro('cotacao', this.value)" /></div>
        </div>
        <div class="field"><label>Data da cotação</label><input type="date" id="c-dataCotacao" value="${f.dataCotacao}" oninput="atualizarFinanceiro('dataCotacao', this.value)" /></div>
        <p class="note">A cotação é inserida manualmente — confira o valor atualizado em um conversor confiável antes de usar para decisões importantes.</p>
      </div>

      <div class="card">
        <h3>Resultado</h3>
        <p class="metric-label">Mensalidade com bolsa</p>
        <p class="metric">${simbolo} ${conv(r.mensalidadeComBolsa)}</p>
        <p class="metric-label">Custo mensal total</p>
        <p class="metric">${simbolo} ${conv(r.custoMensal)}</p>
        <p class="metric-label">Custo anual estimado</p>
        <p class="metric">${simbolo} ${conv(r.custoAnual)}</p>
        <p class="metric-label">Economia gerada pela bolsa/desconto (ano)</p>
        <p class="metric">${simbolo} ${conv(r.economiaBolsa)}</p>
        <p class="metric-label">Quanto preciso guardar antes da viagem</p>
        <p class="metric">${simbolo} ${conv(r.guardarAntesViagem)}</p>
      </div>
    </div>
  `;
}

function atualizarFinanceiro(campo, valor) {
  if (["moeda", "dataCotacao"].includes(campo)) {
    state.financeiro[campo] = valor;
  } else {
    state.financeiro[campo] = Number(valor) || 0;
  }
  saveState();
  renderCalculadora(document.getElementById("app"));
}

/* ---------- CARREIRA ---------- */

function renderCarreira(app) {
  app.innerHTML = `
    <div class="view-head">
      <h1>Plano de Carreira</h1>
      <p>Sua timeline até trabalhar com comunicação política. Edite livremente — o cronograma pode mudar.</p>
    </div>
    <div class="timeline">
      ${state.carreira.map(fase => `
        <div class="card timeline-item">
          <input value="${escapeHtml(fase.titulo)}" style="font-family:var(--font-title); font-size:1.1rem; border:none; background:transparent; color:var(--wine-dark); font-weight:600; width:100%; margin-bottom:.6rem;"
            onchange="renomearFase('${fase.id}', this.value)" />
          ${fase.itens.map(item => `
            <div class="item-row ${item.feito ? "done" : ""}">
              <input type="checkbox" ${item.feito ? "checked" : ""} onchange="toggleItemCarreira('${fase.id}','${item.id}')" />
              <span>${escapeHtml(item.texto)}</span>
              <button class="btn ghost small" style="margin-left:auto;" onclick="removerItemCarreira('${fase.id}','${item.id}')">Excluir</button>
            </div>
          `).join("")}
          <div class="actions-row">
            <input placeholder="Nova etapa..." id="novo-${fase.id}" style="flex:1; padding:.5rem .7rem; border:1px solid var(--line); border-radius:8px;" />
            <button class="btn secondary small" onclick="adicionarItemCarreira('${fase.id}')">Adicionar etapa</button>
            <button class="btn ghost small" onclick="removerFase('${fase.id}')">Remover fase</button>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="actions-row">
      <input placeholder="Nome da nova fase (ex: 2028)" id="nova-fase" style="flex:1; padding:.5rem .7rem; border:1px solid var(--line); border-radius:8px;" />
      <button class="btn" onclick="adicionarFase()">Adicionar fase</button>
    </div>
  `;
}

function renomearFase(faseId, novoTitulo) {
  const fase = state.carreira.find(f => f.id === faseId);
  fase.titulo = novoTitulo;
  saveState();
}

function toggleItemCarreira(faseId, itemId) {
  const fase = state.carreira.find(f => f.id === faseId);
  const item = fase.itens.find(i => i.id === itemId);
  item.feito = !item.feito;
  saveState();
  route();
}

function removerItemCarreira(faseId, itemId) {
  const fase = state.carreira.find(f => f.id === faseId);
  fase.itens = fase.itens.filter(i => i.id !== itemId);
  saveState();
  route();
}

function adicionarItemCarreira(faseId) {
  const input = document.getElementById("novo-" + faseId);
  if (!input.value.trim()) return;
  const fase = state.carreira.find(f => f.id === faseId);
  fase.itens.push({ id: uid(), texto: input.value.trim(), feito: false });
  saveState();
  route();
}

function removerFase(faseId) {
  if (!confirm("Remover esta fase inteira?")) return;
  state.carreira = state.carreira.filter(f => f.id !== faseId);
  saveState();
  route();
}

function adicionarFase() {
  const input = document.getElementById("nova-fase");
  if (!input.value.trim()) return;
  state.carreira.push({ id: uid(), titulo: input.value.trim(), itens: [] });
  saveState();
  route();
}

/* ---------- PORTFÓLIO ---------- */

const CATEGORIAS_PORTFOLIO = ["Design", "Social Media", "Roteiros", "Fotografia", "Comunicação Institucional", "Projetos Acadêmicos", "Projetos de Comunicação Política", "Tecnologia"];

function renderPortfolio(app) {
  app.innerHTML = `
    <div class="view-head">
      <h1>Meu Portfólio</h1>
      <p>Reúna os trabalhos que mostram sua experiência com comunicação.</p>
    </div>

    <div class="card" style="margin-bottom:1.5rem;">
      <h3>Adicionar item</h3>
      <div class="field-row">
        <div class="field"><label>Categoria</label>
          <select id="p-categoria">${CATEGORIAS_PORTFOLIO.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
        </div>
        <div class="field"><label>Título</label><input id="p-titulo" /></div>
      </div>
      <div class="field"><label>Descrição</label><textarea id="p-descricao"></textarea></div>
      <div class="field-row">
        <div class="field"><label>Ferramentas utilizadas</label><input id="p-ferramentas" placeholder="Ex: Capcut, Canva" /></div>
        <div class="field"><label>Data</label><input type="date" id="p-data" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Link</label><input id="p-link" placeholder="https://" /></div>
        <div class="field"><label>Resultado/objetivo</label><input id="p-resultado" /></div>
      </div>
      <button class="btn" onclick="adicionarPortfolio()">Adicionar ao portfólio</button>
    </div>

    <div class="grid-2 section-block">
      ${state.portfolio.length ? state.portfolio.map(itemPortfolioHtml).join("") : `<div class="empty-state">Nenhum item no portfólio ainda.</div>`}
    </div>

    <hr class="divider" />
    <h2>Projetos que quero desenvolver</h2>
    <div class="grid-2 section-block">
      ${state.projetosFuturos.map(pf => `
        <div class="card">
          <h3>${escapeHtml(pf.titulo)} <span class="tag exemplo">acadêmico/fictício</span></h3>
          <textarea placeholder="Notas sobre esse projeto..." onchange="atualizarProjetoFuturo('${pf.id}', this.value)">${escapeHtml(pf.descricao)}</textarea>
          <button class="btn ghost small" style="margin-top:.5rem;" onclick="removerProjetoFuturo('${pf.id}')">Remover da lista</button>
        </div>
      `).join("")}
    </div>
    <div class="actions-row">
      <input placeholder="Nova ideia de projeto..." id="novo-projeto-futuro" style="flex:1; padding:.5rem .7rem; border:1px solid var(--line); border-radius:8px;" />
      <button class="btn secondary" onclick="adicionarProjetoFuturo()">Adicionar ideia</button>
    </div>
  `;
}

function itemPortfolioHtml(item) {
  return `
    <div class="card">
      <span class="tag">${escapeHtml(item.categoria)}</span>
      <h3>${escapeHtml(item.titulo)}</h3>
      <p>${escapeHtml(item.descricao)}</p>
      ${item.ferramentas ? `<p class="metric-label">Ferramentas: ${escapeHtml(item.ferramentas)}</p>` : ""}
      ${item.data ? `<p class="metric-label">Data: ${item.data}</p>` : ""}
      ${item.resultado ? `<p class="metric-label">Resultado: ${escapeHtml(item.resultado)}</p>` : ""}
      ${item.link ? `<p><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Ver link</a></p>` : ""}
      <button class="btn ghost small" onclick="removerPortfolio('${item.id}')">Excluir</button>
    </div>
  `;
}

function adicionarPortfolio() {
  const titulo = document.getElementById("p-titulo").value.trim();
  if (!titulo) { alert("Dê um título ao item."); return; }
  state.portfolio.push({
    id: uid(),
    categoria: document.getElementById("p-categoria").value,
    titulo,
    descricao: document.getElementById("p-descricao").value,
    ferramentas: document.getElementById("p-ferramentas").value,
    data: document.getElementById("p-data").value,
    link: document.getElementById("p-link").value,
    resultado: document.getElementById("p-resultado").value
  });
  saveState();
  route();
}

function removerPortfolio(id) {
  state.portfolio = state.portfolio.filter(i => i.id !== id);
  saveState();
  route();
}

function adicionarProjetoFuturo() {
  const input = document.getElementById("novo-projeto-futuro");
  if (!input.value.trim()) return;
  state.projetosFuturos.push({ id: uid(), titulo: input.value.trim(), descricao: "", academico: true });
  saveState();
  route();
}

function atualizarProjetoFuturo(id, valor) {
  const pf = state.projetosFuturos.find(p => p.id === id);
  pf.descricao = valor;
  saveState();
}

function removerProjetoFuturo(id) {
  state.projetosFuturos = state.projetosFuturos.filter(p => p.id !== id);
  saveState();
  route();
}

/* ---------- PROFISSÕES (Comunicação Política) ---------- */

let buscaProfissao = "";

function renderProfissoes(app) {
  app.innerHTML = `
    <div class="view-head">
      <h1>Comunicação Política</h1>
      <p>Panorama das profissões na área, para você entender onde seu perfil pode se encaixar.</p>
    </div>
    <div class="filters">
      <input placeholder="Buscar profissão..." value="${escapeHtml(buscaProfissao)}" oninput="buscaProfissao=this.value; renderProfissoesBody();" />
    </div>
    <div id="prof-list" class="grid-2"></div>
  `;
  renderProfissoesBody();
}

function renderProfissoesBody() {
  const el = document.getElementById("prof-list");
  if (!el) return;
  const lista = profissoesData.filter(p => p.nome.toLowerCase().includes(buscaProfissao.toLowerCase()));
  el.innerHTML = lista.map(p => `
    <div class="card">
      <h3>${escapeHtml(p.nome)}</h3>
      <p>${escapeHtml(p.o_que_faz)}</p>
      <details>
        <summary style="cursor:pointer; color:var(--wine); font-weight:600; font-size:.88rem;">Ver mais</summary>
        <div style="margin-top:.6rem; font-size:.87rem;">
          <p><strong>Habilidades:</strong> ${p.habilidades.map(escapeHtml).join(", ")}</p>
          <p><strong>Ferramentas:</strong> ${p.ferramentas.map(escapeHtml).join(", ")}</p>
          <p><strong>Cursos relacionados:</strong> ${p.cursos_relacionados.map(escapeHtml).join(", ")}</p>
          <p><strong>Experiências que ajudam:</strong> ${p.experiencias_que_ajudam.map(escapeHtml).join(", ")}</p>
          <p><strong>Empregadores comuns:</strong> ${p.empregadores.map(escapeHtml).join(", ")}</p>
          <p><strong>Portugal x Brasil:</strong> ${escapeHtml(p.portugal_brasil)}</p>
          <p><strong>Como montar portfólio:</strong> ${escapeHtml(p.como_montar_portfolio)}</p>
        </div>
      </details>
    </div>
  `).join("") || `<div class="empty-state">Nenhuma profissão encontrada.</div>`;
}

/* ---------- CHECKLIST ---------- */

function renderChecklist(app) {
  const total = state.checklist.length;
  const feitos = state.checklist.filter(i => i.status === "concluido").length;
  app.innerHTML = `
    <div class="view-head">
      <h1>Checklist Portugal</h1>
      <p>${feitos}/${total} itens concluídos</p>
    </div>
    <div class="progress-bar section-block"><span style="width:${total ? Math.round(feitos / total * 100) : 0}%"></span></div>
    <div id="checklist-items">
      ${state.checklist.map(checklistItemHtml).join("")}
    </div>
    <div class="actions-row">
      <input placeholder="Novo item do checklist..." id="novo-checklist" style="flex:1; padding:.5rem .7rem; border:1px solid var(--line); border-radius:8px;" />
      <button class="btn" onclick="adicionarChecklist()">Adicionar item</button>
    </div>
  `;
}

function checklistItemHtml(item) {
  return `
    <div class="checklist-item">
      <input type="checkbox" ${item.status === "concluido" ? "checked" : ""} onchange="toggleChecklistStatus('${item.id}')" />
      <div>
        <div style="display:flex; align-items:center; gap:.6rem;">
          <strong style="${item.status === "concluido" ? "text-decoration:line-through;color:var(--ink-soft);" : ""}">${escapeHtml(item.texto)}</strong>
          <button class="btn ghost small" onclick="removerChecklist('${item.id}')">Excluir</button>
        </div>
        <div class="sub-fields">
          <input type="date" value="${item.prazo}" placeholder="Prazo" onchange="atualizarChecklistCampo('${item.id}','prazo',this.value)" />
          <input value="${escapeHtml(item.observacao)}" placeholder="Observação" onchange="atualizarChecklistCampo('${item.id}','observacao',this.value)" />
          <input value="${escapeHtml(item.link)}" placeholder="Link" onchange="atualizarChecklistCampo('${item.id}','link',this.value)" />
          <input value="${escapeHtml(item.documento)}" placeholder="Documento relacionado" onchange="atualizarChecklistCampo('${item.id}','documento',this.value)" />
        </div>
      </div>
    </div>
  `;
}

function toggleChecklistStatus(id) {
  const item = state.checklist.find(i => i.id === id);
  item.status = item.status === "concluido" ? "pendente" : "concluido";
  saveState();
  route();
}

function atualizarChecklistCampo(id, campo, valor) {
  const item = state.checklist.find(i => i.id === id);
  item[campo] = valor;
  saveState();
}

function removerChecklist(id) {
  state.checklist = state.checklist.filter(i => i.id !== id);
  saveState();
  route();
}

function adicionarChecklist() {
  const input = document.getElementById("novo-checklist");
  if (!input.value.trim()) return;
  state.checklist.push({ id: uid(), texto: input.value.trim(), status: "pendente", prazo: "", observacao: "", link: "", documento: "" });
  saveState();
  route();
}

/* ---------- MEUS DADOS (export/import/reset) ---------- */

function renderDados(app) {
  app.innerHTML = `
    <div class="view-head">
      <h1>Meus Dados</h1>
      <p>Tudo o que você preenche fica salvo apenas no seu navegador (localStorage). Use esta página para fazer backup.</p>
    </div>
    <div class="grid-2">
      <div class="card">
        <h3>Exportar</h3>
        <p>Baixe um arquivo JSON com todos os seus dados (perfil, ENEM, portfólio, checklist, etc.).</p>
        <button class="btn" onclick="exportarJSON()">Exportar meus dados (JSON)</button>
        <hr class="divider" />
        <p>Baixe uma tabela CSV com as universidades cadastradas.</p>
        <button class="btn secondary" onclick="exportarUniversidadesCSV()">Exportar universidades (CSV)</button>
        <hr class="divider" />
        <p>Gere uma versão para impressão/PDF do seu plano (usa a função de impressão do navegador).</p>
        <button class="btn secondary" onclick="window.print()">Imprimir / salvar como PDF</button>
      </div>
      <div class="card">
        <h3>Importar</h3>
        <p>Selecione um arquivo JSON exportado anteriormente para restaurar seus dados.</p>
        <input type="file" accept="application/json" id="import-file" />
        <button class="btn secondary" style="margin-top:.7rem;" onclick="importarJSON()">Importar arquivo</button>
        <hr class="divider" />
        <h3 style="color:#B4453C;">Zona de risco</h3>
        <p>Isso apaga todos os dados salvos neste navegador e recomeça do zero.</p>
        <button class="btn danger" onclick="resetarDados()">Apagar todos os dados</button>
      </div>
    </div>
  `;
}

function exportarJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "meu-plano-portugal-backup.json";
  a.click();
}

function exportarUniversidadesCSV() {
  const cols = ["universidade", "curso", "categoria", "cidade", "duracao", "mensalidade_eur", "aceita_enem", "ultima_verificacao", "fonte_oficial"];
  const linhas = [cols.join(",")].concat(
    universidadesData.map(u => cols.map(c => `"${String(u[c] ?? "").replace(/"/g, '""')}"`).join(","))
  );
  const blob = new Blob([linhas.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "universidades.csv";
  a.click();
}

function importarJSON() {
  const input = document.getElementById("import-file");
  if (!input.files.length) { alert("Escolha um arquivo primeiro."); return; }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!confirm("Isso vai substituir os dados atuais pelos dados do arquivo. Continuar?")) return;
      state = Object.assign(defaultState(), imported);
      saveState();
      route();
      alert("Dados importados com sucesso.");
    } catch (err) {
      alert("Não foi possível ler este arquivo. Verifique se é um JSON exportado por este site.");
    }
  };
  reader.readAsText(input.files[0]);
}

function resetarDados() {
  if (!confirm("Tem certeza? Isso apaga TODOS os seus dados salvos neste site.")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  route();
}

/* ---------- INIT ---------- */

async function init() {
  state = loadState();
  [universidadesData, profissoesData] = await Promise.all([
    fetchJSON("data/universidades.json"),
    fetchJSON("data/profissoes.json")
  ]);

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidenav").classList.toggle("open");
    document.getElementById("navOverlay").classList.toggle("open");
  });
  document.getElementById("navOverlay").addEventListener("click", closeMobileNav);

  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#dashboard";
  route();
}

document.addEventListener("DOMContentLoaded", init);

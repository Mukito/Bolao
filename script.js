/* =========================================================
   BOLÃO DA COPA DO MUNDO — dados ficam em LocalStorage
   Tabelas conceituais: participantes / jogos / palpites / resultados / ranking
   ========================================================= */

// Troque esta chave para definir sua própria senha de administrador
const ADMIN_KEY = "copa2026admin";

const TEAMS = [
  {name:"Brasil",code:"BRA",flag:"🇧🇷"},{name:"Argentina",code:"ARG",flag:"🇦🇷"},
  {name:"França",code:"FRA",flag:"🇫🇷"},{name:"Alemanha",code:"GER",flag:"🇩🇪"},
  {name:"Espanha",code:"ESP",flag:"🇪🇸"},{name:"Portugal",code:"POR",flag:"🇵🇹"},
  {name:"Inglaterra",code:"ENG",flag:"🏴"},{name:"Itália",code:"ITA",flag:"🇮🇹"},
  {name:"Países Baixos",code:"NED",flag:"🇳🇱"},{name:"Bélgica",code:"BEL",flag:"🇧🇪"},
  {name:"Uruguai",code:"URU",flag:"🇺🇾"},{name:"Croácia",code:"CRO",flag:"🇭🇷"},
  {name:"México",code:"MEX",flag:"🇲🇽"},{name:"Estados Unidos",code:"USA",flag:"🇺🇸"},
  {name:"Colômbia",code:"COL",flag:"🇨🇴"},{name:"Senegal",code:"SEN",flag:"🇸🇳"},
  {name:"Marrocos",code:"MAR",flag:"🇲🇦"},{name:"Japão",code:"JPN",flag:"🇯🇵"},
  {name:"Coreia do Sul",code:"KOR",flag:"🇰🇷"},{name:"Austrália",code:"AUS",flag:"🇦🇺"},
  {name:"Canadá",code:"CAN",flag:"🇨🇦"},{name:"Suíça",code:"SUI",flag:"🇨🇭"},
  {name:"Dinamarca",code:"DEN",flag:"🇩🇰"},{name:"Polônia",code:"POL",flag:"🇵🇱"},
  {name:"Sérvia",code:"SRB",flag:"🇷🇸"},{name:"Gana",code:"GHA",flag:"🇬🇭"},
  {name:"Camarões",code:"CMR",flag:"🇨🇲"},{name:"Tunísia",code:"TUN",flag:"🇹🇳"},
  {name:"Equador",code:"ECU",flag:"🇪🇨"},{name:"Chile",code:"CHI",flag:"🇨🇱"},
  {name:"Peru",code:"PER",flag:"🇵🇪"},{name:"Paraguai",code:"PAR",flag:"🇵🇾"},
  {name:"Venezuela",code:"VEN",flag:"🇻🇪"},{name:"Costa Rica",code:"CRC",flag:"🇨🇷"},
  {name:"Panamá",code:"PAN",flag:"🇵🇦"},{name:"Jamaica",code:"JAM",flag:"🇯🇲"},
  {name:"Arábia Saudita",code:"KSA",flag:"🇸🇦"},{name:"Irã",code:"IRN",flag:"🇮🇷"},
  {name:"Catar",code:"QAT",flag:"🇶🇦"},{name:"Emirados Árabes",code:"UAE",flag:"🇦🇪"},
  {name:"Iraque",code:"IRQ",flag:"🇮🇶"},{name:"Nova Zelândia",code:"NZL",flag:"🇳🇿"},
  {name:"Egito",code:"EGY",flag:"🇪🇬"},{name:"Argélia",code:"ALG",flag:"🇩🇿"},
  {name:"Nigéria",code:"NGA",flag:"🇳🇬"},{name:"África do Sul",code:"RSA",flag:"🇿🇦"},
  {name:"Costa do Marfim",code:"CIV",flag:"🇨🇮"},{name:"Cabo Verde",code:"CPV",flag:"🇨🇻"},
  {name:"Escócia",code:"SCO",flag:"🏴"},{name:"País de Gales",code:"WAL",flag:"🏴"},
  {name:"Irlanda",code:"IRL",flag:"🇮🇪"},{name:"Áustria",code:"AUT",flag:"🇦🇹"},
  {name:"Suécia",code:"SWE",flag:"🇸🇪"},{name:"Noruega",code:"NOR",flag:"🇳🇴"},
  {name:"Turquia",code:"TUR",flag:"🇹🇷"},{name:"Ucrânia",code:"UKR",flag:"🇺🇦"},
  {name:"República Tcheca",code:"CZE",flag:"🇨🇿"},{name:"Hungria",code:"HUN",flag:"🇭🇺"},
  {name:"Romênia",code:"ROU",flag:"🇷🇴"},{name:"Grécia",code:"GRE",flag:"🇬🇷"},
  {name:"Eslováquia",code:"SVK",flag:"🇸🇰"},{name:"Eslovênia",code:"SVN",flag:"🇸🇮"},
  {name:"Finlândia",code:"FIN",flag:"🇫🇮"},{name:"Islândia",code:"ISL",flag:"🇮🇸"},
  {name:"Honduras",code:"HON",flag:"🇭🇳"},{name:"Bolívia",code:"BOL",flag:"🇧🇴"},
  {name:"Bósnia e Herzegovina",code:"BIH",flag:"🇧🇦"},{name:"Trinidad e Tobago",code:"TRI",flag:"🇹🇹"},
  {name:"Jordânia",code:"JOR",flag:"Jordan"},{name:"Argélia",code:"ALG",flag:"Algeria"},
  {name:"Uzbequistão",code:"UZB",flag:"Uzbekistan"}, {name:"RD Congo",code:"COD",flag:"Congo"}
];

/* ---------------- storage helpers ---------------- */
function loadJSON(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

let games = loadJSON('bolao_games', []);
let predictions = loadJSON('bolao_predictions', []);
let results = loadJSON('bolao_results', []);
let currentUser = localStorage.getItem('bolao_user') || '';
let isAdmin = sessionStorage.getItem('bolao_admin') === '1';
let activeTab = 'jogos';
let editingGameId = null;
let adminError = '';
let searchTerm = '';

function persistGames(){ saveJSON('bolao_games', games); }
function persistPredictions(){ saveJSON('bolao_predictions', predictions); }
function persistResults(){ saveJSON('bolao_results', results); }

/* ---------------- generic helpers ---------------- */
function normalize(str){
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function getTeam(code){
  return TEAMS.find(t => t.code === code) || {name:code, code:code, flag:'🏳️'};
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function pad2(n){ return String(n).padStart(2,'0'); }
function formatDateBR(iso){
  if(!iso) return '--/--/----';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function gameDateTime(g){ return new Date(`${g.data}T${g.horario}:00`); }
function isLocked(g){ return gameDateTime(g).getTime() <= Date.now(); }
function nextId(arr){ return arr.length ? Math.max(...arr.map(x=>x.id)) + 1 : 1; }

function outcomeOf(h,a){ return h===a ? 'draw' : (h>a ? 'home' : 'away'); }
function getResult(gameId){ return results.find(r => r.gameId === gameId) || null; }
function getPrediction(user, gameId){
  return predictions.find(p => p.gameId === gameId && normalize(p.user) === normalize(user)) || null;
}
function computeScore(pred, result){
  if(!result) return 0;
  let pts = 0;
  if(outcomeOf(pred.golsCasa, pred.golsFora) === outcomeOf(result.golsCasa, result.golsFora)) pts += 3;
  if(pred.golsCasa === result.golsCasa && pred.golsFora === result.golsFora) pts += 5;
  return pts;
}

function buildRanking(){
  const names = new Set(predictions.map(p => p.user));
  const rows = [];
  names.forEach(name => {
    let pts = 0, exact = 0, scored = 0;
    predictions.filter(p => p.user === name).forEach(p => {
      const res = getResult(p.gameId);
      if(res){
        scored++;
        const s = computeScore(p, res);
        pts += s;
        if(p.golsCasa === res.golsCasa && p.golsFora === res.golsFora) exact++;
      }
    });
    rows.push({name, pts, exact, scored});
  });
  rows.sort((a,b) => b.pts - a.pts || b.exact - a.exact || a.name.localeCompare(b.name));
  return rows;
}

function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------------- root render ---------------- */
function render(){
  const root = document.getElementById('app');
  root.innerHTML = currentUser ? renderApp() : renderLogin();
  afterRender();
}

function renderLogin(){
  return `
  <div class="screen">
    <div class="center-shell">
      <div class="login-card">
        <div class="logo-mark">🏆</div>
        <div class="brand-title">Bolão da Copa do Mundo</div>
        <div class="brand-sub">FIFA World Cup • Palpites entre amigos</div>
        <label class="field-label" for="nameInput">Nome do participante</label>
        <input id="nameInput" class="input-base" placeholder="Ex: João Silva" maxlength="40"
          onkeydown="if(event.key==='Enter') enterBolao()">
        <button class="btn btn-primary" onclick="enterBolao()">Entrar no Bolão</button>
      </div>
    </div>
  </div>`;
}

function enterBolao(){
  const input = document.getElementById('nameInput');
  const name = (input.value || '').trim();
  if(!name){ input.focus(); return; }
  currentUser = name;
  localStorage.setItem('bolao_user', name);
  activeTab = 'jogos';
  render();
}

function switchUser(){
  currentUser = '';
  localStorage.removeItem('bolao_user');
  isAdmin = false;
  sessionStorage.removeItem('bolao_admin');
  render();
}

function renderApp(){
  return `
  <div class="screen">
    <div class="app-nav">
      <div class="app-nav-top">
        <div class="brand-mini"><span class="mark">🏆</span> Bolão da Copa</div>
        <div class="user-pill">👤 <strong>${escapeHtml(currentUser)}</strong>
          <button class="pill-btn" onclick="switchUser()">Trocar</button>
        </div>
      </div>
      <div class="tabs">
        ${tabBtn('jogos','⚽ Jogos')}
        ${tabBtn('ranking','🏅 Ranking')}
        ${tabBtn('buscar','🔍 Buscar')}
        ${tabBtn('admin','🛠 Admin')}
      </div>
    </div>
    <div class="app-main">${renderTab()}</div>
    <div class="footnote">Dados salvos localmente neste navegador (LocalStorage) — nenhum cadastro necessário.</div>
  </div>`;
}
function tabBtn(id,label){
  return `<button class="tab-btn ${activeTab===id?'active':''}" onclick="setTab('${id}')">${label}</button>`;
}
function setTab(id){ activeTab = id; render(); }

function renderTab(){
  if(activeTab === 'jogos') return renderJogosTab();
  if(activeTab === 'ranking') return renderRankingTab();
  if(activeTab === 'buscar') return renderBuscarTab();
  if(activeTab === 'admin') return renderAdminTab();
  return '';
}

/* ---------------- JOGOS TAB ---------------- */
function renderJogosTab(){
  let html = quickAddPanel();
  if(games.length === 0){
    html += `<div class="section-head"><div class="section-title">Próximos jogos</div></div>
      <div class="empty-state">Nenhum jogo cadastrado ainda.<br>Use o formulário acima para registrar seu primeiro palpite, ou peça ao administrador para cadastrar a tabela na aba Admin.</div>`;
    return html;
  }
  const sorted = [...games].sort((a,b) => (a.data+a.horario).localeCompare(b.data+b.horario));
  html += `<div class="section-head">
      <div class="section-title">Próximos jogos</div>
      <div class="section-meta">${games.length} jogo(s) cadastrado(s)</div>
    </div>`;
  let lastDay = null;
  sorted.forEach(g => {
    if(g.data !== lastDay){
      html += `<div class="day-divider">${formatDateBR(g.data)}</div><div class="match-grid">`;
      lastDay = g.data;
    }
    html += matchCard(g);
    const isLastOfDay = sorted.indexOf(g) === sorted.length - 1 || sorted[sorted.indexOf(g)+1].data !== g.data;
    if(isLastOfDay) html += `</div>`;
  });
  return html;
}

function quickAddPanel(){
  return `
  <div class="panel" style="margin-bottom:28px;">
    <h3>⚡ Adicionar palpite</h3>
    <div class="section-meta" style="margin-bottom:14px;">Escolha a data e as duas seleções da Copa, informe seu placar e salve — o confronto aparece na lista abaixo.</div>
    <div class="form-grid">
      <div>
        <label class="field-label">Data do jogo</label>
        <input type="date" id="quickDate" class="input-base">
      </div>
    </div>
    <div class="form-grid">
      <div class="autocomplete-wrap">
        <label class="field-label">Seleção 1</label>
        ${teamAutocompleteBlock('qhome')}
      </div>
      <div class="autocomplete-wrap">
        <label class="field-label">Seleção 2</label>
        ${teamAutocompleteBlock('qaway')}
      </div>
    </div>
    <div class="form-grid">
      <div>
        <label class="field-label">Seu placar — Seleção 1</label>
        <input type="number" min="0" max="20" id="quickScoreHome" class="input-base" placeholder="0">
      </div>
      <div>
        <label class="field-label">Seu placar — Seleção 2</label>
        <input type="number" min="0" max="20" id="quickScoreAway" class="input-base" placeholder="0">
      </div>
    </div>
    <button class="btn btn-primary" onclick="quickAddPalpite()">Salvar Palpite</button>
  </div>`;
}

function quickAddPalpite(){
  const date = document.getElementById('quickDate').value;
  const homeCode = document.getElementById('ac-code-qhome').value;
  const awayCode = document.getElementById('ac-code-qaway').value;
  const h = parseInt(document.getElementById('quickScoreHome').value, 10);
  const a = parseInt(document.getElementById('quickScoreAway').value, 10);

  if(!date){ showToast('Escolha a data do jogo.'); return; }
  if(!homeCode || !awayCode){ showToast('Selecione as duas seleções na lista de sugestões.'); return; }
  if(homeCode === awayCode){ showToast('As seleções precisam ser diferentes.'); return; }
  if(isNaN(h) || isNaN(a) || h < 0 || a < 0){ showToast('Informe o placar do seu palpite.'); return; }

  // reaproveita o jogo se já existir um com essas duas seleções nessa data (em qualquer ordem)
  let game = games.find(g => g.data === date &&
    ((g.casa === homeCode && g.fora === awayCode) || (g.casa === awayCode && g.fora === homeCode)));

  if(!game){
    game = {id: nextId(games), casa: homeCode, fora: awayCode, data: date, horario: '23:59', estadio: 'A definir'};
    games.push(game);
    persistGames();
  }

  if(isLocked(game)){ showToast('Esse jogo já começou — não é possível palpitar.'); render(); return; }

  // ajusta a ordem do placar caso o jogo já exista com casa/fora invertidos
  let golsCasa = h, golsFora = a;
  if(game.casa === awayCode){ golsCasa = a; golsFora = h; }

  const existing = predictions.find(p => p.gameId === game.id && normalize(p.user) === normalize(currentUser));
  if(existing){ existing.golsCasa = golsCasa; existing.golsFora = golsFora; }
  else { predictions.push({id: nextId(predictions), user: currentUser, gameId: game.id, golsCasa, golsFora}); }
  persistPredictions();

  showToast('Palpite salvo! Veja na lista abaixo.');
  render();
}

function matchCard(g){
  const home = getTeam(g.casa), away = getTeam(g.fora);
  const locked = isLocked(g);
  const res = getResult(g.id);
  const pred = getPrediction(currentUser, g.id);
  const homeVal = pred ? pred.golsCasa : '';
  const awayVal = pred ? pred.golsFora : '';
  let statusChip = locked ? `<span class="status-chip status-locked">🔒 Encerrado</span>` : `<span class="status-chip status-open">🟢 Aberto</span>`;
  if(res) statusChip = `<span class="status-chip status-final">✓ Resultado oficial</span>`;

  let body;
  if(res){
    const pts = pred ? computeScore(pred, res) : null;
    body = `
      <div class="official-result">
        <span>${res.golsCasa}</span><span style="color:var(--text-faint);font-size:18px;">x</span><span>${res.golsFora}</span>
      </div>
      ${pred ? `<div style="text-align:center;color:var(--text-dim);font-size:12.5px;margin-bottom:10px;">Seu palpite: ${pred.golsCasa} x ${pred.golsFora}</div>` : `<div style="text-align:center;color:var(--text-faint);font-size:12.5px;margin-bottom:10px;">Você não palpitou neste jogo</div>`}
      ${pred !== null ? `<div style="text-align:center;"><span class="points-badge">+${pts} pts</span></div>` : ''}
    `;
  } else {
    body = `
      <div class="score-stepper" style="gap:14px;">
        <input type="number" min="0" max="20" class="score-input" id="h-${g.id}" value="${homeVal}" ${locked?'disabled':''} placeholder="-">
        <span class="vs-mark">X</span>
        <input type="number" min="0" max="20" class="score-input" id="a-${g.id}" value="${awayVal}" ${locked?'disabled':''} placeholder="-">
      </div>
      <div class="match-foot">
        ${locked
          ? `<span class="section-meta">Palpites encerrados para este jogo</span>`
          : `<button class="btn btn-primary save-btn" style="margin-top:0;" onclick="saveGuess(${g.id})">Salvar Palpite</button>`}
      </div>
    `;
  }

  return `
  <div class="match-card ${locked?'locked':''}">
    <div class="match-meta-row">
      <span>📅 ${formatDateBR(g.data)} &nbsp;·&nbsp; 📍 ${escapeHtml(g.estadio)}</span>
      ${statusChip}
    </div>
    <div class="teams-row">
      <div class="team-block">
        <div class="flag-badge">${home.flag}</div>
        <div class="team-name">${escapeHtml(home.name)}</div>
        <div class="team-code">${home.code}</div>
      </div>
      <div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div style="font-size:11px;color:var(--text-faint);">${pad2((new Date(gameDateTime(g))).getHours())}:${pad2((new Date(gameDateTime(g))).getMinutes())}</div>
      </div>
      <div class="team-block">
        <div class="flag-badge">${away.flag}</div>
        <div class="team-name">${escapeHtml(away.name)}</div>
        <div class="team-code">${away.code}</div>
      </div>
    </div>
    <div style="margin-top:14px;">${body}</div>
  </div>`;
}

function saveGuess(gameId){
  const g = games.find(x => x.id === gameId);
  if(!g || isLocked(g)){ showToast('Este jogo já começou — palpite bloqueado.'); render(); return; }
  const hEl = document.getElementById('h-'+gameId), aEl = document.getElementById('a-'+gameId);
  const h = parseInt(hEl.value, 10), a = parseInt(aEl.value, 10);
  if(isNaN(h) || isNaN(a) || h < 0 || a < 0){ showToast('Informe os dois placares.'); return; }
  const existing = predictions.find(p => p.gameId === gameId && normalize(p.user) === normalize(currentUser));
  if(existing){ existing.golsCasa = h; existing.golsFora = a; }
  else { predictions.push({id: nextId(predictions), user: currentUser, gameId, golsCasa: h, golsFora: a}); }
  persistPredictions();
  showToast('Palpite salvo!');
  render();
}

/* ---------------- RANKING TAB ---------------- */
function renderRankingTab(){
  const rows = buildRanking();
  if(rows.length === 0){
    return `<div class="section-head"><div class="section-title">Classificação geral</div></div>
      <div class="empty-state">Ainda não há palpites registrados para gerar o ranking.</div>`;
  }
  const top3 = rows.slice(0,3);
  const order = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHtml = top3.length ? `<div class="podium">${order.map(r => {
    const pos = top3.indexOf(r);
    const cls = pos===0?'gold':pos===1?'silver':'bronze';
    const medal = pos===0?'🥇':pos===1?'🥈':'🥉';
    return `<div class="podium-spot">
        <div class="podium-flag">${medal}</div>
        <div class="podium-name">${escapeHtml(r.name)}</div>
        <div class="podium-pts">${r.pts} pts • ${r.exact} placar(es) exato(s)</div>
        <div class="podium-bar ${cls}">${pos+1}</div>
      </div>`;
  }).join('')}</div>` : '';

  const rest = rows.slice(3);
  const tableRows = rows.map((r, i) => `
    <tr class="${normalize(r.name)===normalize(currentUser)?'you-row':''}">
      <td class="rank-pos">${i+1}</td>
      <td>${escapeHtml(r.name)}${normalize(r.name)===normalize(currentUser)?' <span style="color:var(--green);font-size:11px;">(você)</span>':''}</td>
      <td class="rank-pts">${r.pts} pts</td>
      <td>${r.exact}</td>
      <td>${r.scored}</td>
    </tr>`).join('');

  return `
    <div class="section-head"><div class="section-title">Classificação geral</div>
      <div class="section-meta">Atualizado em tempo real</div></div>
    ${podiumHtml}
    <div class="panel" style="padding:0;overflow:hidden;">
      <div class="admin-table-wrap">
        <table class="rank-table">
          <thead><tr><th>#</th><th>Participante</th><th>Pontos</th><th>Placares exatos</th><th>Jogos pontuados</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>`;
}

/* ---------------- BUSCAR TAB ---------------- */
function renderBuscarTab(){
  const names = [...new Set(predictions.map(p => p.user))];
  const matches = searchTerm.trim()
    ? names.filter(n => normalize(n).includes(normalize(searchTerm)))
    : names;

  let resultsHtml = '';
  if(searchTerm.trim() && matches.length === 0){
    resultsHtml = `<div class="empty-state">Nenhum participante encontrado para "${escapeHtml(searchTerm)}".</div>`;
  } else {
    matches.sort((a,b)=>a.localeCompare(b)).forEach(name => {
      const userPreds = predictions.filter(p => p.user === name);
      let pts = 0, exact = 0;
      const lines = userPreds.map(p => {
        const g = games.find(x => x.id === p.gameId);
        if(!g) return '';
        const home = getTeam(g.casa), away = getTeam(g.fora);
        const res = getResult(g.id);
        let scoreText = `${p.golsCasa} x ${p.golsFora}`;
        if(res){
          const s = computeScore(p, res);
          pts += s;
          if(p.golsCasa===res.golsCasa && p.golsFora===res.golsFora) exact++;
        }
        return `<div class="guess-line">
            <div class="gl-teams">${home.flag} ${escapeHtml(home.name)} <span style="color:var(--text-faint);">x</span> ${escapeHtml(away.name)} ${away.flag}</div>
            <div class="gl-score">${scoreText}</div>
          </div>`;
      }).join('');
      resultsHtml += `<div class="participant-result">
          <h4>${escapeHtml(name)}</h4>
          <div class="stats-line">${pts} pts • ${exact} placar(es) exato(s) • ${userPreds.length} palpite(s)</div>
          ${lines || '<div class="section-meta">Nenhum palpite registrado.</div>'}
        </div>`;
    });
  }
  if(matches.length === 0 && !searchTerm.trim()){
    resultsHtml = `<div class="empty-state">Ainda não há palpites registrados para consultar.</div>`;
  }

  return `
    <div class="section-head"><div class="section-title">Consultar palpites</div></div>
    <div class="search-bar">
      <input class="input-base" id="searchInput" placeholder="Pesquisar participante..." value="${escapeHtml(searchTerm)}"
        oninput="searchTerm=this.value; renderSearchResultsOnly();">
    </div>
    <div id="searchResults">${resultsHtml}</div>`;
}
function renderSearchResultsOnly(){
  document.getElementById('searchResults').outerHTML = renderBuscarTab().match(/<div id="searchResults">[\s\S]*<\/div>$/)[0];
  document.getElementById('searchInput').focus();
}

/* ---------------- ADMIN TAB ---------------- */
function renderAdminTab(){
  if(!isAdmin){
    return `
    <div class="admin-gate">
      <div class="panel">
        <h3>Acesso restrito</h3>
        <p class="section-meta" style="margin-bottom:14px;">Informe a chave administrativa configurada no código para gerenciar jogos e resultados.</p>
        <input id="adminKeyInput" type="password" class="input-base" placeholder="Chave de administrador"
          onkeydown="if(event.key==='Enter') tryAdminLogin()">
        ${adminError ? `<div style="color:var(--red);font-size:12.5px;margin-top:8px;">${escapeHtml(adminError)}</div>` : ''}
        <button class="btn btn-primary" onclick="tryAdminLogin()">Entrar como Admin</button>
      </div>
    </div>`;
  }

  const acHome = teamAutocompleteBlock('home');
  const acAway = teamAutocompleteBlock('away');

  const tableRows = [...games].sort((a,b)=>(a.data+a.horario).localeCompare(b.data+b.horario)).map(g => {
    const home = getTeam(g.casa), away = getTeam(g.fora);
    const res = getResult(g.id);
    return `<tr>
      <td>${home.flag} ${escapeHtml(home.name)} <span style="color:var(--text-faint);">x</span> ${away.flag} ${escapeHtml(away.name)}</td>
      <td>${formatDateBR(g.data)}<br><span class="section-meta">${g.horario}</span></td>
      <td>${escapeHtml(g.estadio)}</td>
      <td>
        <input type="number" min="0" class="mini-score" id="res-h-${g.id}" value="${res?res.golsCasa:''}" placeholder="-">
        <input type="number" min="0" class="mini-score" id="res-a-${g.id}" value="${res?res.golsFora:''}" placeholder="-">
      </td>
      <td>
        <div class="row-actions">
          <button class="btn btn-sm btn-gold" onclick="saveResult(${g.id})">Salvar</button>
          <button class="btn btn-sm btn-secondary" onclick="editGame(${g.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteGame(${g.id})">Excluir</button>
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--text-faint);padding:24px;">Nenhum jogo cadastrado.</td></tr>`;

  return `
  <div class="section-head">
    <div class="section-title">Painel do administrador</div>
    <button class="btn btn-sm btn-secondary" onclick="adminLogout()">Sair do modo admin</button>
  </div>
  <div class="admin-grid">
    <div class="panel">
      <h3>${editingGameId ? 'Editar jogo' : 'Cadastrar novo jogo'}</h3>
      <div class="form-grid">
        <div class="autocomplete-wrap">
          <label class="field-label">Seleção da casa</label>
          ${acHome}
        </div>
        <div class="autocomplete-wrap">
          <label class="field-label">Seleção visitante</label>
          ${acAway}
        </div>
      </div>
      <div class="form-grid">
        <div>
          <label class="field-label">Data</label>
          <input type="date" id="gameDate" class="input-base">
        </div>
        <div>
          <label class="field-label">Horário</label>
          <input type="time" id="gameTime" class="input-base">
        </div>
      </div>
      <div class="form-grid full">
        <div>
          <label class="field-label">Estádio</label>
          <input type="text" id="gameStadium" class="input-base" placeholder="Ex: Maracanã">
        </div>
      </div>
      <button class="btn btn-primary" onclick="saveGameForm()">${editingGameId ? 'Atualizar jogo' : 'Adicionar jogo'}</button>
      ${editingGameId ? `<button class="btn btn-secondary btn-block" style="margin-top:8px;" onclick="cancelEditGame()">Cancelar edição</button>` : ''}
    </div>

    <div class="panel">
      <h3>Jogos cadastrados &amp; resultados oficiais</h3>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Confronto</th><th>Data / Hora</th><th>Estádio</th><th>Resultado</th><th>Ações</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <div class="export-row">
        <button class="btn btn-secondary" onclick="exportCSV()">⬇ Exportar CSV</button>
        <button class="btn btn-secondary" onclick="exportXLSX()">⬇ Exportar Excel (.xlsx)</button>
      </div>
    </div>
  </div>`;
}

function teamAutocompleteBlock(prefix){
  return `
    <input type="text" id="ac-input-${prefix}" class="input-base" autocomplete="off"
      placeholder="Digite o nome da seleção..." oninput="acFilter('${prefix}')" onfocus="acFilter('${prefix}')">
    <div class="ac-dropdown" id="ac-dropdown-${prefix}"></div>
    <div class="ac-preview" id="ac-preview-${prefix}"></div>
    <input type="hidden" id="ac-code-${prefix}">
  `;
}
function acFilter(prefix){
  const input = document.getElementById('ac-input-'+prefix);
  const dropdown = document.getElementById('ac-dropdown-'+prefix);
  const q = normalize(input.value);
  const matches = q ? TEAMS.filter(t => normalize(t.name).includes(q) || normalize(t.code).includes(q)).slice(0,8) : TEAMS.slice(0,8);
  dropdown.innerHTML = matches.map(t =>
    `<div class="ac-item" onmousedown="event.preventDefault(); acSelect('${prefix}','${t.code}')">
      <span style="font-size:18px;">${t.flag}</span> ${escapeHtml(t.name)} <span class="ac-code">${t.code}</span>
    </div>`).join('') || `<div class="ac-item" style="color:var(--text-faint);">Nenhuma seleção encontrada</div>`;
  dropdown.classList.add('show');
}
function acSelect(prefix, code){
  const team = getTeam(code);
  document.getElementById('ac-input-'+prefix).value = team.name;
  document.getElementById('ac-code-'+prefix).value = code;
  document.getElementById('ac-preview-'+prefix).innerHTML = `${team.flag} ${escapeHtml(team.name)} (${team.code})`;
  document.getElementById('ac-dropdown-'+prefix).classList.remove('show');
}
document.addEventListener('click', (e) => {
  if(!e.target.closest('.autocomplete-wrap')){
    document.querySelectorAll('.ac-dropdown').forEach(d => d.classList.remove('show'));
  }
});

function tryAdminLogin(){
  const val = document.getElementById('adminKeyInput').value;
  if(val === ADMIN_KEY){
    isAdmin = true; adminError = '';
    sessionStorage.setItem('bolao_admin','1');
    render();
  } else {
    adminError = 'Chave incorreta. Tente novamente.';
    render();
  }
}
function adminLogout(){
  isAdmin = false;
  sessionStorage.removeItem('bolao_admin');
  render();
}

function saveGameForm(){
  const homeCode = document.getElementById('ac-code-home').value;
  const awayCode = document.getElementById('ac-code-away').value;
  const date = document.getElementById('gameDate').value;
  const time = document.getElementById('gameTime').value;
  const stadium = document.getElementById('gameStadium').value.trim();

  if(!homeCode || !awayCode){ showToast('Selecione as duas seleções na lista de sugestões.'); return; }
  if(homeCode === awayCode){ showToast('As seleções precisam ser diferentes.'); return; }
  if(!date || !time || !stadium){ showToast('Preencha data, horário e estádio.'); return; }

  if(editingGameId){
    const g = games.find(x => x.id === editingGameId);
    g.casa = homeCode; g.fora = awayCode; g.data = date; g.horario = time; g.estadio = stadium;
    showToast('Jogo atualizado!');
    editingGameId = null;
  } else {
    games.push({id: nextId(games), casa: homeCode, fora: awayCode, data: date, horario: time, estadio: stadium});
    showToast('Jogo cadastrado!');
  }
  persistGames();
  render();
}

function editGame(id){
  const g = games.find(x => x.id === id);
  if(!g) return;
  editingGameId = id;
  render();
  const home = getTeam(g.casa), away = getTeam(g.fora);
  document.getElementById('ac-input-home').value = home.name;
  document.getElementById('ac-code-home').value = home.code;
  document.getElementById('ac-preview-home').innerHTML = `${home.flag} ${escapeHtml(home.name)} (${home.code})`;
  document.getElementById('ac-input-away').value = away.name;
  document.getElementById('ac-code-away').value = away.code;
  document.getElementById('ac-preview-away').innerHTML = `${away.flag} ${escapeHtml(away.name)} (${away.code})`;
  document.getElementById('gameDate').value = g.data;
  document.getElementById('gameTime').value = g.horario;
  document.getElementById('gameStadium').value = g.estadio;
  window.scrollTo({top:0, behavior:'smooth'});
}
function cancelEditGame(){ editingGameId = null; render(); }

function deleteGame(id){
  if(!confirm('Excluir este jogo? Os palpites relacionados também serão removidos.')) return;
  games = games.filter(g => g.id !== id);
  predictions = predictions.filter(p => p.gameId !== id);
  results = results.filter(r => r.gameId !== id);
  persistGames(); persistPredictions(); persistResults();
  showToast('Jogo excluído.');
  render();
}

function saveResult(gameId){
  const h = parseInt(document.getElementById('res-h-'+gameId).value, 10);
  const a = parseInt(document.getElementById('res-a-'+gameId).value, 10);
  if(isNaN(h) || isNaN(a) || h < 0 || a < 0){ showToast('Informe os dois placares do resultado oficial.'); return; }
  let r = results.find(x => x.gameId === gameId);
  if(r){ r.golsCasa = h; r.golsFora = a; }
  else { results.push({id: nextId(results), gameId, golsCasa: h, golsFora: a}); }
  persistResults();
  showToast('Resultado salvo! Ranking atualizado.');
  render();
}

/* ---------------- Export ---------------- */
function buildExportRows(){
  return predictions.map(p => {
    const g = games.find(x => x.id === p.gameId);
    if(!g) return null;
    const home = getTeam(g.casa), away = getTeam(g.fora);
    const res = getResult(g.id);
    return {
      Participante: p.user,
      Casa: home.name,
      Fora: away.name,
      Data: formatDateBR(g.data),
      Horario: g.horario,
      Estadio: g.estadio,
      PalpiteCasa: p.golsCasa,
      PalpiteFora: p.golsFora,
      ResultadoCasa: res ? res.golsCasa : '',
      ResultadoFora: res ? res.golsFora : '',
      Pontos: res ? computeScore(p, res) : ''
    };
  }).filter(Boolean);
}
function downloadBlob(content, filename, mime){
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function exportCSV(){
  const rows = buildExportRows();
  if(rows.length === 0){ showToast('Não há palpites para exportar.'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(';')]
    .concat(rows.map(r => headers.map(h => String(r[h]).replace(/;/g,',')).join(';')))
    .join('\n');
  downloadBlob('\uFEFF' + csv, 'bolao-palpites.csv', 'text/csv;charset=utf-8;');
  showToast('CSV exportado!');
}
function exportXLSX(){
  if(typeof XLSX === 'undefined'){ showToast('Biblioteca de exportação não carregou. Verifique sua conexão.'); return; }
  const rows = buildExportRows();
  const rankingRows = buildRanking().map((r,i) => ({Posicao:i+1, Participante:r.name, Pontos:r.pts, PlacaresExatos:r.exact, JogosPontuados:r.scored}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rankingRows), 'Ranking');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Palpites');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(games.map(g => ({...g, Casa:getTeam(g.casa).name, Fora:getTeam(g.fora).name}))), 'Jogos');
  XLSX.writeFile(wb, 'bolao-copa-do-mundo.xlsx');
  showToast('Excel exportado!');
}

/* ---------------- misc ---------------- */
function afterRender(){
  // re-focus search input cursor position when typing (handled via partial update already)
}

render();

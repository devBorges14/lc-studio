/* LC Studio – Painel administrativo (prévia: dados no navegador) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const slugS = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const chip = (s) => `<span class="st st--${slugS(s)}">${esc(s)}</span>`;
  const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
  const telWa = (t) => { const d = soNumeros(t); return d.startsWith('55') && d.length > 11 ? d : '55' + d; };
  const fmtTel = (t) => { const d = soNumeros(t).replace(/^55(?=\d{10,11}$)/, ''); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : t || '—'; };
  const mesKey = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const mesNome = (k, longo) => new Date(k + '-15').toLocaleDateString('pt-BR', longo ? { month: 'long', year: 'numeric' } : { month: 'short' }).replace('.', '');
  const hojeData = () => new Date().toISOString().slice(0, 10);
  const opt = (arr, sel) => arr.map(v => `<option${v === sel ? ' selected' : ''}>${esc(v)}</option>`).join('');
  const totalOS = (o) => r2((Number(o.maoDeObra) || 0) + o.pecas.reduce((s, p) => s + (Number(p.valor) || 0), 0));
  const saldoPed = (p) => p.status === 'Cancelado' ? 0 : r2(p.total - (p.pagamento.pago || 0));
  const saldoOS = (o) => o.status === 'Cancelado' ? 0 : r2(totalOS(o) - (o.pagamento.pago || 0));
  const ABERTOS = (s) => !['Entregue', 'Cancelado'].includes(s);

  /* ---------------- Login ---------------- */
  function telaLogin(msg = '') {
    document.title = 'Entrar no painel – LC Studio';
    app.innerHTML = `
      <div class="login-adm">
        <div class="authcard">
          <img src="assets/img/logo-roxo.png" alt="LC Studio" style="height:44px;margin-bottom:18px">
          <h1 style="font-size:1.5rem;font-weight:800">Painel administrativo</h1>
          <p style="color:var(--muted);font-size:.9rem;margin:4px 0 6px">Acesso restrito à equipe.</p>
          <form id="fLogin" class="fgrid" novalidate>
            <label class="f"><span>E-mail</span><input class="inp" name="email" type="email" autocomplete="username" required></label>
            <label class="f"><span>Senha</span><input class="inp" name="senha" type="password" autocomplete="current-password" required></label>
            <p class="err" id="lErr" ${msg ? '' : 'hidden'}>${esc(msg)}</p>
            <button class="btn btn--primary btn--lg btn--block">${ic('lock')} Entrar</button>
          </form>
          <div class="demo"><b>Acesso de demonstração</b>
            <div class="demo__row"><span><code>${DEMO.admin.email}</code><br>senha <code>${DEMO.admin.senha}</code></span><button type="button" class="btn btn--soft btn--sm" id="useDemo">Usar</button></div>
          </div>
          <a class="linkbtn" href="index.html" style="margin-top:10px">${ic('back')} Voltar ao site</a>
        </div>
      </div>`;
    $('#useDemo').onclick = () => { const f = $('#fLogin'); f.email.value = DEMO.admin.email; f.senha.value = DEMO.admin.senha; f.querySelector('button').focus(); };
    $('#fLogin').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = Auth.entrar(e.target.email.value, e.target.senha.value);
      if (!u) return telaLogin('E-mail ou senha incorretos.');
      if (u.papel !== 'admin') { Auth.sair(); return telaLogin('Esta conta não tem acesso ao painel.'); }
      iniciar();
    });
  }

  /* ---------------- Modal ---------------- */
  const modal = document.createElement('div');
  modal.className = 'modal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  document.body.appendChild(modal);
  function abrir(html, montar) {
    modal.innerHTML = `<div class="sheet"><div class="sheet__grab"></div>${html}</div>`;
    modal.hidden = false; document.body.classList.add('lb-open', 'modal-open');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    $$('[data-close]', modal).forEach(b => b.onclick = fechar);
    if (montar) montar($('.sheet', modal));
  }
  function fechar() {
    modal.classList.remove('is-open'); document.body.classList.remove('lb-open', 'modal-open');
    setTimeout(() => { modal.hidden = true; modal.innerHTML = ''; }, 200);
  }
  modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) fechar(); });
  const cabeca = (t, sub) => `<div class="sheet__h"><div><h2>${t}</h2>${sub ? `<small>${sub}</small>` : ''}</div><button class="sheet__x" data-close aria-label="Fechar">${ic('x')}</button></div>`;

  /* ---------------- Estrutura ---------------- */
  const ABAS = [
    ['inicio', 'Visão geral', 'grid'],
    ['pedidos', 'Pedidos', 'box'],
    ['os', 'Ordens de serviço', 'wrench'],
    ['financeiro', 'Financeiro', 'money'],
    ['clientes', 'Clientes', 'users'],
    ['produtos', 'Produtos e preços', 'tag'],
    ['config', 'Configurações', 'settings']
  ];
  let estado = { filtroPed: 'Abertos', buscaPed: '', filtroOS: 'Abertas', buscaOS: '', mes: mesKey(hojeISO()), filtroFin: 'Todos', buscaCli: '' };

  function iniciar() {
    const u = Auth.atual();
    if (!u || u.papel !== 'admin') return telaLogin();
    document.title = 'Painel – LC Studio';
    app.innerHTML = `
      <div class="adm">
        <header class="adm-top"><div class="adm-top__in">
          <img src="assets/img/logo-branco.png" alt="LC Studio">
          <span class="adm-top__tag">Painel</span>
          <span class="adm-top__sp"></span>
          <a href="index.html" title="Ver site" aria-label="Ver site">${ic('home')}</a>
          <button id="sair" title="Sair" aria-label="Sair">${ic('logout')}</button>
        </div></header>
        <nav class="adm-nav" id="admNav" aria-label="Seções do painel"></nav>
        <main class="adm-main" id="view"></main>
      </div>`;
    $('#sair').onclick = () => { Auth.sair(); location.href = 'index.html'; };
    window.addEventListener('hashchange', rota);
    rota();
  }

  function navegar(aba) { if (location.hash.slice(1) === aba) rota(); else location.hash = aba; }

  function rota() {
    const aba = ABAS.some(a => a[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'inicio';
    const novos = Banco.pedidos().filter(p => p.status === 'Novo').length;
    const osAb = Banco.os().filter(o => ABERTOS(o.status)).length;
    $('#admNav').innerHTML = ABAS.map(([k, t, i]) => `<button data-aba="${k}" class="${k === aba ? 'is-on' : ''}">${ic(i)}${t}${k === 'pedidos' && novos ? `<span class="cnt">${novos}</span>` : ''}${k === 'os' && osAb ? `<span class="cnt">${osAb}</span>` : ''}</button>`).join('');
    $$('#admNav button').forEach(b => b.onclick = () => navegar(b.dataset.aba));
    $('#admNav .is-on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    VIEWS[aba]();
    window.scrollTo(0, 0);
  }
  const demoBar = () => `<div class="adm-demo">${ic('bolt')}<span><b>Prévia:</b> os dados de exemplo e o que você cadastrar ficam salvos só neste navegador.</span></div>`;

  /* ================= VISÃO GERAL ================= */
  function vInicio() {
    const peds = Banco.pedidos(), oss = Banco.os(), fin = Banco.lanc();
    const mes = mesKey(hojeISO());
    const doMes = fin.filter(l => mesKey(l.data) === mes);
    const ent = doMes.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
    const sai = doMes.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
    const receber = peds.reduce((s, p) => s + saldoPed(p), 0) + oss.reduce((s, o) => s + saldoOS(o), 0);
    const meses = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return mesKey(d.toISOString()); });
    const serie = meses.map(m => ({ m, e: fin.filter(l => l.tipo === 'entrada' && mesKey(l.data) === m).reduce((s, l) => s + l.valor, 0), s: fin.filter(l => l.tipo === 'saida' && mesKey(l.data) === m).reduce((s, l) => s + l.valor, 0) }));
    const max = Math.max(1, ...serie.flatMap(x => [x.e, x.s]));
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const em7 = new Date(hoje); em7.setDate(em7.getDate() + 7);
    const prox = peds.filter(p => ABERTOS(p.status) && p.prazo && new Date(p.prazo + 'T12:00') <= em7).sort((a, b) => a.prazo.localeCompare(b.prazo));
    const pedMes = peds.filter(p => mesKey(p.criadoEm) === mes && p.status !== 'Cancelado');
    const u = Auth.atual();
    $('#view').innerHTML = `
      ${demoBar()}
      <div class="adm-h"><div><h1>Olá, ${esc(u.nome.split(' ')[0])}</h1><p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
        <button class="btn btn--primary" id="novoPed">${ic('plus')} Pedido</button></div>
      <div class="kpis">
        <div class="kpi kpi--dark"><small>${ic('money')} Faturamento do mês</small><b>${brl(ent)}</b><span>${mesNome(mes, true)}</span></div>
        <div class="kpi"><small>${ic('chart')} Lucro do mês</small><b class="${ent - sai >= 0 ? 'pos' : 'neg'}">${brl(ent - sai)}</b><span>Despesas: ${brl(sai)}</span></div>
        <div class="kpi"><small>${ic('calendar')} A receber</small><b>${brl(receber)}</b><span>Pedidos e OS em aberto</span></div>
        <div class="kpi"><small>${ic('box')} Pedidos no mês</small><b>${pedMes.length}</b><span>Ticket médio ${brl(pedMes.length ? pedMes.reduce((s, p) => s + p.total, 0) / pedMes.length : 0)}</span></div>
      </div>
      <div class="adm-cols">
        <div>
          <section class="panel"><div class="panel__h"><h2>Entradas × saídas</h2><button class="lk" data-go="financeiro">Financeiro</button></div>
            <div class="bars">${serie.map(x => `<div class="bar" title="${mesNome(x.m, true)}: entradas ${brl(x.e)} / saídas ${brl(x.s)}"><div class="bar__pair"><i style="height:${x.e / max * 100}%"></i><i class="s" style="height:${x.s / max * 100}%"></i></div><small>${mesNome(x.m)}</small></div>`).join('')}</div>
            <div class="legend"><span><i></i>Entradas</span><span><i class="s"></i>Saídas</span></div>
          </section>
          <section class="panel"><div class="panel__h"><h2>Últimos pedidos</h2><button class="lk" data-go="pedidos">Ver todos</button></div>
            <div class="rows">${peds.slice(0, 5).map(rowPed).join('')}</div>
          </section>
        </div>
        <div>
          <section class="panel"><div class="panel__h"><h2>Pedidos por etapa</h2></div>
            <div class="funnel">${STATUS_PEDIDO.filter(s => s !== 'Cancelado').map(s => `<button data-st="${s}"><span>${chip(s)}</span><b>${peds.filter(p => p.status === s).length}</b></button>`).join('')}</div>
          </section>
          <section class="panel"><div class="panel__h"><h2>Prazos (próximos 7 dias)</h2></div>
            ${prox.length ? `<div class="rows">${prox.map(p => { const atras = new Date(p.prazo + 'T12:00') < hoje; return `<button class="row" data-ped="${p.id}"><span class="row__t">${p.id}<small>${esc(p.cliente.nome)}</small></span><span class="row__v ${atras ? 'neg' : ''}" style="font-size:.85rem">${atras ? 'Atrasado · ' : ''}${fmtData(p.prazo + 'T12:00')}</span><span class="row__s">${esc(p.itens.map(i => i.nome).join(', '))}</span><span class="row__r">${chip(p.status)}</span></button>`; }).join('')}</div>` : '<div class="nada">Nenhum prazo nos próximos dias.</div>'}
          </section>
          <section class="panel"><div class="panel__h"><h2>Assistência técnica</h2><button class="lk" data-go="os">Ver OS</button></div>
            <div class="funnel">${STATUS_OS.filter(s => ABERTOS(s)).map(s => `<button data-os-st="${s}"><span>${chip(s)}</span><b>${oss.filter(o => o.status === s).length}</b></button>`).join('')}</div>
          </section>
        </div>
      </div>`;
    $$('[data-go]').forEach(b => b.onclick = () => navegar(b.dataset.go));
    $$('[data-st]').forEach(b => b.onclick = () => { estado.filtroPed = b.dataset.st; navegar('pedidos'); });
    $$('[data-os-st]').forEach(b => b.onclick = () => { estado.filtroOS = b.dataset.osSt; navegar('os'); });
    $$('[data-ped]').forEach(b => b.onclick = () => detalhePedido(b.dataset.ped));
    $('#novoPed').onclick = novoPedido;
  }

  /* ================= PEDIDOS ================= */
  function rowPed(p) {
    return `<button class="row" data-ped="${p.id}">
      <span class="row__t">${p.id}<small>${esc(p.cliente.nome)}</small></span>
      <span class="row__s">${fmtData(p.criadoEm)} · ${esc(p.itens.map(i => i.nome).join(', '))}</span>
      <span class="row__v">${brl(p.total)}</span>
      <span class="row__r">${chip(p.status)}${chip(p.pagamento.status)}</span>
    </button>`;
  }
  function vPedidos() {
    const filtros = ['Abertos', 'Todos', ...STATUS_PEDIDO];
    const desenhar = () => {
      const q = estado.buscaPed.trim().toLowerCase();
      const lista = Banco.pedidos().filter(p =>
        (estado.filtroPed === 'Todos' || (estado.filtroPed === 'Abertos' ? ABERTOS(p.status) : p.status === estado.filtroPed)) &&
        (!q || [p.id, p.cliente.nome, p.cliente.telefone, ...p.itens.map(i => i.nome)].join(' ').toLowerCase().includes(q)));
      $('#lista').innerHTML = lista.length ? lista.map(rowPed).join('') : '<div class="nada">Nenhum pedido encontrado.</div>';
      $('#tot').textContent = `${lista.length} pedido${lista.length === 1 ? '' : 's'} · ${brl(lista.reduce((s, p) => s + p.total, 0))}`;
      $$('#lista [data-ped]').forEach(b => b.onclick = () => detalhePedido(b.dataset.ped));
    };
    $('#view').innerHTML = `
      <div class="adm-h"><div><h1>Pedidos</h1><p id="tot"></p></div><button class="btn btn--primary" id="novo">${ic('plus')} Novo pedido</button></div>
      <div class="toolbar">
        <label class="search">${ic('search')}<input class="inp" type="search" placeholder="Buscar nº, cliente, telefone…" value="${esc(estado.buscaPed)}" id="busca" aria-label="Buscar pedidos"></label>
        <div class="fchips">${filtros.map(f => `<button data-f="${f}" class="${f === estado.filtroPed ? 'is-on' : ''}">${f}</button>`).join('')}</div>
      </div>
      <div class="rows" id="lista"></div>`;
    $('#busca').oninput = (e) => { estado.buscaPed = e.target.value; desenhar(); };
    $$('[data-f]').forEach(b => b.onclick = () => { estado.filtroPed = b.dataset.f; $$('[data-f]').forEach(x => x.classList.toggle('is-on', x === b)); desenhar(); });
    $('#novo').onclick = novoPedido;
    desenhar();
  }

  function salvarPedido(p, nota) {
    const ps = Banco.pedidos(); const i = ps.findIndex(x => x.id === p.id);
    if (nota) p.historico.push({ em: hojeISO(), txt: nota });
    ps[i] = p; Banco.salvarPedidos(ps);
  }
  function registrarEntrada(valor, forma, categoria, desc, ref) {
    const l = Banco.lanc(); l.unshift({ id: uid(), data: hojeISO(), tipo: 'entrada', categoria, descricao: desc, valor: r2(valor), forma, ref }); Banco.salvarLanc(l);
  }

  function detalhePedido(id) {
    const p = Banco.pedidos().find(x => x.id === id); if (!p) return;
    const saldo = saldoPed(p);
    const msgCli = `Olá, ${p.cliente.nome.split(' ')[0]}! Aqui é da LC Studio. Seu pedido ${p.id} está: *${p.status}*.`;
    abrir(cabeca(`Pedido ${p.id}`, `${fmtDataHora(p.criadoEm)} · via ${esc(p.origem)}`) + `
      <div class="sec" style="border:0;padding-top:4px">
        <div class="g2">
          <label class="f"><span>Status</span><span class="sel"><select class="inp" id="mSt">${opt(STATUS_PEDIDO, p.status)}</select></span></label>
          <label class="f"><span>Prazo</span><input class="inp" type="date" id="mPrazo" value="${esc(p.prazo || '')}"></label>
        </div>
      </div>
      <div class="sec"><h3>Cliente</h3>
        <dl class="kv"><dt>Nome</dt><dd>${esc(p.cliente.nome)}</dd><dt>WhatsApp</dt><dd>${fmtTel(p.cliente.telefone)}</dd>${p.cliente.email ? `<dt>E-mail</dt><dd>${esc(p.cliente.email)}</dd>` : ''}<dt>Entrega</dt><dd>${esc(p.entrega || '—')}</dd></dl>
        <a class="btn btn--wa btn--block" style="margin-top:12px" target="_blank" rel="noopener" href="${waLink(msgCli, telWa(p.cliente.telefone))}">${ic('wa')} Avisar cliente do status</a>
      </div>
      <div class="sec"><h3>Itens</h3>
        <ul class="items">${p.itens.map(i => `<li><b><span>${esc(i.nome)}</span><span>${brl(i.total)}</span></b><span>${esc(i.detalhe)}${i.linhas?.length ? ' · ' + i.linhas.map(esc).join(' · ') : ''}</span></li>`).join('')}</ul>
        ${p.obs ? `<p style="margin-top:10px;font-size:.88rem"><b>Obs.:</b> ${esc(p.obs)}</p>` : ''}
      </div>
      <div class="sec"><h3>Pagamento</h3>
        <dl class="kv"><dt>Total</dt><dd>${brl(p.total)}</dd><dt>Recebido</dt><dd class="pos">${brl(p.pagamento.pago)}</dd><dt>Falta</dt><dd class="${saldo > 0 ? 'neg' : ''}">${brl(saldo)}</dd><dt>Situação</dt><dd>${chip(p.pagamento.status)}</dd></dl>
        ${saldo > 0 && p.status !== 'Cancelado' ? `
          <div class="g2" style="margin-top:12px">
            <label class="f"><span>Valor recebido</span><input class="inp" type="number" step="0.01" inputmode="decimal" id="mVal" value="${saldo.toFixed(2)}"></label>
            <label class="f"><span>Forma</span><span class="sel"><select class="inp" id="mForma">${opt(FORMAS, 'Pix')}</select></span></label>
          </div>
          <div class="g2" style="margin-top:8px">
            <button class="btn btn--soft" id="mSinal">Registrar 50%</button>
            <button class="btn btn--primary" id="mPagar">${ic('check')} Registrar</button>
          </div>` : ''}
      </div>
      <div class="sec"><h3>Histórico</h3><ul class="hist">${[...p.historico].reverse().map(h => `<li><div>${esc(h.txt)}<small>${fmtDataHora(h.em)}</small></div></li>`).join('')}</ul></div>
      <div class="sheet__btns"><button class="btn btn--outline" id="mPrint">${ic('print')} Imprimir</button><button class="btn btn--soft" data-close>Fechar</button></div>`,
    (sh) => {
      $('#mSt', sh).onchange = (e) => { p.status = e.target.value; salvarPedido(p, 'Status: ' + p.status); toast('Status atualizado'); rota(); detalhePedido(p.id); };
      $('#mPrazo', sh).onchange = (e) => { p.prazo = e.target.value; salvarPedido(p, 'Prazo: ' + fmtData(p.prazo + 'T12:00')); toast('Prazo salvo'); rota(); };
      const pagar = (v) => {
        v = r2(v); if (!(v > 0)) return toast('Informe um valor');
        const forma = $('#mForma', sh).value;
        p.pagamento.pago = r2(p.pagamento.pago + v); p.pagamento.forma = forma;
        p.pagamento.status = p.pagamento.pago >= p.total - 0.009 ? 'Pago' : 'Sinal pago';
        registrarEntrada(v, forma, 'Pedido', `Pedido ${p.id}`, p.id);
        salvarPedido(p, `Recebido ${brl(v)} (${forma})`); toast('Pagamento registrado'); rota(); detalhePedido(p.id);
      };
      $('#mPagar', sh)?.addEventListener('click', () => pagar($('#mVal', sh).value));
      $('#mSinal', sh)?.addEventListener('click', () => pagar(Math.min(saldo, p.total / 2)));
      $('#mPrint', sh).onclick = () => window.print();
    });
  }

  function novoPedido() {
    const ps = produtos().filter(p => !p.inativo);
    abrir(cabeca('Novo pedido', 'Para pedidos do balcão, telefone ou WhatsApp') + `
      <form id="fNovo" class="fgrid" novalidate>
        <div class="g2"><label class="f"><span>Cliente</span><input class="inp" name="nome" required></label><label class="f"><span>WhatsApp</span><input class="inp" name="tel" type="tel" inputmode="tel"></label></div>
        <label class="f"><span>Produto</span><span class="sel"><select class="inp" name="prod"><option value="">Item avulso (digitar)</option>${Object.entries(SETORES).map(([k, s]) => `<optgroup label="${s.nome}">${ps.filter(p => p.setor === k).map(p => `<option value="${p.slug}">${esc(p.nome)}</option>`).join('')}</optgroup>`).join('')}</select></span></label>
        <label class="f"><span>Descrição</span><input class="inp" name="desc" placeholder="Ex.: 500 cartões 4x4, couchê 300 g"></label>
        <div class="g2"><label class="f"><span>Valor (R$)</span><input class="inp" name="valor" type="number" step="0.01" inputmode="decimal" required></label><label class="f"><span>Prazo</span><input class="inp" name="prazo" type="date"></label></div>
        <div class="g2"><label class="f"><span>Origem</span><span class="sel"><select class="inp" name="origem">${opt(['Balcão', 'WhatsApp', 'Telefone', 'Instagram'], 'Balcão')}</select></span></label><label class="f"><span>Entrega</span><span class="sel"><select class="inp" name="entrega">${opt(['Retirada no local', 'Combinar entrega'])}</select></span></label></div>
        <p class="err" id="nErr" hidden></p>
        <button class="btn btn--primary btn--lg btn--block">${ic('check')} Criar pedido</button>
      </form>`, (sh) => {
      const f = $('#fNovo', sh);
      f.prod.onchange = () => { const p = produto(f.prod.value); if (p) { f.valor.value = aPartirDe(p).toFixed(2); if (!f.desc.value) f.desc.value = calcular(p, {}).detalhe; } };
      f.onsubmit = (e) => {
        e.preventDefault();
        const nome = f.nome.value.trim(), valor = r2(f.valor.value);
        if (!nome || !(valor > 0)) { $('#nErr', sh).textContent = 'Informe o cliente e o valor.'; $('#nErr', sh).hidden = false; return; }
        const p = produto(f.prod.value);
        const item = { id: uid(), slug: p?.slug || '', nome: p?.nome || f.desc.value.trim() || 'Item avulso', setor: p?.setor || 'grafica', detalhe: f.desc.value.trim() || 'Pedido manual', linhas: [], total: valor };
        const ped = Banco.criarPedido({ cliente: { nome, telefone: soNumeros(f.tel.value), email: '' }, itens: [item], entrega: f.entrega.value, origem: f.origem.value });
        const ps2 = Banco.pedidos(); ps2[0].prazo = f.prazo.value; ps2[0].historico[0].txt = 'Pedido criado no painel'; Banco.salvarPedidos(ps2);
        fechar(); toast(`Pedido ${ped.id} criado`); estado.filtroPed = 'Abertos'; navegar('pedidos');
      };
    });
  }

  /* ================= ORDENS DE SERVIÇO (T.I.) ================= */
  function rowOS(o) {
    return `<button class="row" data-os="${o.id}">
      <span class="row__t">${o.id}<small>${esc(o.cliente.nome)}</small></span>
      <span class="row__s">${esc(o.equipamento)} · ${esc(o.defeito)}</span>
      <span class="row__v">${totalOS(o) ? brl(totalOS(o)) : '<small style="color:var(--muted)">a orçar</small>'}</span>
      <span class="row__r">${chip(o.status)}</span>
    </button>`;
  }
  function vOS() {
    const filtros = ['Abertas', 'Todas', ...STATUS_OS];
    const desenhar = () => {
      const q = estado.buscaOS.trim().toLowerCase();
      const lista = Banco.os().filter(o =>
        (estado.filtroOS === 'Todas' || (estado.filtroOS === 'Abertas' ? ABERTOS(o.status) : o.status === estado.filtroOS)) &&
        (!q || [o.id, o.cliente.nome, o.cliente.telefone, o.equipamento, o.defeito].join(' ').toLowerCase().includes(q)));
      $('#lista').innerHTML = lista.length ? lista.map(rowOS).join('') : '<div class="nada">Nenhuma ordem de serviço encontrada.</div>';
      $('#tot').textContent = `${lista.length} ordem${lista.length === 1 ? '' : 'ns'} de serviço`;
      $$('#lista [data-os]').forEach(b => b.onclick = () => detalheOS(b.dataset.os));
    };
    $('#view').innerHTML = `
      <div class="adm-h"><div><h1>Ordens de serviço</h1><p id="tot"></p></div><button class="btn btn--primary" id="novo">${ic('plus')} Nova OS</button></div>
      <div class="toolbar">
        <label class="search">${ic('search')}<input class="inp" type="search" placeholder="Buscar nº, cliente, equipamento…" value="${esc(estado.buscaOS)}" id="busca" aria-label="Buscar OS"></label>
        <div class="fchips">${filtros.map(f => `<button data-f="${f}" class="${f === estado.filtroOS ? 'is-on' : ''}">${f}</button>`).join('')}</div>
      </div>
      <div class="rows" id="lista"></div>`;
    $('#busca').oninput = (e) => { estado.buscaOS = e.target.value; desenhar(); };
    $$('[data-f]').forEach(b => b.onclick = () => { estado.filtroOS = b.dataset.f; $$('[data-f]').forEach(x => x.classList.toggle('is-on', x === b)); desenhar(); });
    $('#novo').onclick = novaOS;
    desenhar();
  }
  function salvarOS(o, nota) {
    const l = Banco.os(); const i = l.findIndex(x => x.id === o.id);
    if (nota) o.historico.push({ em: hojeISO(), txt: nota });
    l[i] = o; Banco.salvarOS(l);
  }
  function detalheOS(id, rascunho) {
    const o = rascunho || Banco.os().find(x => x.id === id); if (!o) return;
    const tot = totalOS(o), saldo = saldoOS(o);
    const msgCli = `Olá, ${o.cliente.nome.split(' ')[0]}! Aqui é da LC Informática. Sua OS ${o.id} (${o.equipamento}) está: *${o.status}*.${tot ? ` Valor: ${brl(tot)}.` : ''}`;
    abrir(cabeca(`OS ${o.id}`, `${esc(o.equipamento)} · entrada ${fmtData(o.criadoEm)}`) + `
      <div class="sec" style="border:0;padding-top:4px">
        <label class="f"><span>Status</span><span class="sel"><select class="inp" id="mSt">${opt(STATUS_OS, o.status)}</select></span></label>
      </div>
      <div class="sec"><h3>Cliente e equipamento</h3>
        <dl class="kv"><dt>Cliente</dt><dd>${esc(o.cliente.nome)}</dd><dt>WhatsApp</dt><dd>${fmtTel(o.cliente.telefone)}</dd><dt>Equipamento</dt><dd>${esc(o.equipamento)}</dd><dt>Acessórios</dt><dd>${esc(o.acessorios || 'Nenhum')}</dd><dt>Defeito relatado</dt><dd>${esc(o.defeito)}</dd></dl>
        <a class="btn btn--wa btn--block" style="margin-top:12px" target="_blank" rel="noopener" href="${waLink(msgCli, telWa(o.cliente.telefone))}">${ic('wa')} Avisar cliente</a>
      </div>
      <form class="sec" id="fOS"><h3>Diagnóstico e orçamento</h3>
        <label class="f"><span>Diagnóstico</span><textarea class="inp" name="diag" rows="3" placeholder="O que foi encontrado…">${esc(o.diagnostico)}</textarea></label>
        <div style="margin-top:12px"><span style="font:600 .88rem var(--font-head);color:var(--grafite)">Peças</span>
          <div id="pecas" style="display:grid;gap:8px;margin-top:6px">${o.pecas.map((p, i) => `<div class="g2" style="grid-template-columns:1fr 110px 44px"><input class="inp" name="pd" value="${esc(p.desc)}" aria-label="Peça"><input class="inp" name="pv" type="number" step="0.01" value="${p.valor}" aria-label="Valor"><button type="button" class="linkbtn" data-rmp="${i}" aria-label="Remover peça">${ic('trash')}</button></div>`).join('')}</div>
          <button type="button" class="linkbtn" id="addPeca" style="color:var(--roxo)">${ic('plus')} Adicionar peça</button>
        </div>
        <label class="f" style="margin-top:8px"><span>Mão de obra (R$)</span><input class="inp" name="mo" type="number" step="0.01" inputmode="decimal" value="${o.maoDeObra || ''}"></label>
        <button class="btn btn--primary btn--block" style="margin-top:12px">${ic('check')} Salvar orçamento</button>
      </form>
      <div class="sec"><h3>Pagamento</h3>
        <dl class="kv"><dt>Total</dt><dd>${brl(tot)}</dd><dt>Recebido</dt><dd class="pos">${brl(o.pagamento.pago)}</dd><dt>Falta</dt><dd class="${saldo > 0 ? 'neg' : ''}">${brl(saldo)}</dd><dt>Situação</dt><dd>${chip(o.pagamento.status)}</dd></dl>
        ${saldo > 0 && o.status !== 'Cancelado' ? `<div class="g2" style="margin-top:12px">
          <label class="f"><span>Valor recebido</span><input class="inp" type="number" step="0.01" id="mVal" value="${saldo.toFixed(2)}"></label>
          <label class="f"><span>Forma</span><span class="sel"><select class="inp" id="mForma">${opt(FORMAS, 'Pix')}</select></span></label></div>
          <button class="btn btn--primary btn--block" style="margin-top:8px" id="mPagar">${ic('check')} Registrar pagamento</button>` : ''}
      </div>
      <div class="sec"><h3>Histórico</h3><ul class="hist">${[...o.historico].reverse().map(h => `<li><div>${esc(h.txt)}<small>${fmtDataHora(h.em)}</small></div></li>`).join('')}</ul></div>
      <div class="sheet__btns"><button class="btn btn--outline" id="mPrint">${ic('print')} Imprimir OS</button><button class="btn btn--soft" data-close>Fechar</button></div>`,
    (sh) => {
      $('#mSt', sh).onchange = (e) => { o.status = e.target.value; salvarOS(o, 'Status: ' + o.status); toast('Status atualizado'); rota(); detalheOS(o.id); };
      const f = $('#fOS', sh);
      const lerPecas = () => { const d = $$('[name=pd]', f), v = $$('[name=pv]', f); return d.map((x, i) => ({ desc: x.value.trim(), valor: r2(v[i].value) })).filter(p => p.desc || p.valor); };
      $('#addPeca', sh).onclick = () => { o.diagnostico = f.diag.value; o.pecas = [...lerPecas(), { desc: '', valor: 0 }]; o.maoDeObra = r2(f.mo.value); detalheOS(o.id, o); };
      $$('[data-rmp]', sh).forEach(b => b.onclick = () => { o.pecas = lerPecas(); o.pecas.splice(Number(b.dataset.rmp), 1); o.diagnostico = f.diag.value; detalheOS(o.id, o); });
      f.onsubmit = (e) => { e.preventDefault(); o.diagnostico = f.diag.value.trim(); o.pecas = lerPecas(); o.maoDeObra = r2(f.mo.value); salvarOS(o, `Orçamento: ${brl(totalOS(o))}`); toast('Orçamento salvo'); rota(); detalheOS(o.id); };
      $('#mPagar', sh)?.addEventListener('click', () => {
        const v = r2($('#mVal', sh).value); if (!(v > 0)) return toast('Informe um valor');
        const forma = $('#mForma', sh).value;
        o.pagamento.pago = r2(o.pagamento.pago + v); o.pagamento.status = o.pagamento.pago >= totalOS(o) - 0.009 ? 'Pago' : 'Sinal pago';
        registrarEntrada(v, forma, 'Serviço T.I.', `Ordem de serviço ${o.id}`, o.id);
        salvarOS(o, `Recebido ${brl(v)} (${forma})`); toast('Pagamento registrado'); rota(); detalheOS(o.id);
      });
      $('#mPrint', sh).onclick = () => window.print();
    });
  }

  function novaOS() {
    abrir(cabeca('Nova ordem de serviço', 'Entrada de equipamento') + `
      <form id="fNova" class="fgrid" novalidate>
        <div class="g2"><label class="f"><span>Cliente</span><input class="inp" name="nome" required></label><label class="f"><span>WhatsApp</span><input class="inp" name="tel" type="tel" inputmode="tel"></label></div>
        <label class="f"><span>Equipamento</span><input class="inp" name="equip" placeholder="Ex.: Notebook Dell Inspiron 15" required></label>
        <label class="f"><span>Acessórios deixados</span><input class="inp" name="acess" placeholder="Ex.: carregador, mochila"></label>
        <label class="f"><span>Defeito relatado</span><textarea class="inp" name="defeito" rows="2" required></textarea></label>
        <p class="err" id="nErr" hidden></p>
        <button class="btn btn--primary btn--lg btn--block">${ic('check')} Abrir OS</button>
      </form>`, (sh) => {
      const f = $('#fNova', sh);
      f.onsubmit = (e) => {
        e.preventDefault();
        if (!f.nome.value.trim() || !f.equip.value.trim() || !f.defeito.value.trim()) { $('#nErr', sh).textContent = 'Preencha cliente, equipamento e defeito.'; $('#nErr', sh).hidden = false; return; }
        const l = Banco.os();
        const o = { id: 'OS-' + Banco.proxNumero('os', 206), criadoEm: hojeISO(), cliente: { nome: f.nome.value.trim(), telefone: soNumeros(f.tel.value), email: '' }, equipamento: f.equip.value.trim(), acessorios: f.acess.value.trim(), defeito: f.defeito.value.trim(), diagnostico: '', pecas: [], maoDeObra: 0, status: 'Recebido', pagamento: { status: 'Pendente', pago: 0 }, historico: [{ em: hojeISO(), txt: 'Equipamento recebido' }] };
        l.unshift(o); Banco.salvarOS(l);
        fechar(); toast(`${o.id} aberta`); estado.filtroOS = 'Abertas'; navegar('os');
      };
    });
  }

  /* ================= FINANCEIRO ================= */
  function vFinanceiro() {
    const desenhar = () => {
      const fin = Banco.lanc();
      const doMes = fin.filter(l => mesKey(l.data) === estado.mes);
      const ent = doMes.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
      const sai = doMes.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
      const porCat = {}; doMes.filter(l => l.tipo === 'saida').forEach(l => porCat[l.categoria] = (porCat[l.categoria] || 0) + l.valor);
      const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
      const lista = doMes.filter(l => estado.filtroFin === 'Todos' || (estado.filtroFin === 'Entradas' ? l.tipo === 'entrada' : l.tipo === 'saida')).sort((a, b) => b.data.localeCompare(a.data));
      const receber = [
        ...Banco.pedidos().filter(p => saldoPed(p) > 0).map(p => ({ id: p.id, nome: p.cliente.nome, v: saldoPed(p), tipo: 'ped' })),
        ...Banco.os().filter(o => saldoOS(o) > 0).map(o => ({ id: o.id, nome: o.cliente.nome, v: saldoOS(o), tipo: 'os' }))
      ];
      const ml = mesNome(estado.mes, true); $('#mesLbl').textContent = ml[0].toUpperCase() + ml.slice(1);
      $('#finBody').innerHTML = `
        <div class="kpis">
          <div class="kpi"><small>${ic('arrow')} Entradas</small><b class="pos">${brl(ent)}</b><span>${doMes.filter(l => l.tipo === 'entrada').length} lançamentos</span></div>
          <div class="kpi"><small>${ic('back')} Saídas</small><b class="neg">${brl(sai)}</b><span>${doMes.filter(l => l.tipo === 'saida').length} lançamentos</span></div>
          <div class="kpi kpi--dark"><small>${ic('money')} Resultado</small><b>${brl(ent - sai)}</b><span>Margem ${ent ? Math.round((ent - sai) / ent * 100) : 0}%</span></div>
          <div class="kpi"><small>${ic('calendar')} A receber</small><b>${brl(receber.reduce((s, r) => s + r.v, 0))}</b><span>${receber.length} em aberto</span></div>
        </div>
        <div class="adm-cols">
          <section class="panel"><div class="panel__h"><h2>Lançamentos</h2>
            <div class="fchips" style="margin:0;padding:0">${['Todos', 'Entradas', 'Saídas'].map(f => `<button data-ff="${f}" class="${f === estado.filtroFin ? 'is-on' : ''}">${f}</button>`).join('')}</div></div>
            <div class="rows">${lista.length ? lista.map(l => `<button class="row row--fin" data-l="${l.id}"><span class="row__t">${esc(l.descricao)}</span><span class="row__s">${fmtData(l.data)} · ${esc(l.categoria)}${l.forma ? ' · ' + esc(l.forma) : ''}</span><span class="row__v ${l.tipo === 'entrada' ? 'pos' : 'neg'}">${brl(l.valor)}</span><span class="row__r"></span></button>`).join('') : '<div class="nada">Nenhum lançamento neste mês.</div>'}</div>
          </section>
          <div>
            <section class="panel"><div class="panel__h"><h2>Despesas por categoria</h2></div>
              ${cats.length ? cats.map(([c, v]) => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:.85rem"><span>${esc(c)}</span><b style="font-family:var(--font-head)">${brl(v)}</b></div><div style="height:8px;border-radius:99px;background:var(--lilas-50);margin-top:4px"><div style="height:100%;width:${v / cats[0][1] * 100}%;border-radius:99px;background:var(--roxo)"></div></div></div>`).join('') : '<div class="nada">Sem despesas no mês.</div>'}
            </section>
            <section class="panel"><div class="panel__h"><h2>Contas a receber</h2></div>
              <div class="rows">${receber.length ? receber.map(r => `<button class="row" data-rec="${r.tipo}:${r.id}"><span class="row__t">${r.id}<small>${esc(r.nome)}</small></span><span class="row__v neg">${brl(r.v)}</span></button>`).join('') : '<div class="nada">Nada a receber.</div>'}</div>
            </section>
          </div>
        </div>`;
      $$('[data-ff]').forEach(b => b.onclick = () => { estado.filtroFin = b.dataset.ff; desenhar(); });
      $$('[data-l]').forEach(b => b.onclick = () => detalheLanc(b.dataset.l, desenhar));
      $$('[data-rec]').forEach(b => b.onclick = () => { const [t, id] = b.dataset.rec.split(':'); t === 'ped' ? detalhePedido(id) : detalheOS(id); });
    };
    $('#view').innerHTML = `
      <div class="adm-h"><div><h1>Financeiro</h1><p>Fluxo de caixa, despesas e contas a receber</p></div><button class="btn btn--primary" id="novo">${ic('plus')} Lançamento</button></div>
      <div class="panel" style="display:flex;align-items:center;justify-content:space-between;padding:8px">
        <button class="hicon" id="mPrev" aria-label="Mês anterior">${ic('back')}</button>
        <b id="mesLbl" style="font-family:var(--font-head)"></b>
        <button class="hicon" id="mNext" aria-label="Próximo mês">${ic('arrow')}</button>
      </div>
      <div id="finBody"></div>`;
    const mudaMes = (n) => { const d = new Date(estado.mes + '-15'); d.setMonth(d.getMonth() + n); estado.mes = mesKey(d.toISOString()); desenhar(); };
    $('#mPrev').onclick = () => mudaMes(-1); $('#mNext').onclick = () => mudaMes(1);
    $('#novo').onclick = () => novoLanc(desenhar);
    desenhar();
  }
  function novoLanc(depois) {
    abrir(cabeca('Novo lançamento') + `
      <form id="fL" class="fgrid" novalidate>
        <div class="tabs2" style="margin:0"><button type="button" data-t="saida" class="is-on">Saída (despesa)</button><button type="button" data-t="entrada">Entrada</button></div>
        <label class="f"><span>Descrição</span><input class="inp" name="desc" placeholder="Ex.: Resma de couchê 300 g" required></label>
        <div class="g2"><label class="f"><span>Valor (R$)</span><input class="inp" name="valor" type="number" step="0.01" inputmode="decimal" required></label><label class="f"><span>Data</span><input class="inp" name="data" type="date" value="${hojeData()}"></label></div>
        <div class="g2"><label class="f"><span>Categoria</span><span class="sel"><select class="inp" name="cat" id="lCat">${opt(CAT_SAIDA)}</select></span></label><label class="f"><span>Forma</span><span class="sel"><select class="inp" name="forma">${opt(FORMAS, 'Pix')}</select></span></label></div>
        <p class="err" id="lErr" hidden></p>
        <button class="btn btn--primary btn--lg btn--block">${ic('check')} Salvar</button>
      </form>`, (sh) => {
      let tipo = 'saida'; const f = $('#fL', sh);
      $$('[data-t]', sh).forEach(b => b.onclick = () => { tipo = b.dataset.t; $$('[data-t]', sh).forEach(x => x.classList.toggle('is-on', x === b)); $('#lCat', sh).innerHTML = opt(tipo === 'saida' ? CAT_SAIDA : CAT_ENTRADA); });
      f.onsubmit = (e) => {
        e.preventDefault();
        const v = r2(f.valor.value);
        if (!f.desc.value.trim() || !(v > 0)) { $('#lErr', sh).textContent = 'Informe descrição e valor.'; $('#lErr', sh).hidden = false; return; }
        const l = Banco.lanc(); l.unshift({ id: uid(), data: new Date((f.data.value || hojeData()) + 'T12:00').toISOString(), tipo, categoria: f.cat.value, descricao: f.desc.value.trim(), valor: v, forma: f.forma.value });
        Banco.salvarLanc(l); estado.mes = mesKey(l[0].data); fechar(); toast('Lançamento salvo'); depois();
      };
    });
  }
  function detalheLanc(id, depois) {
    const l = Banco.lanc().find(x => x.id === id); if (!l) return;
    abrir(cabeca(esc(l.descricao), fmtData(l.data)) + `
      <dl class="kv" style="margin-top:6px"><dt>Tipo</dt><dd>${l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</dd><dt>Valor</dt><dd class="${l.tipo === 'entrada' ? 'pos' : 'neg'}">${brl(l.valor)}</dd><dt>Categoria</dt><dd>${esc(l.categoria)}</dd><dt>Forma</dt><dd>${esc(l.forma || '—')}</dd>${l.ref ? `<dt>Referência</dt><dd>${esc(l.ref)}</dd>` : ''}</dl>
      <div class="sheet__btns"><button class="btn btn--danger" id="del">${ic('trash')} Excluir</button><button class="btn btn--soft" data-close>Fechar</button></div>`, (sh) => {
      $('#del', sh).onclick = () => { if (!confirm('Excluir este lançamento?')) return; Banco.salvarLanc(Banco.lanc().filter(x => x.id !== id)); fechar(); toast('Lançamento excluído'); depois(); };
    });
  }

  /* ================= CLIENTES ================= */
  function clientes() {
    const mapa = new Map();
    const chave = (c) => soNumeros(c.telefone) || (c.email || '').toLowerCase() || c.nome.toLowerCase();
    const add = (c, tipo, reg, valor, data) => {
      const k = chave(c); const x = mapa.get(k) || { nome: c.nome, telefone: c.telefone, email: c.email || '', pedidos: [], os: [], total: 0, ultimo: '' };
      if (c.email && !x.email) x.email = c.email;
      x[tipo].push(reg); x.total += valor; if (data > x.ultimo) x.ultimo = data; mapa.set(k, x);
    };
    Banco.pedidos().forEach(p => add(p.cliente, 'pedidos', p, p.status === 'Cancelado' ? 0 : p.total, p.criadoEm));
    Banco.os().forEach(o => add(o.cliente, 'os', o, o.status === 'Cancelado' ? 0 : totalOS(o), o.criadoEm));
    Banco.usuarios().filter(u => u.papel === 'cliente').forEach(u => { const k = chave(u); if (!mapa.has(k)) mapa.set(k, { nome: u.nome, telefone: u.telefone, email: u.email, pedidos: [], os: [], total: 0, ultimo: u.criadoEm, conta: true }); else mapa.get(k).conta = true; });
    return [...mapa.values()].sort((a, b) => b.ultimo.localeCompare(a.ultimo));
  }
  function vClientes() {
    const todos = clientes();
    const desenhar = () => {
      const q = estado.buscaCli.trim().toLowerCase();
      const lista = todos.filter(c => !q || [c.nome, c.telefone, c.email].join(' ').toLowerCase().includes(q));
      $('#lista').innerHTML = lista.length ? lista.map((c, i) => `<button class="row" data-c="${todos.indexOf(c)}"><span class="row__t">${esc(c.nome)}${c.conta ? '<small>tem conta</small>' : ''}</span><span class="row__s">${fmtTel(c.telefone)} · ${c.pedidos.length} pedido(s) · ${c.os.length} OS</span><span class="row__v">${brl(c.total)}</span><span class="row__r" style="font-size:.76rem;color:var(--muted)">${fmtData(c.ultimo)}</span></button>`).join('') : '<div class="nada">Nenhum cliente encontrado.</div>';
      $$('[data-c]').forEach(b => b.onclick = () => detalheCli(todos[b.dataset.c]));
    };
    $('#view').innerHTML = `
      <div class="adm-h"><div><h1>Clientes</h1><p>${todos.length} clientes · ${brl(todos.reduce((s, c) => s + c.total, 0))} em pedidos</p></div></div>
      <div class="toolbar"><label class="search">${ic('search')}<input class="inp" type="search" id="busca" placeholder="Buscar nome, telefone, e-mail…" value="${esc(estado.buscaCli)}" aria-label="Buscar clientes"></label></div>
      <div class="rows" id="lista"></div>`;
    $('#busca').oninput = (e) => { estado.buscaCli = e.target.value; desenhar(); };
    desenhar();
  }
  function detalheCli(c) {
    abrir(cabeca(esc(c.nome), `Cliente desde ${fmtData([...c.pedidos, ...c.os].map(x => x.criadoEm).sort()[0] || c.ultimo)}`) + `
      <dl class="kv" style="margin-top:6px"><dt>WhatsApp</dt><dd>${fmtTel(c.telefone)}</dd>${c.email ? `<dt>E-mail</dt><dd>${esc(c.email)}</dd>` : ''}<dt>Total em pedidos</dt><dd>${brl(c.total)}</dd><dt>Conta no site</dt><dd>${c.conta ? 'Sim' : 'Não'}</dd></dl>
      ${c.telefone ? `<a class="btn btn--wa btn--block" style="margin-top:12px" target="_blank" rel="noopener" href="${waLink(`Olá, ${c.nome.split(' ')[0]}! Aqui é da LC Studio.`, telWa(c.telefone))}">${ic('wa')} Chamar no WhatsApp</a>` : ''}
      <div class="sec" style="margin-top:14px"><h3>Pedidos</h3><div class="rows">${c.pedidos.length ? c.pedidos.map(rowPed).join('') : '<div class="nada">Nenhum pedido.</div>'}</div></div>
      ${c.os.length ? `<div class="sec"><h3>Ordens de serviço</h3><div class="rows">${c.os.map(rowOS).join('')}</div></div>` : ''}`, (sh) => {
      $$('[data-ped]', sh).forEach(b => b.onclick = () => detalhePedido(b.dataset.ped));
      $$('[data-os]', sh).forEach(b => b.onclick = () => detalheOS(b.dataset.os));
    });
  }

  /* ================= PRODUTOS E PREÇOS ================= */
  function vProdutos() {
    const ps = produtos();
    const ajustes = DB.get('precos', {});
    const campos = (p) => {
      const pr = p.preco; let h = '';
      if (pr.modo === 'tiers') h += pr.tiers.map((t, i) => `<label>${t[0].toLocaleString('pt-BR')} ${esc(pr.unidade)}<input class="inp" type="number" step="0.01" data-k="tiers" data-i="${i}" value="${t[1]}"></label>`).join('');
      if (pr.modo === 'area') h += `<label>Preço por m²<input class="inp" type="number" step="0.01" data-k="m2" value="${pr.m2}"></label><label>Valor mínimo<input class="inp" type="number" step="0.01" data-k="minimo" value="${pr.minimo}"></label>`;
      const sets = p.opcoes.flatMap(o => o.escolhas.map((e, i) => e.set != null ? `<label>${esc(e.label)}<input class="inp" type="number" step="0.01" data-k="sets" data-s="${o.id}:${i}" value="${e.set}"></label>` : '')).join('');
      if ((pr.modo === 'unit' || pr.modo === 'service') && !sets) h += `<label>${pr.porHora ? 'Valor/hora' : pr.modo === 'unit' ? 'Valor unitário' : 'Valor'}<input class="inp" type="number" step="0.01" data-k="valor" value="${pr.valor}"></label>`;
      return h + sets;
    };
    $('#view').innerHTML = `
      <div class="adm-h"><div><h1>Produtos e preços</h1><p>Os preços daqui alimentam a calculadora do site.</p></div><button class="btn btn--soft" id="reset">Restaurar</button></div>
      ${Object.entries(SETORES).map(([k, s]) => `
        <section class="panel"><div class="panel__h"><h2>${s.nome}</h2><a href="${s.page}" target="_blank" rel="noopener">Ver no site</a></div>
          <div class="ptable">${ps.filter(p => p.setor === k).map(p => `
            <div class="pedit" data-slug="${p.slug}">
              <div class="pedit__h">${arteProduto(p)}<b>${esc(p.nome)}<small>a partir de ${brl(aPartirDe(p))}${ajustes[p.slug] ? ' · editado' : ''}</small></b>
                <label class="switch" title="Ativo no site"><input type="checkbox" data-k="ativo" ${p.inativo ? '' : 'checked'} aria-label="Ativo no site"><span></span></label></div>
              <div class="pedit__f">${campos(p)}</div>
            </div>`).join('')}</div>
        </section>`).join('')}`;
    $$('.pedit').forEach(box => box.addEventListener('change', (e) => {
      const slug = box.dataset.slug, el = e.target, aj = DB.get('precos', {}); const a = aj[slug] || {};
      const k = el.dataset.k;
      if (k === 'ativo') a.ativo = el.checked;
      else if (k === 'tiers') { a.tiers = a.tiers || []; a.tiers[Number(el.dataset.i)] = r2(el.value); }
      else if (k === 'sets') { a.sets = a.sets || {}; a.sets[el.dataset.s] = r2(el.value); }
      else a[k] = r2(el.value);
      aj[slug] = a; DB.set('precos', aj);
      const p = produto(slug); $('.pedit__h small', box).textContent = `a partir de ${brl(aPartirDe(p))} · editado`;
      toast(k === 'ativo' ? (el.checked ? 'Produto visível no site' : 'Produto escondido do site') : 'Preço salvo');
    }));
    $('#reset').onclick = () => { if (!confirm('Voltar todos os preços para os valores iniciais?')) return; DB.del('precos'); toast('Preços restaurados'); vProdutos(); };
  }

  /* ================= CONFIGURAÇÕES ================= */
  function vConfig() {
    $('#view').innerHTML = `
      <div class="adm-h"><div><h1>Configurações</h1></div></div>
      <section class="panel"><div class="panel__h"><h2>Empresa</h2></div>
        <dl class="kv"><dt>WhatsApp de pedidos</dt><dd>${CONFIG.whatsappLabel}</dd><dt>Endereço</dt><dd>${CONFIG.endereco}</dd><dt>Instagram</dt><dd>${CONFIG.instagram ? '@' + esc(CONFIG.instagram) : 'não informado'}</dd></dl>
      </section>
      <section class="panel"><div class="panel__h"><h2>Dados desta prévia</h2></div>
        <p style="font-size:.9rem;color:var(--muted)">Nesta demonstração, pedidos, ordens de serviço, financeiro e contas ficam salvos no navegador deste aparelho. Na versão final eles ficam num banco de dados online, acessível de qualquer lugar e com backup.</p>
        <div class="sheet__btns">
          <button class="btn btn--outline" id="exp">${ic('download')} Exportar backup</button>
          <button class="btn btn--soft" id="seed">${ic('refresh')} Restaurar exemplos</button>
          <button class="btn btn--danger" id="zera">${ic('trash')} Começar do zero</button>
        </div>
      </section>`;
    $('#exp').onclick = () => {
      const dados = { exportadoEm: hojeISO(), pedidos: Banco.pedidos(), os: Banco.os(), financeiro: Banco.lanc(), precos: DB.get('precos', {}) };
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
      a.download = `lcstudio-backup-${hojeData()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#seed').onclick = () => { if (!confirm('Substituir tudo pelos dados de exemplo?')) return; semear(true); Auth.entrar(DEMO.admin.email, DEMO.admin.senha); toast('Exemplos restaurados'); rota(); };
    $('#zera').onclick = () => { if (!confirm('Apagar pedidos, OS e financeiro deste navegador? Isso não pode ser desfeito.')) return; Banco.salvarPedidos([]); Banco.salvarOS([]); Banco.salvarLanc([]); toast('Dados apagados'); rota(); };
  }

  const VIEWS = { inicio: vInicio, pedidos: vPedidos, os: vOS, financeiro: vFinanceiro, clientes: vClientes, produtos: vProdutos, config: vConfig };
  iniciar();
})();

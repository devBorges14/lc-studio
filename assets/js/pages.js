/* LC Studio – lógica das páginas públicas */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const slugStatus = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const chip = (s) => `<span class="st st--${slugStatus(s)}">${esc(s)}</span>`;

  /* ====================== INÍCIO ====================== */
  if (page === 'inicio') {
    const ps = produtos().filter(p => !p.inativo);
    $('#setoresGrid').innerHTML =Object.entries(SETORES).map(([k, s]) => `
      <a class="sector reveal" href="${s.page}" style="--c:${s.cor}">
        <span class="sector__ic">${ic(s.icon)}</span>
        <span class="sector__go">${ic('arrow')}</span>
        <h3>${s.nome}</h3>
        <p>${s.texto}</p>
        <div class="sector__list">${ps.filter(p => p.setor === k).slice(0, 4).map(p => `<span>${esc(p.nome.split(/,| e /)[0])}</span>`).join('')}</div>
      </a>`).join('');
    $('#destaques').innerHTML = ps.filter(p => p.destaque).slice(0, 8).map(cardProduto).join('');
  }

  /* ====================== SETOR ====================== */
  if (document.body.dataset.setor) {
    const k = document.body.dataset.setor, s = SETORES[k];
    document.documentElement.style.setProperty('--c', s.cor);
    $('#phero').innerHTML = `
      <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span aria-hidden="true">/</span><span>${s.nome}</span></nav>
      <span class="phero__ic">${ic(s.icon)}</span>
      <p class="eyebrow eyebrow--light">${s.nome}</p>
      <h1>${s.titulo}</h1>
      <p class="lead">${s.texto}</p>
      <div class="sectabs">${Object.entries(SETORES).map(([kk, ss]) => `<a href="${ss.page}" class="${kk === k ? 'is-on' : ''}">${ic(ss.icon)}${ss.curto}</a>`).join('')}</div>`;
    const lista = produtos().filter(p => p.setor === k && !p.inativo);
    $('#lista').innerHTML = lista.map(cardProduto).join('');
    $('#qtdItens').textContent = `${lista.length} ${lista.length === 1 ? 'opção' : 'opções'}`;
  }

  /* ====================== PRODUTO ====================== */
  if (page === 'produto') {
    const p = produto(params.get('p'));
    const raiz = $('#produto');
    if (!p || p.inativo) {
      raiz.innerHTML = `<div class="wrap"><div class="empty" style="margin:40px 0">${ic('search')}<h2>Produto não encontrado</h2><p>Ele pode ter saído do catálogo.</p><a class="btn btn--primary" href="index.html">Voltar ao início</a></div></div>`;
      return;
    }
    const s = SETORES[p.setor];
    document.title = `${p.nome} – LC Studio`;
    document.documentElement.style.setProperty('--c', s.cor);
    const pr = p.preco;
    const cfg = { escolhas: {}, qtd: pr.modo === 'tiers' ? pr.tiers[0][0] : 1, largura: pr.padrao?.[0], altura: pr.padrao?.[1] };
    const dica = (e) => e.set != null ? brl(e.set) : e.add ? '+' + brl(e.add) : e.addEach ? `+${brl(e.addEach)}/un` : e.mult ? `${e.mult > 1 ? '+' : '−'}${Math.round(Math.abs(e.mult - 1) * 100)}%` : '';

    let qtdHTML = '';
    if (pr.modo === 'tiers') {
      qtdHTML = `<fieldset class="opt"><legend>Quantidade</legend><div class="chips">${pr.tiers.map((t, i) => `<label><input type="radio" name="qtd" value="${t[0]}" ${i ? '' : 'checked'}><span>${t[0].toLocaleString('pt-BR')} <small>${esc(pr.unidade)}</small></span></label>`).join('')}</div></fieldset>`;
    } else if (pr.modo === 'area') {
      qtdHTML = `<div class="opt"><span class="label">Tamanho e quantidade</span><div class="dims">
        <label>Largura (cm)<input type="number" inputmode="numeric" min="1" name="largura" value="${pr.padrao[0]}"></label>
        <label>Altura (cm)<input type="number" inputmode="numeric" min="1" name="altura" value="${pr.padrao[1]}"></label>
        <label>Quantidade<input type="number" inputmode="numeric" min="1" name="qtd" value="1"></label></div></div>`;
    } else if (pr.modo === 'unit' || pr.porHora) {
      qtdHTML = `<div class="opt"><span class="label">${pr.porHora ? 'Horas' : 'Quantidade'}</span><div class="stepper">
        <button type="button" data-step="-1" aria-label="Diminuir">${ic('minus')}</button>
        <input type="number" inputmode="numeric" min="1" name="qtd" value="1" aria-label="${pr.porHora ? 'Horas' : 'Quantidade'}">
        <button type="button" data-step="1" aria-label="Aumentar">${ic('plus')}</button></div></div>`;
    }
    const optsHTML = p.opcoes.map(o => `<fieldset class="opt"><legend>${esc(o.label)}</legend><div class="chips">
      ${o.escolhas.map((e, i) => `<label><input type="radio" name="o_${o.id}" value="${i}" ${i ? '' : 'checked'}><span>${esc(e.label)}${dica(e) ? `<small>${dica(e)}</small>` : ''}</span></label>`).join('')}</div></fieldset>`).join('');

    raiz.innerHTML = `
      <div class="wrap">
        <nav class="crumbs crumbs--dark" aria-label="Você está em"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="${s.page}">${s.nome}</a><span aria-hidden="true">/</span><span>${esc(p.nome)}</span></nav>
        <div class="prod__grid">
          <div class="prod__media">
            ${arteProduto(p, true)}
            <div class="prod__head" style="margin-top:20px">
              <p class="eyebrow">${s.nome}</p>
              <h1>${esc(p.nome)}</h1>
              <p class="lead">${esc(p.resumo)}</p>
              <div class="prod__from"><small>a partir de</small>${brl(aPartirDe(p))}</div>
            </div>
          </div>
          <aside class="prod__aside">
            <form class="calc" id="calc" novalidate>
              <div class="calc__title">${ic('bolt')} Calcule o preço</div>
              <p class="calc__sub">Escolha as opções e veja o valor na hora.</p>
              ${qtdHTML}${optsHTML}
              <div class="calc__total" id="totalBox">
                <div><small id="totLbl">Total</small><b id="tot">—</b></div>
                <span class="det" id="totDet"></span>
              </div>
              ${p.nota || pr.modo === 'service' ? `<p class="calc__note">${ic('check')}<span>${esc(p.nota || 'Estimativa. O valor final é confirmado no atendimento.')}</span></p>` : ''}
              <div class="calc__btns">
                <button type="submit" class="btn btn--primary btn--lg btn--block">${ic('cart')} Adicionar ao carrinho</button>
                <a class="btn btn--outline btn--lg btn--block" id="waOne" target="_blank" rel="noopener">${ic('wa')} Pedir só este no WhatsApp</a>
              </div>
            </form>
          </aside>
          <div class="prod__info">
            <h2 style="font-size:1.35rem">Sobre o serviço</h2>
            <p style="margin-top:10px;color:var(--muted)">${esc(p.descricao)}</p>
            <ul class="specs">${p.specs.map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
          </div>
        </div>
        <section style="margin-top:56px">
          <div class="adm-h" style="align-items:center"><h2 style="font-size:1.5rem">Mais em ${s.nome}</h2><a class="linkbtn" style="color:var(--roxo)" href="${s.page}">Ver tudo ${ic('arrow')}</a></div>
          <div class="pgrid">${produtos().filter(x => x.setor === p.setor && x.slug !== p.slug && !x.inativo).slice(0, 4).map(cardProduto).join('')}</div>
        </section>
      </div>
      <div class="buybar" id="buybar"><div class="buybar__p"><small id="bbLbl">Total</small><b id="bbTot">—</b></div><button class="btn btn--primary" id="bbAdd">${ic('cart')} Adicionar</button></div>`;
    document.body.classList.add('has-buybar');

    const form = $('#calc');
    const ler = () => {
      const fd = new FormData(form);
      cfg.qtd = Number(fd.get('qtd')) || cfg.qtd;
      if (fd.has('largura')) { cfg.largura = Number(fd.get('largura')); cfg.altura = Number(fd.get('altura')); }
      p.opcoes.forEach(o => cfg.escolhas[o.id] = Number(fd.get('o_' + o.id)) || 0);
    };
    const render = () => {
      ler();
      const r = calcular(p, cfg);
      const lbl = r.estimativa ? 'Estimativa' : 'Total';
      $('#tot').textContent = brl(r.total); $('#totLbl').textContent = lbl;
      $('#totDet').textContent = r.detalhe;
      $('#bbTot').textContent = brl(r.total); $('#bbLbl').textContent = lbl + ' · ' + r.detalhe;
      const msg = ['Olá, LC Studio! Quero pedir:', '', `*${p.nome}*`, r.detalhe, ...r.linhas, `${lbl}: ${brl(r.total)}`].join('\n');
      $('#waOne').href = waLink(msg);
    };
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    $$('[data-step]', form).forEach(b => b.addEventListener('click', () => {
      const i = $('input[name=qtd]', form); i.value = Math.max(1, (Number(i.value) || 1) + Number(b.dataset.step)); render();
    }));
    const adicionar = () => {
      render();
      Carrinho.add(p.slug, structuredClone(cfg));
      toast(`${p.nome} no carrinho`);
      const btn = $('button[type=submit]', form);
      btn.innerHTML = `${ic('check')} Adicionado · <u>ver carrinho</u>`;
      btn.onclick = (e) => { if (btn.dataset.added) { e.preventDefault(); location.href = 'carrinho.html'; } };
      btn.dataset.added = '1';
      const bb = $('#bbAdd'); bb.innerHTML = `${ic('cart')} Ver carrinho`; bb.onclick = () => location.href = 'carrinho.html';
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); if (!$('button[type=submit]', form).dataset.added) adicionar(); });
    $('#bbAdd').onclick = adicionar;
    form.addEventListener('change', () => { // mudou algo depois de adicionar: volta a permitir adicionar
      const btn = $('button[type=submit]', form); if (!btn.dataset.added) return;
      delete btn.dataset.added; btn.onclick = null; btn.innerHTML = `${ic('cart')} Adicionar ao carrinho`;
      const bb = $('#bbAdd'); bb.innerHTML = `${ic('cart')} Adicionar`; bb.onclick = adicionar;
    });
    render();
    // barra fixa aparece quando o total sai da tela (celular)
    const bar = $('#buybar');
    new IntersectionObserver(([en]) => bar.classList.toggle('is-on', !en.isIntersecting), { threshold: 0 }).observe($('#totalBox'));
  }

  /* ====================== CARRINHO ====================== */
  if (page === 'carrinho') {
    const raiz = $('#carrinho');
    const user = Auth.atual();
    const draw = () => {
      const itens = Carrinho.itens();
      if (!itens.length) {
        raiz.innerHTML = `<div class="empty">${ic('cart')}<h2>Seu carrinho está vazio</h2><p>Escolha um setor e calcule o preço do que você precisa.</p>
          <div class="cta__btns" style="justify-content:center">${Object.values(SETORES).map(s => `<a class="btn btn--soft" href="${s.page}">${s.curto}</a>`).join('')}</div></div>`;
        return;
      }
      const temEst = itens.some(i => i.estimativa);
      raiz.innerHTML = `
        <div>
          <div class="adm-h" style="align-items:center"><h1 style="font-size:1.9rem;font-weight:800">Carrinho</h1><span class="linkbtn">${itens.length} ${itens.length > 1 ? 'itens' : 'item'}</span></div>
          <div class="rows" style="gap:10px">${itens.map(i => `
            <article class="citem">
              ${arteProduto({ setor: i.setor, icon: (produto(i.slug) || {}).icon || 'box' })}
              <div>
                <h3><a href="produto.html?p=${i.slug}">${esc(i.nome)}</a></h3>
                <p class="citem__det">${esc(i.detalhe)}${i.linhas.length ? ' · ' + i.linhas.map(esc).join(' · ') : ''}</p>
                <div class="citem__foot"><b>${brl(i.total)}${i.estimativa ? ' *' : ''}</b><button class="linkbtn" data-rm="${i.id}">${ic('trash')} Remover</button></div>
              </div>
            </article>`).join('')}
          </div>
          <a class="linkbtn" style="color:var(--roxo);margin-top:10px" href="index.html#setores">${ic('back')} Continuar escolhendo</a>
        </div>
        <form class="summary" id="checkout" novalidate>
          <h2>Resumo</h2>
          ${itens.map(i => `<div class="sumrow"><span>${esc(i.nome)}</span><span>${brl(i.total)}</span></div>`).join('')}
          <div class="sumrow sumrow--total"><span>Total</span><span>${brl(Carrinho.total())}</span></div>
          ${temEst ? '<p class="calc__note">* Serviços com valor estimado. O valor final é confirmado no atendimento.</p>' : ''}
          <div class="fgrid">
            <label class="f"><span>Seu nome</span><input class="inp" name="nome" autocomplete="name" value="${esc(user?.nome || '')}" required></label>
            <label class="f"><span>WhatsApp</span><input class="inp" name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000" value="${esc(user?.telefone || '')}" required></label>
            <label class="f"><span>E-mail <small style="color:var(--muted)">(opcional, para acompanhar)</small></span><input class="inp" name="email" type="email" autocomplete="email" value="${esc(user?.email || '')}"></label>
            <label class="f"><span>Entrega</span><span class="sel"><select class="inp" name="entrega"><option>Retirada no local</option><option>Combinar entrega</option></select></span></label>
            <label class="f"><span>Observação <small style="color:var(--muted)">(opcional)</small></span><textarea class="inp" name="obs" placeholder="Cores, prazo, se já tem a arte…"></textarea></label>
          </div>
          <p class="err" id="ckErr" hidden></p>
          <button class="btn btn--wa btn--lg btn--block" style="margin-top:16px">${ic('wa')} Finalizar pelo WhatsApp</button>
          <p class="calc__note">${ic('lock')}<span>Você confirma tudo com a equipe no WhatsApp antes de pagar.</span></p>
        </form>`;
      $$('[data-rm]', raiz).forEach(b => b.onclick = () => { Carrinho.remover(b.dataset.rm); draw(); });
      $('#checkout').addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target, fd = new FormData(f);
        const nome = String(fd.get('nome')).trim(), tel = soNumeros(fd.get('telefone'));
        $$('.f', f).forEach(x => x.classList.remove('has-error'));
        const errs = [];
        if (!nome) errs.push('nome');
        if (tel.length < 10) errs.push('telefone');
        if (errs.length) { errs.forEach(n => f.elements[n].closest('.f').classList.add('has-error')); $('#ckErr').textContent = 'Preencha seu nome e um WhatsApp válido.'; $('#ckErr').hidden = false; return; }
        const itens = Carrinho.itens();
        const ped = Banco.criarPedido({ cliente: { nome, telefone: tel, email: String(fd.get('email')).trim() }, itens, entrega: fd.get('entrega'), obs: String(fd.get('obs')).trim() });
        const msg = [`Olá, LC Studio! Fiz o pedido *${ped.id}* pelo site.`, '',
          ...itens.flatMap((i, n) => [`*${n + 1}. ${i.nome}* – ${brl(i.total)}${i.estimativa ? ' (estimativa)' : ''}`, `   ${i.detalhe}${i.linhas.length ? ' · ' + i.linhas.join(' · ') : ''}`]),
          '', `*Total:* ${brl(ped.total)}`, `*Nome:* ${nome}`, `*Entrega:* ${ped.entrega}`, ...(ped.obs ? [`*Obs.:* ${ped.obs}`] : [])].join('\n');
        Carrinho.limpar();
        window.open(waLink(msg), '_blank', 'noopener');
        raiz.innerHTML = `<div class="ok" style="grid-column:1/-1;max-width:560px;margin:0 auto">
          <div class="ok__ic">${ic('check')}</div><h2>Pedido ${ped.id} enviado!</h2>
          <p>Abrimos o WhatsApp com o seu pedido pronto. É só tocar em enviar. A equipe confirma os detalhes e o pagamento por lá.</p>
          <a class="btn btn--wa btn--lg" href="${waLink(msg)}" target="_blank" rel="noopener">${ic('wa')} Abrir o WhatsApp de novo</a><br>
          <a class="btn btn--soft" href="${user ? 'conta.html' : 'entrar.html'}">${ic('user')} ${user ? 'Acompanhar na minha conta' : 'Criar conta para acompanhar'}</a>
        </div>`;
        scrollTo({ top: 0, behavior: 'smooth' });
      });
    };
    draw();
  }

  /* ====================== ENTRAR ====================== */
  if (page === 'entrar') {
    const u = Auth.atual();
    if (u) { location.replace(u.papel === 'admin' ? 'admin.html' : 'conta.html'); return; }
    const raiz = $('#auth');
    let modo = params.get('modo') === 'cadastro' ? 'cadastro' : 'entrar';
    const draw = () => {
      raiz.innerHTML = `
        <div class="authcard">
          <div class="tabs2" role="tablist"><button type="button" class="${modo === 'entrar' ? 'is-on' : ''}" data-m="entrar">Entrar</button><button type="button" class="${modo === 'cadastro' ? 'is-on' : ''}" data-m="cadastro">Criar conta</button></div>
          <form id="fAuth" class="fgrid" style="margin-top:0" novalidate>
            ${modo === 'cadastro' ? `
              <label class="f"><span>Nome</span><input class="inp" name="nome" autocomplete="name" required></label>
              <label class="f"><span>WhatsApp</span><input class="inp" name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000"></label>` : ''}
            <label class="f"><span>E-mail</span><input class="inp" name="email" type="email" autocomplete="email" required></label>
            <label class="f"><span>Senha</span><input class="inp" name="senha" type="password" autocomplete="${modo === 'cadastro' ? 'new-password' : 'current-password'}" required></label>
            <p class="err" id="aErr" hidden></p>
            <button class="btn btn--primary btn--lg btn--block">${modo === 'cadastro' ? 'Criar minha conta' : 'Entrar'}</button>
          </form>
          <div class="demo">
            <b>Acesso de demonstração</b>
            <div class="demo__row"><span>Cliente<br><code>${DEMO.cliente.email}</code></span><button type="button" class="btn btn--soft btn--sm" data-demo="cliente">Usar</button></div>
            <div class="demo__row"><span>Administrador<br><code>${DEMO.admin.email}</code></span><button type="button" class="btn btn--soft btn--sm" data-demo="admin">Usar</button></div>
            <p style="margin-top:10px;color:var(--muted);font-size:.78rem">Senha das duas: <code>${DEMO.admin.senha}</code>. Nesta prévia, contas e pedidos ficam salvos só neste aparelho.</p>
          </div>
        </div>`;
      $$('[data-m]', raiz).forEach(b => b.onclick = () => { modo = b.dataset.m; draw(); });
      $$('[data-demo]', raiz).forEach(b => b.onclick = () => {
        modo = 'entrar'; draw();
        const d = DEMO[b.dataset.demo]; const f = $('#fAuth');
        f.elements.email.value = d.email; f.elements.senha.value = d.senha;
        f.querySelector('button').focus();
      });
      $('#fAuth').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target), err = $('#aErr');
        const email = String(fd.get('email')).trim(), senha = String(fd.get('senha'));
        if (modo === 'entrar') {
          const u = Auth.entrar(email, senha);
          if (!u) { err.textContent = 'E-mail ou senha incorretos.'; err.hidden = false; return; }
          location.href = u.papel === 'admin' ? 'admin.html' : (params.get('volta') || 'conta.html');
        } else {
          const nome = String(fd.get('nome')).trim();
          if (!nome || !/^\S+@\S+\.\S+$/.test(email) || senha.length < 4) { err.textContent = 'Preencha nome, um e-mail válido e uma senha com 4 ou mais caracteres.'; err.hidden = false; return; }
          const r = Auth.cadastrar({ nome, email, telefone: String(fd.get('telefone') || ''), senha });
          if (r.erro) { err.textContent = r.erro; err.hidden = false; return; }
          location.href = params.get('volta') || 'conta.html';
        }
      });
    };
    draw();
  }

  /* ====================== MINHA CONTA ====================== */
  if (page === 'conta') {
    const u = Auth.atual();
    if (!u) { location.replace('entrar.html'); return; }
    const meu = (c) => (u.email && c.email && c.email.toLowerCase() === u.email.toLowerCase()) || (u.telefone && soNumeros(c.telefone) === soNumeros(u.telefone));
    const peds = Banco.pedidos().filter(p => meu(p.cliente));
    const oss = Banco.os().filter(o => meu(o.cliente));
    const passo = (s) => ({ 'Novo': 0, 'Orçamento enviado': 0, 'Aprovado': 1, 'Em arte': 1, 'Em produção': 2, 'Pronto': 3, 'Entregue': 4 }[s] ?? -1);
    $('#conta').innerHTML = `
      <div class="acc__head">
        <span class="avatar">${esc(u.nome.trim()[0] || '?').toUpperCase()}</span>
        <div style="flex:1;min-width:0"><h1 style="font-size:1.5rem;font-weight:800">Olá, ${esc(u.nome.split(' ')[0])}!</h1><p style="color:var(--muted);font-size:.86rem;overflow:hidden;text-overflow:ellipsis">${esc(u.email)}</p></div>
        <button class="btn btn--soft btn--sm" id="sair">${ic('logout')} Sair</button>
      </div>
      ${u.papel === 'admin' ? `<a class="btn btn--primary btn--block" href="admin.html" style="margin-bottom:18px">${ic('grid')} Abrir painel administrativo</a>` : ''}
      <h2 style="font-size:1.25rem;margin-bottom:12px">Meus pedidos</h2>
      ${peds.length ? peds.map(p => `
        <article class="ocard">
          <div class="ocard__top"><div><b>${p.id}</b><small>${fmtData(p.criadoEm)} · ${brl(p.total)}</small></div>${chip(p.status)}</div>
          <ul>${p.itens.map(i => `<li>• ${esc(i.nome)} <span style="color:var(--muted)">(${esc(i.detalhe)})</span></li>`).join('')}</ul>
          ${p.status !== 'Cancelado' ? `<div class="track">${[0, 1, 2, 3, 4].map(n => `<i class="${n <= passo(p.status) ? 'on' : ''}"></i>`).join('')}</div><div class="track__lbl"><span>Recebido</span><span>Aprovado</span><span>Produção</span><span>Pronto</span><span>Entregue</span></div>` : ''}
        </article>`).join('') : `<div class="nada">Você ainda não tem pedidos. <a href="index.html#setores" style="color:var(--roxo);font-weight:700">Ver serviços</a></div>`}
      ${oss.length ? `<h2 style="font-size:1.25rem;margin:26px 0 12px">Meus equipamentos (T.I.)</h2>` + oss.map(o => `
        <article class="ocard"><div class="ocard__top"><div><b>${o.id} · ${esc(o.equipamento)}</b><small>${fmtData(o.criadoEm)} · ${esc(o.defeito)}</small></div>${chip(o.status)}</div>
        ${o.diagnostico ? `<p style="font-size:.86rem;margin-top:8px;color:var(--muted)">${esc(o.diagnostico)}</p>` : ''}</article>`).join('') : ''}
      <a class="btn btn--wa btn--block" style="margin-top:22px" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">${ic('wa')} Falar com a equipe</a>`;
    $('#sair').onclick = () => { Auth.sair(); location.href = 'index.html'; };
  }

  /* ====================== PORTFÓLIO ====================== */
  if (page === 'portfolio') {
    const works = $$('.work');
    $$('.filter').forEach(btn => btn.addEventListener('click', () => {
      $$('.filter').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
      const f = btn.dataset.filter;
      works.forEach(w => { w.hidden = !(f === 'todos' || w.dataset.cat === f); if (!w.hidden) w.classList.add('is-in'); });
    }));
    const lb = $('#lightbox'), stage = $('#lbStage'), cap = $('#lbCap');
    const fechar = () => { if (lb.hidden) return; lb.classList.remove('is-open'); document.body.classList.remove('lb-open'); setTimeout(() => { lb.hidden = true; stage.replaceChildren(); }, 220); };
    works.forEach(w => $('.work__btn', w).addEventListener('click', () => {
      stage.replaceChildren($('.work__btn', w).firstElementChild.cloneNode(true));
      cap.innerHTML = $('figcaption', w)?.innerHTML || '';
      lb.hidden = false; requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.classList.add('lb-open'); $('.lightbox__close', lb).focus();
    }));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lightbox__close')) fechar(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
  }

  /* ====================== CONTATO (orçamento rápido) ====================== */
  if (page === 'contato') {
    const form = $('#quoteForm'), select = $('#f-servico'), bubble = $('#bubble'), err = $('#formError');
    Object.entries(SETORES).forEach(([k, s]) => {
      const g = document.createElement('optgroup'); g.label = s.nome;
      produtos().filter(p => p.setor === k && !p.inativo).forEach(p => { const o = document.createElement('option'); o.value = o.textContent = p.nome; g.appendChild(o); });
      select.appendChild(g);
    });
    const o = document.createElement('option'); o.value = o.textContent = 'Outro'; select.appendChild(o);
    if (params.get('servico')) select.value = params.get('servico');
    const msg = () => {
      const d = new FormData(form), v = k => String(d.get(k) || '').trim();
      return ['Olá, LC Studio! Quero um orçamento.', '', `*Nome:* ${v('nome') || '—'}`, `*Serviço:* ${v('servico') || '—'}`, `*Quantidade/tamanho:* ${v('quantidade') || 'a definir'}`, `*Prazo:* ${v('prazo') || 'a definir'}`, ...(v('obs') ? [`*Observação:* ${v('obs')}`] : [])].join('\n');
    };
    const prev = () => { bubble.innerHTML = esc(msg()).replace(/\*(.+?)\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); };
    form.addEventListener('input', prev); form.addEventListener('change', prev); prev();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const faltam = [$('#f-nome'), select].filter(el => !el.value.trim());
      $$('.field', form).forEach(f => f.classList.remove('has-error'));
      if (faltam.length) { faltam.forEach(el => el.closest('.field').classList.add('has-error')); err.textContent = 'Preencha seu nome e escolha um serviço.'; err.hidden = false; faltam[0].focus(); return; }
      err.hidden = true;
      window.open(waLink(msg()), '_blank', 'noopener');
    });
    if (CONFIG.instagram) { $('.js-insta').hidden = false; const a = $('.js-insta-link'); a.href = 'https://instagram.com/' + CONFIG.instagram; a.textContent = '@' + CONFIG.instagram; }
  }

  revelar();
})();

/* LC Studio – topo, rodapé, ícones e comportamentos comuns a todas as páginas */

const ICONES = {
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/><path d="M9 7h6M9 10.5h4"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 10h6M6 14h9"/>',
  flyer: '<path d="M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2V5z"/><path d="M9 3v16M15 5v16"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  sticker: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9.5L21 14.5V5a2 2 0 0 0-2-2h-3.5z"/><path d="M14 21v-5a2 2 0 0 1 2-2h5"/>',
  easel: '<path d="M5 21 9 3h6l4 18"/><path d="M7 13h10"/><rect x="7" y="3" width="10" height="9" rx="1"/>',
  notepad: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9z"/><path d="M9 11h6M9 15h6"/>',
  badge: '<rect x="5" y="5" width="14" height="17" rx="2"/><path d="M10 2h4v4h-4z"/><circle cx="12" cy="12" r="2.5"/><path d="M8.5 18c.7-1.6 2-2.4 3.5-2.4s2.8.8 3.5 2.4"/>',
  stamp: '<path d="M9 3h6l-1 8h-4L9 3z"/><path d="M5 14h14v4H5z"/><path d="M4 21h16"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  chip: '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 7v10M11 7v10M15 7v10M3 20h18M6 17v3M18 17v3"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8a2.8 2.8 0 0 1-4-4l8-8-1.3-1.3a4 4 0 0 0-5-5l2.6 2.6-1.4 2.8-2.8 1.4L6.3 7"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s3 4 0 6"/><path d="M14 12c4 0 7 1 7 4s-4 3-6 0"/><path d="M12 14c0 4-1 7-4 7s-3-4 0-6"/><path d="M10 12c-4 0-7-1-7-4s4-3 6 0"/>',
  flag: '<path d="M4 22V4"/><path d="M4 4h13l-2 4.5L17 13H4"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 8H6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.4-6 8-6s6.5 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.3 2.2 4 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  wa: 'WA'
};
const WA_PATH = '<path fill="currentColor" stroke="none" d="M16.04 3C8.86 3 3.03 8.83 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.17 29 16S23.2 3 16.04 3zm0 23.68c-1.99 0-3.93-.53-5.63-1.54l-.4-.24-3.97 1.04 1.06-3.86-.26-.4a10.62 10.62 0 0 1-1.63-5.68c0-5.9 4.8-10.7 10.73-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.68-10.6 10.68zm5.87-8c-.32-.16-1.9-.94-2.2-1.05-.29-.1-.5-.16-.72.16-.21.32-.83 1.05-1.01 1.26-.19.21-.37.24-.7.08-.31-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.14 3.08 1.3 3.3c.16.2 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.46.2 2 .12.62-.09 1.9-.78 2.16-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"/>';

/* ícone inline: ic('cart') */
const ic = (n, cls = '') => n === 'wa'
  ? `<svg class="ic ${cls}" viewBox="0 0 32 32" aria-hidden="true">${WA_PATH}</svg>`
  : `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[n] || ''}</svg>`;

/* Toast (mensagem rápida) */
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = ic('check') + '<span>' + esc(msg) + '</span>';
  t.classList.remove('is-on'); void t.offsetWidth; t.classList.add('is-on');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
}

/* Arte de produto (sem foto): bloco com ícone na cor do setor */
const arteProduto = (p, grande = false) =>
  `<div class="pthumb${grande ? ' pthumb--lg' : ''}" style="--c:${SETORES[p.setor].cor}">${ic(p.icon)}<span class="pthumb__tag">${esc(SETORES[p.setor].curto)}</span></div>`;

/* Card de produto */
const cardProduto = (p) => `
  <a class="pcard reveal" href="produto.html?p=${p.slug}">
    ${arteProduto(p)}
    <div class="pcard__body">
      <h3>${esc(p.nome)}</h3>
      <p>${esc(p.resumo)}</p>
      <div class="pcard__foot">
        <span class="pcard__price"><small>a partir de</small>${brl(aPartirDe(p))}</span>
        <span class="pcard__go">${ic('arrow')}</span>
      </div>
    </div>
  </a>`;

(function layout() {
  if (document.body.dataset.layout === 'admin') return; // o painel tem layout próprio
  const pagina = document.body.dataset.page || '';
  const user = Auth.atual();
  const nav = [
    ['design', 'Design', 'design.html'],
    ['grafica', 'Gráfica', 'grafica.html'],
    ['visual', 'Com. visual', 'comunicacao-visual.html'],
    ['ti', 'T.I.', 'ti.html'],
    ['portfolio', 'Portfólio', 'portfolio.html'],
    ['contato', 'Contato', 'contato.html']
  ];
  const contaHref = user ? (user.papel === 'admin' ? 'admin.html' : 'conta.html') : 'entrar.html';
  const contaLabel = user ? (user.papel === 'admin' ? 'Painel' : 'Minha conta') : 'Entrar';

  const header = document.createElement('div');
  header.innerHTML = `
  <a class="skip" href="#conteudo">Pular para o conteúdo</a>
  <div class="topbar"><p>Design, gráfica e T.I. no mesmo lugar. <a href="contato.html#orcamento">Orçamento rápido ${ic('arrow')}</a></p></div>
  <header class="header" id="topo">
    <div class="wrap header__in">
      <a href="index.html" class="header__logo" aria-label="LC Studio – início">
        <img src="assets/img/logo-roxo.png" alt="LC Studio – Sua marca, nossa criação." width="160" height="48">
      </a>
      <nav class="nav" id="menu" aria-label="Menu principal">
        ${nav.map(([k, t, h]) => `<a href="${h}"${k === pagina ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
        <a href="${contaHref}" class="nav__account">${ic('user')} ${contaLabel}</a>
      </nav>
      <a href="${contaHref}" class="hicon hicon--user" aria-label="${contaLabel}">${ic('user')}</a>
      <a href="carrinho.html" class="hicon" aria-label="Carrinho">${ic('cart')}<span class="hicon__badge" id="cartBadge" hidden>0</span></a>
      <button class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
    </div>
  </header>`;
  document.body.prepend(...header.children);

  const footer = document.createElement('div');
  footer.innerHTML = `
  <footer class="footer">
    <div class="wrap footer__in">
      <div>
        <img src="assets/img/logo-branco.png" alt="LC Studio" width="160" height="48" loading="lazy">
        <p>Agência de design, gráfica e T.I.<br>${CONFIG.endereco}<br>${CONFIG.cidade}</p>
      </div>
      <div class="footer__cols">
        <nav aria-label="Setores"><b>Setores</b>
          ${Object.values(SETORES).map(s => `<a href="${s.page}">${s.nome}</a>`).join('')}
        </nav>
        <nav aria-label="Site"><b>Atendimento</b>
          <a href="portfolio.html">Portfólio</a><a href="contato.html">Contato</a>
          <a href="carrinho.html">Carrinho</a><a href="${contaHref}">${contaLabel}</a>
          <a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">${CONFIG.whatsappLabel}</a>
        </nav>
      </div>
    </div>
    <div class="wrap footer__bottom">
      <span>© ${new Date().getFullYear()} LC Studio · LC Informática</span>
      <span class="footer__demo">Prévia de demonstração</span>
    </div>
  </footer>
  <a class="wa-float" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${ic('wa')}</a>`;
  document.body.append(...footer.children);

  /* badge do carrinho */
  const badge = document.getElementById('cartBadge');
  const atualizaBadge = () => { const n = Carrinho.qtd(); badge.textContent = n; badge.hidden = n === 0; };
  atualizaBadge();
  document.addEventListener('carrinho', () => { atualizaBadge(); badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); });

  /* topo com sombra ao rolar */
  const head = document.getElementById('topo');
  const onScroll = () => head.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu hambúrguer */
  const burger = document.getElementById('burger');
  const setMenu = (open) => { document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* troca ícones declarados como <i data-ic="nome"></i> */
  document.querySelectorAll('[data-ic]').forEach(el => { el.outerHTML = ic(el.dataset.ic); });
})();

/* Animação ao rolar (chamar de novo depois de renderizar conteúdo) */
const REDUZ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let _io = null;
function revelar(raiz = document) {
  const els = [...raiz.querySelectorAll('.reveal:not(.is-in)')];
  if (REDUZ || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
  _io = _io || new IntersectionObserver((ents) => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); _io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach((el, i) => { el.style.setProperty('--d', (i % 4) * 60 + 'ms'); _io.observe(el); });
}
document.addEventListener('DOMContentLoaded', () => revelar());

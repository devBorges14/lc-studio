/* =====================================================================
   LC Studio – dados, catálogo, cálculo de preço, carrinho, login e pedidos
   ---------------------------------------------------------------------
   PRÉVIA: tudo fica salvo no navegador (localStorage). Na versão final
   isto vira um banco de dados online (ex.: Supabase/Firebase).
   ===================================================================== */

const CONFIG = {
  whatsapp: '5511978136769',          // só números, com 55 + DDD
  whatsappLabel: '(11) 97813-6769',
  instagram: '',                      // ex.: 'lcstudio' (sem @). Vazio = esconde
  endereco: 'R. Cyro M. de Carvalho, 76 – Jardim Novo Taboão',
  cidade: 'São Paulo – SP, 05749-270'
};

/* ---------- Setores (cada nicho no seu lugar) ---------- */
const SETORES = {
  design: {
    nome: 'Agência de Design', curto: 'Design', page: 'design.html', icon: 'pen', cor: '#65029A',
    titulo: 'Marcas que <em>se reconhecem</em> de longe.',
    texto: 'Logo, identidade visual e artes para redes sociais pensadas para a sua marca ser lembrada.'
  },
  grafica: {
    nome: 'Gráfica', curto: 'Gráfica', page: 'grafica.html', icon: 'card', cor: '#C98A00',
    titulo: 'Impressos com <em>acabamento</em> caprichado.',
    texto: 'Cartões, folhetos, tags, bloquinhos, crachás e carimbos. Calcule o preço e peça online.'
  },
  visual: {
    nome: 'Comunicação Visual', curto: 'Com. visual', page: 'comunicacao-visual.html', icon: 'easel', cor: '#D0306A',
    titulo: 'Sua marca <em>na rua</em>, bem visível.',
    texto: 'Adesivos, rótulos, lonas e cavaletes resistentes, com impressão em alta definição.'
  },
  ti: {
    nome: 'T.I. e Informática', curto: 'T.I.', page: 'ti.html', icon: 'cpu', cor: '#1C6FD6',
    titulo: 'Seu computador <em>rodando liso</em>.',
    texto: 'LC Informática: montagem, reparos, troca de peças, formatação, limpeza e consultoria.'
  }
};

/* ---------- Catálogo ----------
   VALORES DE EXEMPLO: só crachá (R$ 35) e carimbos (R$ 92 / R$ 72) vieram
   do catálogo do cliente. Todo o resto deve ser confirmado e pode ser
   alterado no painel administrativo (aba Produtos).

   Modos de preço:
   tiers   → tabela por quantidade  [[qtd, preço], ...]
   unit    → preço por unidade × quantidade
   area    → preço por m² (largura × altura em cm) com mínimo
   service → serviço (estimativa; valor final após avaliação)
   Opções:  set = troca o preço base | mult = multiplica | add = soma 1x | addEach = soma por unidade */
const CATALOGO = [
  /* ---------- DESIGN ---------- */
  { slug: 'criacao-de-logo', setor: 'design', nome: 'Criação de logo', icon: 'pen',
    resumo: 'Logos originais, pensados para funcionar em qualquer tamanho.',
    descricao: 'Criamos logos originais e funcionais, desenvolvidos para representar a marca com clareza, personalidade e versatilidade. Cada projeto nasce de um processo criativo que considera o seu público e o seu negócio.',
    specs: ['Entrega em PNG, PDF e vetor', 'Versões colorida, preta e branca', 'Rodadas de ajuste incluídas'],
    preco: { modo: 'service', valor: 350 },
    opcoes: [
      { id: 'pacote', label: 'Pacote', escolhas: [
        { label: 'Essencial (logo)', set: 350 },
        { label: 'Completo (logo + guia de uso)', set: 600 } ] },
      { id: 'urg', label: 'Prazo', escolhas: [ { label: 'Normal' }, { label: 'Urgente', mult: 1.3 } ] }
    ] },
  { slug: 'identidade-visual', setor: 'design', nome: 'Identidade visual', icon: 'layers', destaque: true,
    resumo: 'Cores, tipografia e aplicações para a marca ficar igual em todo lugar.',
    descricao: 'Desenvolvemos identidades visuais completas, pensadas para traduzir a essência da marca de forma clara, consistente e profissional. A identidade inclui aplicações estratégicas que garantem unidade do digital ao impresso.',
    specs: ['Logo + paleta + tipografia', 'Manual de identidade', 'Aplicações (cartão, redes, fachada)'],
    preco: { modo: 'service', valor: 900 },
    opcoes: [
      { id: 'pacote', label: 'Pacote', escolhas: [
        { label: 'Básica', set: 900 }, { label: 'Completa (com papelaria)', set: 1500 } ] }
    ] },
  { slug: 'artes-redes-sociais', setor: 'design', nome: 'Artes para redes sociais', icon: 'phone', destaque: true,
    resumo: 'Posts e stories alinhados à sua marca, de leitura rápida.',
    descricao: 'Criamos artes para redes sociais alinhadas à identidade da marca, pensadas para comunicar com clareza, consistência e impacto visual. Atendemos desde posts institucionais até conteúdos promocionais.',
    specs: ['Formatos feed e stories', 'Arquivos prontos para postar', 'Padrão visual da sua marca'],
    preco: { modo: 'service', valor: 120 },
    opcoes: [
      { id: 'pacote', label: 'Pacote mensal', escolhas: [
        { label: '4 posts', set: 120 }, { label: '8 posts', set: 220 }, { label: '12 posts', set: 300 } ] },
      { id: 'stories', label: 'Stories', escolhas: [ { label: 'Sem stories' }, { label: 'Com stories', add: 60 } ] }
    ] },

  /* ---------- GRÁFICA ---------- */
  { slug: 'cartao-de-visita', setor: 'grafica', nome: 'Cartão de visita', icon: 'card', destaque: true,
    resumo: 'Visita ou fidelidade. Couchê, PVC, reciclado, kraft ou metalizado.',
    descricao: 'Cartão de visita ou fidelidade com impressão nítida e vários materiais. Formatos 48x88 mm e 43x48 mm, gramaturas de 250 g a 600 g.',
    specs: ['Formatos: 48x88 mm e 43x48 mm', 'Couchê brilho, PVC/PS/PET, reciclato, kraft, metalizado', 'Gramaturas: 250 g, 300 g e 600 g'],
    preco: { modo: 'tiers', unidade: 'cartões', tiers: [[100, 45], [250, 75], [500, 110], [1000, 170]] },
    opcoes: [
      { id: 'formato', label: 'Formato', escolhas: [ { label: '48x88 mm' }, { label: '43x48 mm', mult: 0.8 } ] },
      { id: 'material', label: 'Material', escolhas: [
        { label: 'Couchê brilho' }, { label: 'Reciclato', mult: 1.3 }, { label: 'Kraft', mult: 1.3 },
        { label: 'Metalizado', mult: 1.8 }, { label: 'PVC / PS / PET', mult: 2.5 } ] },
      { id: 'gramatura', label: 'Gramatura', escolhas: [ { label: '300 g' }, { label: '250 g', mult: 0.95 }, { label: '600 g', mult: 1.4 } ] },
      { id: 'lados', label: 'Impressão', escolhas: [ { label: 'Só frente' }, { label: 'Frente e verso', mult: 1.35 } ] },
      { id: 'arte', label: 'Arte', escolhas: [ { label: 'Já tenho a arte' }, { label: 'Criar a arte', add: 40 } ] }
    ] },
  { slug: 'folhetos-folders', setor: 'grafica', nome: 'Folhetos, folders e santinhos', icon: 'flyer', destaque: true,
    resumo: 'Vários formatos, dobras e papéis para divulgar o seu negócio.',
    descricao: 'Materiais impressos desenvolvidos para comunicar de forma direta, eficiente e profissional. Trabalhamos com diferentes formatos, dobras e papéis, adaptando cada material ao objetivo da comunicação.',
    specs: ['Do santinho ao A4', 'Com ou sem dobra', 'Couchê de alta qualidade'],
    preco: { modo: 'tiers', unidade: 'unidades', tiers: [[500, 140], [1000, 210], [2500, 380], [5000, 620]] },
    opcoes: [
      { id: 'formato', label: 'Formato', escolhas: [
        { label: '10x15 cm' }, { label: 'Santinho 7x10 cm', mult: 0.6 }, { label: 'A5', mult: 1.6 }, { label: 'A4', mult: 2.6 } ] },
      { id: 'dobra', label: 'Dobra', escolhas: [ { label: 'Sem dobra' }, { label: '1 dobra (folder)', mult: 1.25 }, { label: '2 dobras', mult: 1.35 } ] },
      { id: 'lados', label: 'Impressão', escolhas: [ { label: 'Frente e verso' }, { label: 'Só frente', mult: 0.8 } ] },
      { id: 'arte', label: 'Arte', escolhas: [ { label: 'Já tenho a arte' }, { label: 'Criar a arte', add: 60 } ] }
    ] },
  { slug: 'tags', setor: 'grafica', nome: 'Tags para roupas e produtos', icon: 'tag',
    resumo: 'Para roupas, acessórios e embalagens. Valorizam o produto.',
    descricao: 'Tags personalizadas que valorizam o produto e reforçam a identidade da marca no ponto de contato com o cliente. Produzidas em diferentes papéis, gramaturas e acabamentos.',
    specs: ['Papéis e gramaturas variados', 'Furo e cordão opcionais', 'Ideal para roupas e embalagens'],
    preco: { modo: 'tiers', unidade: 'tags', tiers: [[100, 60], [250, 110], [500, 180], [1000, 290]] },
    opcoes: [
      { id: 'cordao', label: 'Acabamento', escolhas: [ { label: 'Com furo' }, { label: 'Furo + cordão', addEach: 0.25 } ] },
      { id: 'arte', label: 'Arte', escolhas: [ { label: 'Já tenho a arte' }, { label: 'Criar a arte', add: 40 } ] }
    ] },
  { slug: 'bloquinhos', setor: 'grafica', nome: 'Bloquinhos personalizados', icon: 'notepad',
    resumo: 'Para anotações, brindes e uso no balcão.',
    descricao: 'Bloquinhos personalizados que unem funcionalidade e presença de marca no dia a dia. Ideais para anotações, uso corporativo, brindes e ações promocionais.',
    specs: ['Blocos de 50 folhas', 'Vários tamanhos', 'Capa e base inclusas'],
    preco: { modo: 'tiers', unidade: 'blocos', tiers: [[10, 70], [25, 150], [50, 260], [100, 450]] },
    opcoes: [
      { id: 'tamanho', label: 'Tamanho', escolhas: [ { label: '10x7 cm' }, { label: '10x15 cm', mult: 1.4 }, { label: 'A5', mult: 2 } ] }
    ] },
  { slug: 'fichas-anamnese', setor: 'grafica', nome: 'Fichas de anamnese', icon: 'clipboard',
    resumo: 'Para saúde, estética e bem-estar. Layout claro e organizado.',
    descricao: 'Fichas de anamnese personalizadas, pensadas para facilitar o registro de informações de forma clara, organizada e profissional. Ideais para saúde, estética, bem-estar e serviços especializados.',
    specs: ['Blocos de 50 folhas', 'Layout personalizado', 'A5 ou A4'],
    preco: { modo: 'tiers', unidade: 'blocos', tiers: [[5, 90], [10, 160], [20, 290]] },
    opcoes: [
      { id: 'formato', label: 'Formato', escolhas: [ { label: 'A5' }, { label: 'A4', mult: 1.6 } ] },
      { id: 'lados', label: 'Impressão', escolhas: [ { label: 'Só frente' }, { label: 'Frente e verso', mult: 1.3 } ] }
    ] },
  { slug: 'cracha-carteirinha', setor: 'grafica', nome: 'Crachá ou carteirinha', icon: 'badge', destaque: true,
    resumo: 'PVC com brilho e cantos arredondados.',
    descricao: 'Crachás e carteirinhas em PVC, com acabamento em brilho e cantos arredondados. Para empresas, escolas, eventos e associações.',
    specs: ['Material: PVC', 'Acabamento: brilho e cantos arredondados', 'Com foto e dados'],
    preco: { modo: 'unit', valor: 35, unidade: 'unidades' },
    opcoes: [
      { id: 'cordao', label: 'Cordão', escolhas: [ { label: 'Sem cordão' }, { label: 'Com cordão', addEach: 6 } ] }
    ] },
  { slug: 'carimbos', setor: 'grafica', nome: 'Carimbos', icon: 'stamp',
    resumo: 'Automático ou de madeira para CNPJ.',
    descricao: 'Carimbo automático: prático e eficiente, com recarga automática de tinta. Carimbo de madeira (CNPJ): imprime rapidamente as informações de identificação da empresa.',
    specs: ['Automático com recarga de tinta', 'Madeira para CNPJ', 'Arte do carimbo inclusa'],
    preco: { modo: 'unit', valor: 92, unidade: 'unidades' },
    opcoes: [
      { id: 'tipo', label: 'Tipo', escolhas: [ { label: 'Automático', set: 92 }, { label: 'Madeira (CNPJ)', set: 72 } ] }
    ] },

  /* ---------- COMUNICAÇÃO VISUAL ---------- */
  { slug: 'adesivos-rotulos', setor: 'visual', nome: 'Adesivos, rótulos e etiquetas', icon: 'sticker', destaque: true,
    resumo: 'Boa aderência, cor fiel e recorte do seu jeito.',
    descricao: 'Adesivos, rótulos e etiquetas personalizadas que reforçam a identidade da marca e valorizam o produto. Materiais adequados para cada aplicação, com boa aderência, resistência e excelente acabamento.',
    specs: ['Vinil branco, transparente ou perfurado', 'Recorte reto ou especial', 'Cobrado por m²'],
    preco: { modo: 'area', m2: 90, minimo: 30, unidade: 'peças', padrao: [50, 50] },
    opcoes: [
      { id: 'material', label: 'Material', escolhas: [ { label: 'Vinil branco' }, { label: 'Vinil transparente', mult: 1.15 }, { label: 'Vinil perfurado', mult: 1.3 } ] },
      { id: 'recorte', label: 'Recorte', escolhas: [ { label: 'Retangular' }, { label: 'Recorte especial', mult: 1.25 } ] }
    ] },
  { slug: 'lonas-banners', setor: 'visual', nome: 'Lonas e banners', icon: 'flag',
    resumo: 'Fachadas, faixas e banners com acabamento reforçado.',
    descricao: 'Lonas confeccionadas com materiais duráveis e acabamento reforçado, garantindo boa fixação, resistência ao uso e excelente visibilidade.',
    specs: ['Impressão em alta definição', 'Bainha e ilhós ou bastão', 'Cobrado por m²'],
    preco: { modo: 'area', m2: 70, minimo: 50, unidade: 'peças', padrao: [100, 60] },
    opcoes: [
      { id: 'acab', label: 'Acabamento', escolhas: [ { label: 'Bainha e ilhós' }, { label: 'Bastão e corda', addEach: 25 } ] }
    ] },
  { slug: 'cavaletes', setor: 'visual', nome: 'Cavaletes e estruturas', icon: 'easel',
    resumo: 'Para calçada e promoção, com montagem rápida.',
    descricao: 'Cavaletes e estruturas personalizadas, ideais para mensagens promocionais, sinalização e comunicação externa. Oferecem estabilidade e praticidade, com montagem rápida.',
    specs: ['Estrutura resistente', 'Impressão 1 ou 2 lados', 'Troca só da lona disponível'],
    preco: { modo: 'unit', valor: 180, unidade: 'unidades' },
    opcoes: [
      { id: 'tipo', label: 'Tipo', escolhas: [ { label: 'Cavalete 1 lado', set: 180 }, { label: 'Cavalete 2 lados', set: 240 }, { label: 'Só troca da lona', set: 90 } ] }
    ] },

  /* ---------- T.I. ---------- */
  { slug: 'montagem-pc', setor: 'ti', nome: 'Montagem de PC', icon: 'cpu', destaque: true,
    resumo: 'Do escritório ao gamer, montado e testado.',
    descricao: 'Montagem de computadores com foco em desempenho e organização: escolha das peças, montagem, organização de cabos, instalação do sistema e testes. Peças orçadas à parte.',
    specs: ['Ajuda na escolha das peças', 'Organização de cabos', 'Testes de estabilidade'],
    nota: 'Valor da mão de obra. Peças orçadas à parte.',
    preco: { modo: 'service', valor: 150 },
    opcoes: [
      { id: 'tipo', label: 'Tipo de PC', escolhas: [ { label: 'Escritório / estudo', set: 150 }, { label: 'Gamer / edição', set: 250 } ] },
      { id: 'so', label: 'Sistema', escolhas: [ { label: 'Sem instalação' }, { label: 'Instalar sistema e drivers', add: 60 } ] }
    ] },
  { slug: 'manutencao-reparo', setor: 'ti', nome: 'Manutenção e reparo', icon: 'wrench', destaque: true,
    resumo: 'Não liga, travando, esquentando? A gente resolve.',
    descricao: 'Diagnóstico e reparo de computadores e notebooks. Avaliamos o equipamento, explicamos o problema e só fazemos o serviço depois da sua aprovação.',
    specs: ['Diagnóstico antes de qualquer serviço', 'Orçamento aprovado por você', 'Desktop e notebook'],
    nota: 'Estimativa. O valor final sai após o diagnóstico.',
    preco: { modo: 'service', valor: 100 },
    opcoes: [
      { id: 'equip', label: 'Equipamento', escolhas: [ { label: 'Desktop', set: 100 }, { label: 'Notebook', set: 120 } ] }
    ] },
  { slug: 'troca-de-pecas', setor: 'ti', nome: 'Troca de peças', icon: 'chip',
    resumo: 'SSD, memória, fonte, tela e teclado de notebook.',
    descricao: 'Upgrade e troca de peças com instalação e testes. Ideal para deixar o computador mais rápido (SSD, memória) ou recuperar um notebook (tela, teclado).',
    specs: ['Instalação e testes inclusos', 'Migração de dados no upgrade de SSD', 'Peça pode ser sua ou nossa'],
    nota: 'Valor da mão de obra. Peça orçada à parte.',
    preco: { modo: 'service', valor: 80 },
    opcoes: [
      { id: 'peca', label: 'Peça', escolhas: [
        { label: 'SSD / HD', set: 80 }, { label: 'Memória RAM', set: 60 }, { label: 'Fonte', set: 80 },
        { label: 'Tela de notebook', set: 150 }, { label: 'Teclado de notebook', set: 120 } ] },
      { id: 'dados', label: 'Dados', escolhas: [ { label: 'Sem migração' }, { label: 'Migrar meus dados', add: 50 } ] }
    ] },
  { slug: 'formatacao', setor: 'ti', nome: 'Formatação e programas', icon: 'refresh',
    resumo: 'Sistema limpo, drivers e programas instalados.',
    descricao: 'Formatação com instalação do sistema, drivers e programas essenciais. Backup dos seus arquivos opcional.',
    specs: ['Sistema e drivers atualizados', 'Programas essenciais', 'Backup opcional'],
    preco: { modo: 'service', valor: 120 },
    opcoes: [
      { id: 'backup', label: 'Backup', escolhas: [ { label: 'Sem backup' }, { label: 'Com backup dos arquivos', add: 50 } ] },
      { id: 'office', label: 'Pacote de escritório', escolhas: [ { label: 'Não' }, { label: 'Instalar', add: 30 } ] }
    ] },
  { slug: 'limpeza-preventiva', setor: 'ti', nome: 'Limpeza preventiva', icon: 'fan',
    resumo: 'Menos calor, menos barulho, mais vida útil.',
    descricao: 'Limpeza interna completa, troca de pasta térmica e verificação das ventoinhas. Ajuda a evitar travamentos e superaquecimento.',
    specs: ['Limpeza interna completa', 'Troca de pasta térmica', 'Verificação de temperatura'],
    preco: { modo: 'service', valor: 80 },
    opcoes: [
      { id: 'equip', label: 'Equipamento', escolhas: [ { label: 'Desktop', set: 80 }, { label: 'Notebook', set: 110 } ] },
      { id: 'pasta', label: 'Pasta térmica', escolhas: [ { label: 'Padrão' }, { label: 'Premium', add: 30 } ] }
    ] },
  { slug: 'consultoria-ti', setor: 'ti', nome: 'Consultoria em T.I.', icon: 'chat',
    resumo: 'Rede, compras, organização e uso da tecnologia.',
    descricao: 'Consultoria em informática para empresas e pessoas: orientação na compra de equipamentos, organização da rede e uso eficiente da tecnologia.',
    specs: ['Presencial ou remota', 'Para empresas e pessoas', 'Cobrada por hora'],
    preco: { modo: 'service', valor: 100, porHora: true },
    opcoes: [] }
];

/* ---------- Utilidades ---------- */
const brl = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const hojeISO = () => new Date().toISOString();
const fmtData = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';
const fmtDataHora = (iso) => iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
const soNumeros = (s) => String(s || '').replace(/\D/g, '');
const waLink = (msg, numero = CONFIG.whatsapp) => `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

/* ---------- Armazenamento local ---------- */
const DB = {
  get(k, def) { try { const v = localStorage.getItem('lc_' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem('lc_' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('lc_' + k); } catch {} }
};

/* ---------- Preços: ajustes feitos no painel sobrepõem o catálogo ---------- */
function produtos() {
  const ajustes = DB.get('precos', {});
  return CATALOGO.map(p => {
    const a = ajustes[p.slug];
    const q = structuredClone(p);
    if (a) {
      if (a.ativo === false) q.inativo = true;
      if (a.tiers) q.preco.tiers = q.preco.tiers.map((t, i) => [t[0], a.tiers[i] ?? t[1]]);
      if (a.valor != null) q.preco.valor = a.valor;
      if (a.m2 != null) q.preco.m2 = a.m2;
      if (a.minimo != null) q.preco.minimo = a.minimo;
      if (a.sets) q.opcoes.forEach(o => o.escolhas.forEach((e, i) => { const k = o.id + ':' + i; if (e.set != null && a.sets[k] != null) e.set = a.sets[k]; }));
    }
    return q;
  });
}
const produto = (slug) => produtos().find(p => p.slug === slug);

/* Calcula o preço de uma configuração
   cfg = { qtd, largura, altura, escolhas: { idOpcao: índice } } */
function calcular(p, cfg = {}) {
  const pr = p.preco;
  const esc_ = cfg.escolhas || {};
  const escolhidas = p.opcoes.map(o => ({ o, e: o.escolhas[esc_[o.id] ?? 0] }));
  let mult = 1, add = 0, addEach = 0, unit = pr.valor;
  escolhidas.forEach(({ e }) => {
    if (e.set != null) unit = e.set;
    if (e.mult) mult *= e.mult;
    if (e.add) add += e.add;
    if (e.addEach) addEach += e.addEach;
  });
  let qtd, base, detalhe;
  if (pr.modo === 'tiers') {
    qtd = Number(cfg.qtd) || pr.tiers[0][0];
    const t = pr.tiers.find(t => t[0] === qtd) || pr.tiers[0];
    qtd = t[0]; base = t[1] * mult;
    detalhe = `${qtd} ${pr.unidade}`;
  } else if (pr.modo === 'area') {
    const [dw, dh] = pr.padrao || [100, 100];
    const w = Math.max(1, Number(cfg.largura) || dw), h = Math.max(1, Number(cfg.altura) || dh);
    qtd = Math.max(1, Math.round(Number(cfg.qtd) || 1));
    const m2 = (w * h) / 10000 * qtd;
    base = Math.max(pr.minimo || 0, m2 * pr.m2 * mult);
    detalhe = `${qtd} ${qtd > 1 ? pr.unidade : 'peça'} de ${w}x${h} cm (${m2.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m²)`;
  } else if (pr.modo === 'unit') {
    qtd = Math.max(1, Math.round(Number(cfg.qtd) || 1));
    base = unit * qtd * mult;
    detalhe = `${qtd} ${qtd > 1 ? pr.unidade : 'unidade'}`;
  } else { // service
    qtd = pr.porHora ? Math.max(1, Math.round(Number(cfg.qtd) || 1)) : 1;
    base = unit * qtd * mult;
    detalhe = pr.porHora ? `${qtd} hora${qtd > 1 ? 's' : ''}` : 'Serviço';
  }
  const total = Math.round((base + add + addEach * qtd) * 100) / 100;
  const linhas = escolhidas.map(({ o, e }) => `${o.label}: ${e.label}`);
  return { total, qtd, detalhe, linhas, estimativa: pr.modo === 'service' };
}
const aPartirDe = (p) => calcular(p, {}).total;

/* ---------- Carrinho ---------- */
const Carrinho = {
  itens() { return DB.get('carrinho', []); },
  salvar(i) { DB.set('carrinho', i); document.dispatchEvent(new CustomEvent('carrinho')); },
  add(slug, cfg) {
    const p = produto(slug); const r = calcular(p, cfg);
    const itens = this.itens();
    itens.push({ id: uid(), slug, nome: p.nome, setor: p.setor, cfg, detalhe: r.detalhe, linhas: r.linhas, total: r.total, estimativa: r.estimativa });
    this.salvar(itens);
  },
  remover(id) { this.salvar(this.itens().filter(i => i.id !== id)); },
  limpar() { this.salvar([]); },
  total() { return this.itens().reduce((s, i) => s + i.total, 0); },
  qtd() { return this.itens().length; }
};

/* ---------- Status ---------- */
const STATUS_PEDIDO = ['Novo', 'Orçamento enviado', 'Aprovado', 'Em arte', 'Em produção', 'Pronto', 'Entregue', 'Cancelado'];
const STATUS_OS = ['Recebido', 'Em diagnóstico', 'Aguardando aprovação', 'Aguardando peça', 'Em reparo', 'Pronto', 'Entregue', 'Cancelado'];
const PAGAMENTO = ['Pendente', 'Sinal pago', 'Pago'];
const FORMAS = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Boleto'];
const CAT_ENTRADA = ['Pedido', 'Serviço T.I.', 'Outros'];
const CAT_SAIDA = ['Papel e materiais', 'Tinta e insumos', 'Peças de T.I.', 'Terceirizados', 'Aluguel', 'Energia e internet', 'Equipamentos', 'Impostos', 'Outros'];

/* ---------- Banco de dados de demonstração ---------- */
const Banco = {
  pedidos() { return DB.get('pedidos', []); },
  salvarPedidos(v) { DB.set('pedidos', v); },
  os() { return DB.get('os', []); },
  salvarOS(v) { DB.set('os', v); },
  lanc() { return DB.get('financeiro', []); },
  salvarLanc(v) { DB.set('financeiro', v); },
  usuarios() { return DB.get('usuarios', []); },
  salvarUsuarios(v) { DB.set('usuarios', v); },
  proxNumero(chave, inicio) { const n = DB.get('seq_' + chave, inicio) + 1; DB.set('seq_' + chave, n); return n; },

  criarPedido({ cliente, itens, entrega, obs, origem = 'Site' }) {
    const pedidos = this.pedidos();
    const p = {
      id: 'LC-' + this.proxNumero('pedido', 1040), criadoEm: hojeISO(), origem,
      cliente, itens, entrega, obs: obs || '',
      total: Math.round(itens.reduce((s, i) => s + i.total, 0) * 100) / 100,
      status: 'Novo', pagamento: { status: 'Pendente', pago: 0, forma: '' },
      prazo: '', historico: [{ em: hojeISO(), txt: 'Pedido recebido pelo site' }]
    };
    pedidos.unshift(p); this.salvarPedidos(pedidos);
    return p;
  }
};

/* ---------- Login (demonstração: senhas ficam no navegador) ---------- */
const Auth = {
  atual() { const id = DB.get('sessao', null); return id ? Banco.usuarios().find(u => u.id === id) || null : null; },
  entrar(email, senha) {
    const u = Banco.usuarios().find(u => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.senha === senha);
    if (u) DB.set('sessao', u.id);
    return u || null;
  },
  cadastrar({ nome, email, telefone, senha }) {
    const us = Banco.usuarios();
    if (us.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) return { erro: 'Este e-mail já tem cadastro.' };
    const u = { id: uid(), nome: nome.trim(), email: email.trim(), telefone: telefone.trim(), senha, papel: 'cliente', criadoEm: hojeISO() };
    us.push(u); Banco.salvarUsuarios(us); DB.set('sessao', u.id);
    return { u };
  },
  sair() { DB.del('sessao'); }
};

/* ---------- Dados de exemplo (para o painel não começar vazio) ---------- */
const DEMO = { admin: { email: 'admin@lcstudio.demo', senha: 'lc2026' }, cliente: { email: 'cliente@lcstudio.demo', senha: 'lc2026' } };

function semear(forcar = false) {
  if (!forcar && DB.get('semeado', false)) return;
  const dias = (n, h = 10) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 15, 0, 0); return d.toISOString(); };
  const cli = [
    { nome: 'Mariana Alves (exemplo)', telefone: '11900000001', email: 'cliente@lcstudio.demo' },
    { nome: 'Carlos Pereira (exemplo)', telefone: '11900000002', email: '' },
    { nome: 'Juliana Rocha (exemplo)', telefone: '11900000003', email: '' },
    { nome: 'Ricardo Lima (exemplo)', telefone: '11900000004', email: '' },
    { nome: 'Fernanda Dias (exemplo)', telefone: '11900000005', email: '' },
    { nome: 'André Santos (exemplo)', telefone: '11900000006', email: '' }
  ];
  const item = (slug, cfg) => { const p = CATALOGO.find(x => x.slug === slug); const r = calcular(p, cfg); return { id: uid(), slug, nome: p.nome, setor: p.setor, cfg, detalhe: r.detalhe, linhas: r.linhas, total: r.total, estimativa: r.estimativa }; };
  const base = [
    [0, 0, [item('cartao-de-visita', { qtd: 500, escolhas: { lados: 1 } })], 'Novo', 'Pendente', 0],
    [0, 3, [item('cracha-carteirinha', { qtd: 12, escolhas: { cordao: 1 } })], 'Novo', 'Pendente', 0],
    [1, 1, [item('identidade-visual', {}), item('cartao-de-visita', { qtd: 250 })], 'Orçamento enviado', 'Pendente', 0],
    [2, 2, [item('folhetos-folders', { qtd: 1000, escolhas: { dobra: 1 } })], 'Em arte', 'Sinal pago', 0.5],
    [4, 4, [item('adesivos-rotulos', { qtd: 4, largura: 60, altura: 40 })], 'Em produção', 'Sinal pago', 0.5],
    [5, 5, [item('carimbos', { qtd: 1 })], 'Pronto', 'Pago', 1],
    [8, 0, [item('artes-redes-sociais', { escolhas: { pacote: 1 } })], 'Entregue', 'Pago', 1],
    [15, 3, [item('lonas-banners', { qtd: 1, largura: 300, altura: 100 })], 'Entregue', 'Pago', 1],
    [24, 1, [item('tags', { qtd: 500, escolhas: { cordao: 1 } })], 'Entregue', 'Pago', 1],
    [37, 2, [item('criacao-de-logo', { escolhas: { pacote: 1 } })], 'Entregue', 'Pago', 1],
    [52, 4, [item('bloquinhos', { qtd: 50 })], 'Entregue', 'Pago', 1],
    [70, 5, [item('cavaletes', { escolhas: { tipo: 1 } })], 'Entregue', 'Pago', 1],
    [96, 0, [item('fichas-anamnese', { qtd: 10 })], 'Entregue', 'Pago', 1],
    [120, 1, [item('cartao-de-visita', { qtd: 1000, escolhas: { material: 3 } })], 'Entregue', 'Pago', 1],
    [150, 3, [item('identidade-visual', { escolhas: { pacote: 1 } })], 'Entregue', 'Pago', 1],
    [3, 2, [item('folhetos-folders', { qtd: 500 })], 'Cancelado', 'Pendente', 0]
  ];
  const fin = [];
  const pedidos = base.map(([d, c, itens, status, pag, frac], i) => {
    const total = Math.round(itens.reduce((s, x) => s + x.total, 0) * 100) / 100;
    const pago = Math.round(total * frac * 100) / 100;
    const id = 'LC-' + (1040 - i);
    const forma = FORMAS[i % 3];
    if (pago > 0) fin.push({ id: uid(), data: dias(Math.max(0, d - 1)), tipo: 'entrada', categoria: 'Pedido', descricao: `Pedido ${id}`, valor: pago, forma, ref: id });
    const prazo = new Date(); prazo.setDate(prazo.getDate() - d + 5);
    return {
      id, criadoEm: dias(d, 9 + (i % 8)), origem: i % 3 ? 'Site' : 'WhatsApp', cliente: cli[c], itens,
      entrega: i % 2 ? 'Retirada no local' : 'Combinar entrega', obs: '', total, status,
      pagamento: { status: pag, pago, forma: pago ? forma : '' }, prazo: prazo.toISOString().slice(0, 10),
      historico: [{ em: dias(d, 9), txt: 'Pedido recebido' }, ...(status !== 'Novo' ? [{ em: dias(Math.max(0, d - 1), 15), txt: 'Status: ' + status }] : [])]
    };
  });
  const os = [
    { d: 0, c: 3, equip: 'Notebook Dell Inspiron', defeito: 'Não liga', diag: '', pecas: [], mo: 0, status: 'Recebido', pag: 'Pendente' },
    { d: 1, c: 4, equip: 'Desktop (gabinete preto)', defeito: 'Lento e travando', diag: 'HD com setores defeituosos. Recomendado SSD 480 GB.', pecas: [{ desc: 'SSD 480 GB', valor: 210 }], mo: 80, status: 'Aguardando aprovação', pag: 'Pendente' },
    { d: 3, c: 1, equip: 'Notebook Lenovo IdeaPad', defeito: 'Tela quebrada', diag: 'Tela 15,6" danificada.', pecas: [{ desc: 'Tela 15,6" LED', valor: 380 }], mo: 150, status: 'Aguardando peça', pag: 'Sinal pago' },
    { d: 6, c: 5, equip: 'PC Gamer (montagem)', defeito: 'Montagem completa', diag: 'Peças trazidas pelo cliente.', pecas: [], mo: 250, status: 'Em reparo', pag: 'Pendente' },
    { d: 10, c: 2, equip: 'Notebook Acer Aspire', defeito: 'Esquentando muito', diag: 'Limpeza e troca de pasta térmica.', pecas: [], mo: 110, status: 'Entregue', pag: 'Pago' },
    { d: 33, c: 0, equip: 'Desktop do escritório', defeito: 'Formatação', diag: 'Formatação com backup.', pecas: [], mo: 170, status: 'Entregue', pag: 'Pago' }
  ].map((o, i) => {
    const total = o.mo + o.pecas.reduce((s, p) => s + p.valor, 0);
    const pago = o.pag === 'Pago' ? total : o.pag === 'Sinal pago' ? Math.round(total * 0.5) : 0;
    const id = 'OS-' + (206 - i);
    if (pago) fin.push({ id: uid(), data: dias(o.d), tipo: 'entrada', categoria: 'Serviço T.I.', descricao: `Ordem de serviço ${id}`, valor: pago, forma: 'Pix', ref: id });
    return { id, criadoEm: dias(o.d, 11), cliente: cli[o.c], equipamento: o.equip, acessorios: i % 2 ? 'Carregador' : '', defeito: o.defeito, diagnostico: o.diag, pecas: o.pecas, maoDeObra: o.mo, status: o.status, pagamento: { status: o.pag, pago }, historico: [{ em: dias(o.d, 11), txt: 'Equipamento recebido' }] };
  });
  // despesas de exemplo (últimos 6 meses)
  const desp = [['Aluguel', 1200], ['Energia e internet', 320], ['Papel e materiais', 0], ['Tinta e insumos', 0]];
  for (let m = 0; m < 6; m++) {
    const d0 = m * 30 + 5;
    fin.push({ id: uid(), data: dias(d0), tipo: 'saida', categoria: 'Aluguel', descricao: 'Aluguel do mês', valor: desp[0][1], forma: 'Boleto' });
    fin.push({ id: uid(), data: dias(d0 + 2), tipo: 'saida', categoria: 'Energia e internet', descricao: 'Luz + internet', valor: 300 + (m * 17) % 60, forma: 'Boleto' });
    fin.push({ id: uid(), data: dias(d0 + 8), tipo: 'saida', categoria: 'Papel e materiais', descricao: 'Compra de papéis', valor: 380 + (m * 53) % 200, forma: 'Pix' });
    fin.push({ id: uid(), data: dias(d0 + 12), tipo: 'saida', categoria: 'Tinta e insumos', descricao: 'Tintas e laminação', valor: 240 + (m * 31) % 120, forma: 'Cartão de crédito' });
    // entradas de balcão para o gráfico ter histórico
    fin.push({ id: uid(), data: dias(d0 + 4), tipo: 'entrada', categoria: 'Outros', descricao: 'Vendas de balcão (exemplo)', valor: 1800 + (m * 371) % 900, forma: 'Dinheiro' });
    fin.push({ id: uid(), data: dias(d0 + 15), tipo: 'entrada', categoria: 'Serviço T.I.', descricao: 'Serviços de T.I. (exemplo)', valor: 700 + (m * 211) % 500, forma: 'Pix' });
  }
  fin.push({ id: uid(), data: dias(2), tipo: 'saida', categoria: 'Peças de T.I.', descricao: 'SSD e memórias para estoque', valor: 640, forma: 'Pix' });
  fin.push({ id: uid(), data: dias(9), tipo: 'saida', categoria: 'Terceirizados', descricao: 'Corte especial de adesivos', valor: 150, forma: 'Pix' });

  const usuarios = [
    { id: 'u-admin', nome: 'Administrador LC', email: DEMO.admin.email, telefone: '', senha: DEMO.admin.senha, papel: 'admin', criadoEm: dias(200) },
    { id: 'u-cliente', nome: cli[0].nome, email: DEMO.cliente.email, telefone: cli[0].telefone, senha: DEMO.cliente.senha, papel: 'cliente', criadoEm: dias(160) }
  ];
  DB.set('pedidos', pedidos); DB.set('os', os); DB.set('financeiro', fin.sort((a, b) => b.data.localeCompare(a.data)));
  DB.set('usuarios', usuarios); DB.set('seq_pedido', 1040); DB.set('seq_os', 206); DB.set('semeado', true);
}
semear();

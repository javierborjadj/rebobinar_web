/* Componentes de la interfaz: cajas VHS, filas, grillas, teclado, avisos y ventanas */
'use strict';

/* ===== Aviso breve ===== */
let toastTimer = null;
function toast(msg, ms) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms || 3200);
}

/* ===== Caja VHS ===== */
function card(item, opts) {
  opts = opts || {};
  const seen = Lists.has(item.type, item.id, 'seen');
  const img = item.poster ? h('img', { src: API.img(item.poster, 'w342'), alt: '', loading: 'lazy', onerror: e => e.target.remove() }) : null;
  const sub = opts.sub != null ? opts.sub : [item.year, item.vote ? '★ ' + item.vote.toFixed(1) : '', item.type === 'tv' ? 'Serie' : ''].filter(Boolean).join(' · ');
  const el = h('div', {
      class: 'card', f: true, 'data-k': item.type + ':' + item.id,
      onclick: () => App.go('detail', { type: item.type, id: item.id })
    },
    h('div', { class: 'vhs', vars: { '--c': vhsColor(item.id), '--s': vhsStripe(item.id) } },
      h('div', { class: 'ph' }, h('b', null, item.title), h('i', null, item.year)),
      img,
      opts.sticker ? h('div', { class: 'sticker' + (opts.stickerAlt ? ' alt' : '') }, opts.sticker) : null,
      seen ? h('div', { class: 'sticker seen' }, 'VISTA') : null
    ),
    h('div', { class: 'cap' }, item.title),
    h('div', { class: 'sub' }, sub)
  );
  el._item = item;
  return el;
}

function spinnerEl() { return h('div', { style: { padding: '30px 40px' } }, h('div', { class: 'spinner' })); }
function emptyEl(title, text) { return h('div', { class: 'empty' }, h('span', { class: 'bg' }, title), text || ''); }

function errorText(e) {
  if (!e) return 'Algo falló';
  if (e.status === 401) return 'La clave de TMDB no funciona. Revisala en Ajustes › Claves de API.';
  if (e.status === 0) return 'Sin conexión a internet.';
  return e.message || 'Algo falló';
}

/**
 * Paginador: load(page) devuelve {items, total}. Sirve para filas y grillas
 * que piden más títulos cuando el foco se acerca al final.
 */
function makePager(load, opts) {
  opts = opts || {};
  return { load, page: 0, total: 1, loading: false, items: [], ...opts };
}
async function pagerNext(p) {
  if (p.loading || p.page >= p.total) return [];
  p.loading = true;
  try {
    const r = await p.load(p.page + 1);
    p.page = r.page || p.page + 1;
    p.total = r.total || 1;
    const seen = new Set(p.items.map(i => i.type + ':' + i.id));
    const fresh = r.items.filter(i => !seen.has(i.type + ':' + i.id));
    p.items = p.items.concat(fresh);
    return fresh;
  } finally { p.loading = false; }
}

/** Fila horizontal con título. load(page) → {items,total} */
function row(title, sub, load, opts) {
  opts = opts || {};
  const pager = makePager(load);
  const track = h('div', { class: 'track sx mem' }, spinnerEl());
  const el = h('section', { class: 'row' },
    h('div', { class: 'head' }, h('h2', { class: 'h-sec' }, title), sub ? h('span', { class: 'h-sub' }, sub) : null),
    track);
  const add = items => { for (const it of items) track.appendChild(card(it, opts.cardOpts ? opts.cardOpts(it) : null)); };
  el.ready = pagerNext(pager).then(items => {
    clear(track);
    if (!items.length) {
      if (opts.hideEmpty !== false) el.classList.add('hidden');
      else track.appendChild(emptyEl('Nada por acá', opts.emptyText || ''));
      return;
    }
    add(items);
  }).catch(e => { clear(track); track.appendChild(emptyEl('Ups', errorText(e))); });
  track.addEventListener('navfocus', e => {
    const cards = $$('.card', track);
    const i = cards.indexOf(e.target);
    if (i >= 0 && i >= cards.length - 4 && opts.paged !== false) pagerNext(pager).then(add).catch(() => { });
  });
  return el;
}

/** Grilla con carga infinita dentro de un contenedor con scroll vertical */
function grid(container, load, opts) {
  opts = opts || {};
  const pager = makePager(load);
  const g = h('div', { class: 'grid' });
  clear(container);
  container.appendChild(spinnerEl());
  const add = items => { for (const it of items) g.appendChild(card(it, opts.cardOpts ? opts.cardOpts(it) : null)); };
  const ready = pagerNext(pager).then(items => {
    clear(container);
    if (!items.length) { container.appendChild(emptyEl(opts.emptyTitle || 'Estante vacío', opts.emptyText || 'Probá con otra opción o desactivá «Solo mis plataformas».')); return; }
    container.appendChild(g);
    add(items);
  }).catch(e => { clear(container); container.appendChild(emptyEl('Ups', errorText(e))); });
  g.addEventListener('navfocus', e => {
    const cards = $$('.card', g);
    const i = cards.indexOf(e.target);
    if (i >= cards.length - 12) pagerNext(pager).then(add).catch(() => { });
  });
  return { el: g, ready, pager };
}

/** Línea de información del título con foco (y en qué plataformas está) */
function focusInfo(container, el) {
  let token = 0;
  const show = debounce(async (item) => {
    const my = ++token;
    const base = [h('b', null, item.title), item.year ? ' (' + item.year + ')' : '', item.vote ? ' · ★ ' + item.vote.toFixed(1) : ''];
    clear(el); appendKids(el, base);
    try {
      const pr = await API.providersFor(item.type, item.id);
      if (my !== token) return;
      const names = providerNames(pr);
      if (names.length) appendKids(el, [' · ', 'En: ', names.slice(0, 4).join(', ')]);
      else appendKids(el, [' · ', 'Sin streaming en tu país']);
    } catch (e) { }
  }, 300);
  container.addEventListener('navfocus', e => { if (e.target._item) show(e.target._item); });
}
function providerNames(pr) {
  if (!pr) return [];
  const seen = new Set(), out = [];
  for (const kind of ['flatrate', 'free', 'ads']) for (const p of (pr[kind] || [])) {
    const g = Platforms.of(p.provider_name);
    const n = g ? g.name : p.provider_name;
    if (!seen.has(n)) { seen.add(n); out.push(n); }
  }
  return out;
}

/* ===== Teclado en pantalla ===== */
class Keyboard {
  constructor(opts) {
    this.o = Object.assign({ value: '', layout: 'text', secret: false, onChange: null, onDone: null, placeholder: '' }, opts);
    this.value = this.o.value || '';
    this.upper = false;
    this.txt = h('div', { class: 'txt' + (this.o.secret ? ' secret' : '') });
    const disp = h('div', { class: 'disp' }, this.txt);
    this.keys = h('div', { class: 'keys' });
    this.el = h('div', { class: 'kb' }, disp, this.keys);
    this.el._kb = this;
    this.build();
    this.render();
    Keyboard.all.add(this);
  }
  build() {
    clear(this.keys);
    const add = (label, fn, cls, auto) => this.keys.appendChild(h('button', { type: 'button', class: 'key ' + (cls || ''), f: true, 'data-autofocus': auto ? '' : null, onclick: fn }, label));
    if (this.o.layout === 'hex') {
      '0123456789abcdef'.split('').forEach((c, i) => add(c, () => this.type(c), '', i === 0));
      add('BORRAR', () => this.del(), 'wide');
      add('LIMPIAR', () => this.set(''), 'wide');
      add('LISTO', () => this.done(), 'wide');
      return;
    }
    const rows = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm-.\'', '1234567890'];
    let first = true;
    for (const r of rows) for (const c of r) {
      const ch = this.upper ? c.toUpperCase() : c;
      add(this.o.layout === 'search' ? c.toUpperCase() : ch, () => this.type(this.o.layout === 'search' ? c : ch), '', first);
      first = false;
    }
    add('ESPACIO', () => this.type(' '), 'w3');
    add('BORRAR', () => this.del(), 'wide');
    if (this.o.layout !== 'search') add(this.upper ? 'minús.' : 'MAYÚS.', () => { this.upper = !this.upper; const k = Nav.cur && Nav.cur.textContent; this.build(); const again = $$('.key', this.keys).find(b => /MAY|min/.test(b.textContent)); if (again) Nav.focus(again); }, 'wide');
    add('LIMPIAR', () => this.set(''), 'wide');
    if (this.o.onDone) add('LISTO', () => this.done(), this.o.layout === 'search' ? 'w3' : '');
  }
  render() {
    clear(this.txt);
    const shown = this.o.secret && this.value.length > 6 ? this.value.slice(0, 4) + '•'.repeat(Math.min(20, this.value.length - 6)) + this.value.slice(-2) : this.value;
    if (shown) this.txt.appendChild(document.createTextNode(this.o.layout === 'search' ? shown.toUpperCase() : shown));
    else if (this.o.placeholder) this.txt.appendChild(h('span', { class: 'muted' }, this.o.placeholder));
    this.txt.appendChild(h('span', { class: 'cur' }, '_'));
  }
  set(v) { this.value = v; this.render(); if (this.o.onChange) this.o.onChange(this.value); }
  type(c) { if (this.value.length < 300) this.set(this.value + c); }
  del() { this.set(this.value.slice(0, -1)); }
  done() { if (this.o.onDone) this.o.onDone(this.value); }
  static active() {
    const scope = Nav.scope();
    for (const k of Keyboard.all) {
      if (!k.el.isConnected) { Keyboard.all.delete(k); continue; }
      if (scope.contains(k.el)) return k;
    }
    return null;
  }
}
Keyboard.all = new Set();

/* ===== Ventanas ===== */
const UI = {
  confirm(title, text, okLabel) {
    return new Promise(res => {
      let done = false;
      const finish = v => { if (done) return; done = true; Layers.close(layer); res(v); };
      const m = h('div', { class: 'modal' }, h('h2', null, title), h('p', null, text),
        h('div', { class: 'row-btns' },
          h('button', { class: 'btn pri', f: true, 'data-autofocus': '', onclick: () => finish(true) }, okLabel || 'Sí'),
          h('button', { class: 'btn', f: true, onclick: () => finish(false) }, 'Cancelar')));
      const layer = Layers.open(m, { onBack: () => finish(false) });
    });
  },

  prompt(o) {
    return new Promise(res => {
      let done = false;
      const finish = v => { if (done) return; done = true; Layers.close(layer); res(v); };
      const kb = new Keyboard({ value: o.value || '', layout: o.layout || 'text', secret: o.secret, placeholder: o.placeholder, onDone: v => finish(v) });
      const m = h('div', { class: 'modal', style: { width: '760px' } }, h('h2', null, o.title), o.text ? h('p', { class: 'muted' }, o.text) : null, kb.el,
        o.extra || null);
      const layer = Layers.open(m, { onBack: () => finish(null) });
    });
  },

  phonePanel(intro) {
    const url = Native.panelUrl();
    const qr = url ? Native.qr(url, 360) : '';
    const body = url
      ? h('div', { class: 'qrbox' }, qr ? h('img', { src: qr, alt: 'QR del panel' }) : null,
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '520px' } },
            h('p', null, intro || 'Escaneá el QR con el celular (tiene que estar en el mismo Wi-Fi que la TV).'),
            h('p', { class: 'muted' }, 'Desde ahí cargás las claves de API, escribís búsquedas y bajás o restaurás el respaldo de tu lista.'),
            h('div', { class: 'url' }, url)))
      : h('p', null, Native.available ? 'La TV no está conectada a una red Wi-Fi o cableada local. Conectala y volvé a intentar.' : 'El panel del celular funciona en la TV (en esta vista de prueba no está disponible).');
    const m = h('div', { class: 'modal' }, h('h2', null, 'Panel en el celular'), body,
      h('div', { class: 'row-btns' }, h('button', { class: 'btn pri', f: true, 'data-autofocus': '', onclick: () => Layers.close(layer) }, 'Cerrar')));
    const layer = Layers.open(m);
    return layer;
  },

  /** Puntuar con estrellas y escribir una nota */
  rate(item) {
    const cur = Lists.get(item.type, item.id) || { stars: 0, note: '' };
    let stars = cur.stars || 0, note = cur.note || '';
    const starEls = [1, 2, 3, 4, 5].map(n => h('button', { class: 'star f', tabindex: -1, onclick: () => { stars = n; paint(); } }, '★'));
    starEls.forEach(s => s.classList.add('f'));
    const noteEl = h('p', { class: 'muted' });
    const paint = () => {
      starEls.forEach((s, i) => s.classList.toggle('on', i < stars));
      noteEl.textContent = note ? '«' + note + '»' : 'Sin nota personal';
    };
    paint();
    if (stars) starEls[stars - 1].setAttribute('data-autofocus', '');
    else starEls[2].setAttribute('data-autofocus', '');
    const m = h('div', { class: 'modal' }, h('h2', null, 'Tu puntaje para «' + item.title + '»'),
      h('div', { class: 'starsel' }, starEls), noteEl,
      h('div', { class: 'row-btns' },
        h('button', { class: 'btn', f: true, onclick: async () => {
          const v = await UI.prompt({ title: 'Nota personal', value: note, layout: 'text', placeholder: 'Ej: verla con los chicos' });
          if (v != null) { note = v.trim(); paint(); }
        } }, 'Escribir nota'),
        h('button', { class: 'btn pri', f: true, onclick: () => { Lists.rate(item, stars, note); Layers.close(layer); toast(stars ? 'Guardado: ' + '★'.repeat(stars) : 'Guardado'); App.refreshDetail(); } }, 'Guardar'),
        h('button', { class: 'btn', f: true, onclick: () => Layers.close(layer) }, 'Cancelar')));
    const layer = Layers.open(m);
  }
};

/* ===== Salvapantallas ===== */
const Saver = {
  open: false, pool: [], layer: null, timer: null, idx: 0,
  add(item) {
    if (!item || !item.backdrop) return;
    if (this.pool.some(x => x.backdrop === item.backdrop)) return;
    this.pool.push({ title: item.title, year: item.year, backdrop: item.backdrop });
    if (this.pool.length > 60) this.pool.shift();
  },
  show() {
    if (this.open) return;
    this.open = true;
    Trailer.pauseAll();
    const clockEl = h('div', { class: 't' }, hhmm(new Date()));
    const titleEl = h('div', { class: 'tt' }, '');
    const imgs = h('div');
    this.layer = h('div', { class: 'layer saver' }, imgs,
      h('div', { class: 'rw' }, '◀◀ POR FAVOR REBOBINE'),
      h('div', { class: 'sclock' }, clockEl, titleEl));
    $('#layers').appendChild(this.layer);
    const pool = shuffle(this.pool);
    const step = () => {
      clockEl.textContent = hhmm(new Date());
      if (!pool.length) { titleEl.textContent = 'Rebobinar · videoclub'; return; }
      const it = pool[this.idx++ % pool.length];
      const img = h('img', { src: API.img(it.backdrop, 'w1280'), alt: '' });
      img.onload = () => { img.classList.add('show'); setTimeout(() => { $$('img', imgs).filter(x => x !== img).forEach(x => x.remove()); }, 2200); };
      imgs.appendChild(img);
      titleEl.textContent = it.title + (it.year ? ' (' + it.year + ')' : '');
    };
    step();
    this.timer = setInterval(step, 12000);
  },
  hide() {
    if (!this.open) return;
    this.open = false;
    clearInterval(this.timer);
    if (this.layer) this.layer.remove();
    this.layer = null;
    App.activity();
  }
};

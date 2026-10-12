/* Arranque, barra superior, historial de pantallas y reloj */
'use strict';

const NAV = [['Inicio', 'home'], ['Géneros', 'genres'], ['Estrenos', 'releases'], ['Buscar', 'search'],
  ['Mi lista', 'mylist'], ['¿Qué veo hoy?', 'roulette'], ['Ajustes', 'settings']];

const App = window.App = {
  stack: [],
  current: null,
  lastActivity: Date.now(),

  init() {
    this.applyLook();
    this.drawNav();
    setInterval(() => this.tick(), 20000);
    if (Settings.ready()) this.start();
    else this.go('setup', {}, { reset: true });
  },

  async start() {
    this.stack = [];
    try {
      const list = await API.loadProviders();
      if (!(Settings.get('providers') || []).length && list.length) Settings.set('providers', Platforms.defaultSelection(list));
    } catch (e) { }
    this.go('home', {}, { reset: true });
  },

  go(name, params, opts) {
    opts = opts || {};
    const top = this.stack[this.stack.length - 1];
    if (top && this.current) top.focus = Nav.cur && Nav.cur.getAttribute('data-k');
    if (opts.reset || name === 'home' || name === 'setup') this.stack = [];
    else if (NAV.some(n => n[1] === name)) this.stack = this.stack.filter(e => e.name === 'home').slice(0, 1);
    if (!this.stack.length && name !== 'home' && name !== 'setup' && Settings.ready()) this.stack.push({ name: 'home', params: {} });
    this.stack.push({ name, params: params || {} });
    this.render(null);
  },

  back() {
    if (this.stack.length > 1) {
      this.stack.pop();
      const top = this.stack[this.stack.length - 1];
      this.render(top.focus);
      return true;
    }
    return false;
  },

  reload() {
    const top = this.stack[this.stack.length - 1];
    if (!top) return;
    this.render(Nav.cur && Nav.cur.getAttribute('data-k'));
  },

  render(restoreKey) {
    Layers.closeAll();
    if (this.current && this.current.destroy) { try { this.current.destroy(); } catch (e) { console.error(e); } }
    const entry = this.stack[this.stack.length - 1];
    const def = Screens[entry.name];
    let scr;
    try { scr = def.render(entry.params); }
    catch (e) { console.error(e); scr = { el: emptyEl('Ups', 'Error al abrir la pantalla: ' + e.message) }; }
    scr.name = entry.name;
    scr.def = def;
    this.current = scr;
    const screen = clear($('#screen'));
    screen.appendChild(scr.el);
    $('#topnav').classList.toggle('hidden', !!def.hideNav);
    this.drawNav();

    if (!(restoreKey && Nav.restore(restoreKey, screen))) {
      if (!Nav.first(screen)) Nav.first($('#topnav'));
    }
    const auto = Nav.cur;
    if (scr.ready) {
      scr.ready.then(() => {
        if (this.current !== scr) return;
        const untouched = Nav.cur === auto || !Nav.cur || !Nav.cur.isConnected;
        if (!untouched) return;
        if (restoreKey && Nav.restore(restoreKey, screen)) return;
        Nav.first(screen) || Nav.first($('#topnav'));
      }).catch(() => { });
    }
  },

  drawNav() {
    const nav = clear($('#topnav'));
    nav.classList.add('mem');
    nav.appendChild(h('div', { class: 'logo' }, 'REBOBINAR'));
    const curName = this.current ? this.current.name : '';
    const active = (Screens[curName] || {}).nav;
    for (const [label, name] of NAV) {
      const on = active === label;
      const b = h('button', { class: 'navi' + (on ? ' on' : ''), f: true, 'data-k': 'nav-' + name, onclick: () => { if (this.current && this.current.name === name && this.stack.length <= 2) return; this.go(name, {}); } }, label);
      nav.appendChild(b);
      if (on) nav._last = b;
    }
    const mine = Settings.get('onlyMine');
    const n = (Settings.get('providers') || []).length;
    nav.appendChild(h('div', { class: 'right' },
      h('button', { class: 'minebtn' + (mine && n ? '' : ' off'), f: true, 'data-k': 'nav-mine', onclick: () => {
        if (!n) { this.go('settings', { sec: 'plats' }); return; }
        Settings.set('onlyMine', !Settings.get('onlyMine'));
        toast(Settings.get('onlyMine') ? 'Mostrando solo lo de tus plataformas' : 'Mostrando todo el catálogo');
        API.mem.clear();
        if (['home', 'genres', 'releases', 'roulette'].includes(curName)) this.reload(); else this.drawNav();
        Nav.restore('nav-mine', $('#topnav'));
      } }, mine && n ? 'MIS PLATAFORMAS ● ON' : 'TODAS LAS PLATAFORMAS'),
      h('div', { class: 'clock' }, hhmm(new Date()))));
    if (Nav.cur && !Nav.cur.isConnected && Nav.cur.getAttribute('data-k') && Nav.cur.getAttribute('data-k').startsWith('nav-')) Nav.restore(Nav.cur.getAttribute('data-k'), nav);
  },

  tick() {
    const c = $('#topnav .clock');
    if (c) c.textContent = hhmm(new Date());
    if (this.current && this.current.tick) this.current.tick();
    const mins = Number(Settings.get('saver'));
    if (mins && !Saver.open && !Trailer.playing && !Layers.top() && Date.now() - this.lastActivity > mins * 60000 && Settings.ready()) Saver.show();
  },

  activity() { this.lastActivity = Date.now(); },

  applyLook() {
    const b = document.body;
    b.className = 'theme-' + Settings.get('theme') + ' fx-' + Settings.get('fx') + ' size-' + Settings.get('posterSize');
  },

  refreshDetail() { if (this.current && this.current.refresh) this.current.refresh(); },

  /** Guarda una clave probándola antes */
  async saveKey(key, value, fromSetup) {
    toast('Probando la clave…', 8000);
    try {
      if (key === 'tmdbKey') await API.testTmdb(value); else await API.testOmdb(value);
    } catch (e) {
      toast(e.status === 0 ? 'Sin conexión: no pude probar la clave.' : 'Esa clave de ' + (key === 'tmdbKey' ? 'TMDB' : 'OMDb') + ' no funciona. Revisala.', 6000);
      return false;
    }
    const first = key === 'tmdbKey' && !Settings.get('tmdbKey');
    Settings.set(key, value);
    if (key === 'tmdbKey') { Settings.set('demo', false); API.mem.clear(); }
    toast('¡Clave de ' + (key === 'tmdbKey' ? 'TMDB' : 'OMDb') + ' guardada!');
    if (first || fromSetup) {
      try {
        const list = await API.loadProviders();
        if (!(Settings.get('providers') || []).length) Settings.set('providers', Platforms.defaultSelection(list));
      } catch (e) { }
      this.stack = [{ name: 'home', params: {} }];
      this.go('settings', { sec: 'plats' });
      toast('Marcá las plataformas que pagás y apretá ATRÁS para ir al inicio.', 6000);
    }
    return true;
  },

  async remoteKeys(o) {
    if (o.tmdb) await this.saveKey('tmdbKey', o.tmdb);
    if (o.omdb) await this.saveKey('omdbKey', o.omdb);
    if (this.current && this.current.name === 'settings') this.reload();
  }
};

window.addEventListener('load', () => App.init());
window.addEventListener('error', e => console.error('Error:', e.message));

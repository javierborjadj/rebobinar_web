/* Guardado local (en la TV) y puente con la parte nativa de Android */
'use strict';

const Native = (() => {
  const n = window.RebobinarNative;
  return {
    available: !!n,
    openApp(o) { try { return n ? n.openApp(JSON.stringify(o)) : 'none'; } catch (e) { return 'none'; } },
    installed(pkgs) { try { return n ? JSON.parse(n.installed(JSON.stringify(pkgs))) : []; } catch (e) { return []; } },
    openYouTube(key) {
      try { if (n) return n.openYouTube(key); } catch (e) { }
      window.open('https://www.youtube.com/watch?v=' + key, '_blank');
      return true;
    },
    qr(text, size) { try { return n ? n.qr(text, size || 300) : ''; } catch (e) { return ''; } },
    panelUrl() { try { return n ? n.panelUrl() : ''; } catch (e) { return ''; } },
    keepAwake(on) { try { n && n.keepAwake(!!on); } catch (e) { } },
    exit() { try { n && n.exitApp(); } catch (e) { } },
    version() { try { return n ? n.appVersion() : 'web'; } catch (e) { return '?'; } }
  };
})();

const LS = {
  get(k, def) {
    try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
  },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};

const DEFAULTS = {
  tmdbKey: '', omdbKey: '', demo: false,
  region: 'AR', lang: 'es-MX',
  providers: [], onlyMine: true,
  theme: 'neon', fx: 'scan', posterSize: 'm',
  trailerMode: 'auto', trailerDelay: 5, trailerSound: false,
  saver: 10, openMode: 'search', hideWatched: false, minRating: 0,
  memberName: 'Socio', memberSince: '', recentSearches: []
};

const Settings = {
  data: Object.assign({}, DEFAULTS, LS.get('rb.settings', {})),
  get(k) { return this.data[k]; },
  set(k, v) { this.data[k] = v; LS.set('rb.settings', this.data); },
  patch(o) { Object.assign(this.data, o); LS.set('rb.settings', this.data); },
  ready() { return !!(this.data.tmdbKey || this.data.demo); }
};
if (!Settings.data.memberSince) {
  const d = new Date();
  Settings.set('memberSince', String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear());
}

/** Mi lista: pendientes, vistas, favoritas, puntaje (1-5) y nota personal. */
const Lists = {
  data: LS.get('rb.lists', { items: {} }),
  key(type, id) { return type + ':' + id; },
  get(type, id) { return this.data.items[this.key(type, id)] || null; },
  save() { LS.set('rb.lists', this.data); },
  upsert(item) {
    const k = this.key(item.type, item.id);
    const cur = this.data.items[k] || { flags: {}, stars: 0, note: '' };
    const merged = Object.assign(cur, {
      type: item.type, id: item.id, title: item.title, year: item.year,
      poster: item.poster || cur.poster || null, runtime: item.runtime || cur.runtime || 0
    });
    this.data.items[k] = merged;
    return merged;
  },
  has(type, id, flag) { const it = this.get(type, id); return !!(it && it.flags[flag]); },
  toggle(item, flag) {
    const it = this.upsert(item);
    if (it.flags[flag]) delete it.flags[flag]; else it.flags[flag] = Date.now();
    if (flag === 'seen' && it.flags.seen) delete it.flags.pend;
    this.cleanup(it);
    this.save();
    return !!it.flags[flag];
  },
  rate(item, stars, note) {
    const it = this.upsert(item);
    it.stars = stars; it.note = note || '';
    if (stars && !it.flags.seen) { it.flags.seen = Date.now(); delete it.flags.pend; }
    this.save();
  },
  cleanup(it) {
    if (!Object.keys(it.flags).length && !it.stars && !it.note) delete this.data.items[this.key(it.type, it.id)];
  },
  list(flag) {
    return Object.values(this.data.items).filter(i => i.flags[flag]).sort((a, b) => b.flags[flag] - a.flags[flag]);
  },
  count(flag) { return this.list(flag).length; },
  seenSet() { const s = new Set(); for (const i of this.list('seen')) s.add(this.key(i.type, i.id)); return s; }
};

/* Respaldo (se usa desde el panel del celular) */
function exportBackup() {
  return JSON.stringify({ app: 'rebobinar', v: 1, at: new Date().toISOString(), lists: Lists.data,
    settings: Object.assign({}, Settings.data, { tmdbKey: undefined, omdbKey: undefined }) }, null, 1);
}
function importBackup(text) {
  try {
    const o = JSON.parse(text);
    if (!o || o.app !== 'rebobinar' || !o.lists || !o.lists.items) return 'el archivo no es un respaldo de Rebobinar';
    Lists.data = o.lists; Lists.save();
    if (o.settings) {
      const keep = { tmdbKey: Settings.data.tmdbKey, omdbKey: Settings.data.omdbKey };
      Settings.patch(Object.assign({}, o.settings, keep));
    }
    return 'ok';
  } catch (e) { return 'el contenido no es válido'; }
}

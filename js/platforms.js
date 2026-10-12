/* Plataformas: cómo reconocerlas (por nombre en TMDB) y qué app de Android TV abrir */
'use strict';

const PLATFORMS = [
  { key: 'netflix', name: 'Netflix', match: n => n.includes('netflix'), pkgs: ['com.netflix.ninja', 'com.netflix.mediaclient'] },
  { key: 'max', name: 'Max', match: n => n === 'max' || n.startsWith('max ') || n.includes('hbo'), pkgs: ['com.wbd.stream', 'com.hbo.hbonow'] },
  { key: 'disney', name: 'Disney+', match: n => n.includes('disney'), pkgs: ['com.disney.disneyplus'] },
  { key: 'prime', name: 'Prime Video', match: n => n.includes('prime video') || n === 'amazon video' || n.includes('amazon prime'), pkgs: ['com.amazon.amazonvideo.livingroom', 'com.amazon.avod.thirdpartyclient'] },
  { key: 'paramount', name: 'Paramount+', match: n => n.includes('paramount'), pkgs: ['com.cbs.ott', 'com.cbs.app'] },
  { key: 'apple', name: 'Apple TV', match: n => n.startsWith('apple tv'), pkgs: ['com.apple.atve.androidtv.appletv', 'com.apple.atve.sony.appletv'] },
  { key: 'mubi', name: 'MUBI', match: n => n.includes('mubi'), pkgs: ['com.mubi'] },
  { key: 'crunchyroll', name: 'Crunchyroll', match: n => n.includes('crunchyroll'), pkgs: ['com.crunchyroll.crunchyroid'] },
  { key: 'youtube', name: 'YouTube', match: n => n.startsWith('youtube'), pkgs: ['com.google.android.youtube.tv', 'com.google.android.youtube'] },
  { key: 'pluto', name: 'Pluto TV', match: n => n.includes('pluto'), pkgs: ['tv.pluto.android'] },
  { key: 'googleplay', name: 'Google Play', match: n => n.includes('google play'), pkgs: ['com.google.android.videos'] },
  { key: 'mercadoplay', name: 'Mercado Play', match: n => n.includes('mercado'), pkgs: [] },
  { key: 'flow', name: 'Flow', match: n => n === 'flow' || n.startsWith('flow '), pkgs: [] },
  { key: 'universal', name: 'Universal+', match: n => n.includes('universal'), pkgs: [] },
  { key: 'claro', name: 'Claro video', match: n => n.includes('claro'), pkgs: ['com.clarovideo.app.claro', 'com.dla.android'] }
];

const Platforms = {
  /** Lista de proveedores de TMDB para el país (se completa en api.js) */
  all: [],
  of(providerName) {
    const n = norm(providerName);
    return PLATFORMS.find(p => p.match(n)) || null;
  },
  /** Ids seleccionados, expandidos a variantes (ej. "Netflix basic with Ads") */
  selectedIds() {
    const sel = Settings.get('providers') || [];
    if (!sel.length) return [];
    const groups = new Set();
    const ids = new Set(sel);
    for (const p of this.all) {
      if (sel.includes(p.provider_id)) { const g = this.of(p.provider_name); if (g) groups.add(g.key); }
    }
    for (const p of this.all) {
      const g = this.of(p.provider_name);
      if (g && groups.has(g.key)) ids.add(p.provider_id);
    }
    return Array.from(ids);
  },
  isMine(providerId, providerName) {
    const sel = Settings.get('providers') || [];
    if (sel.includes(providerId)) return true;
    const g = this.of(providerName);
    if (!g) return false;
    return this.all.some(p => sel.includes(p.provider_id) && (this.of(p.provider_name) || {}).key === g.key);
  },
  /** Elige por defecto las plataformas más comunes en Argentina */
  defaultSelection(list) {
    const want = ['netflix', 'max', 'disney', 'prime', 'paramount', 'apple'];
    const out = [];
    for (const k of want) {
      const p = list.find(x => (this.of(x.provider_name) || {}).key === k);
      if (p) out.push(p.provider_id);
    }
    return out;
  },
  /** Abre la app de la plataforma. Devuelve un mensaje para mostrar. */
  open(providerName, title) {
    const g = this.of(providerName);
    const label = g ? g.name : providerName;
    if (!g || !g.pkgs.length) {
      return 'Abrí ' + label + ' desde el inicio de la TV y buscá «' + title + '».';
    }
    if (!Native.available) return 'En la TV se abriría ' + label + ' buscando «' + title + '».';
    const r = Native.openApp({ packages: g.pkgs, query: title, mode: Settings.get('openMode') });
    if (r === 'search') return 'Abriendo ' + label + ' con la búsqueda «' + title + '»…';
    if (r === 'app') return 'Abriendo ' + label + '… buscá «' + title + '».';
    if (r === 'store') return label + ' no está instalada: te abro la tienda.';
    return 'No encontré la app de ' + label + ' en esta TV.';
  }
};

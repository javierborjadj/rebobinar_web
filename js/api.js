/* Acceso a TMDB y OMDb, con caché para gastar pocas consultas */
'use strict';

class ApiError extends Error {
  constructor(msg, status) { super(msg); this.status = status; }
}

const API = {
  base: 'https://api.themoviedb.org/3',
  mem: new Map(),
  TTL: 30 * 60 * 1000,

  demo() { return !!Settings.get('demo') && !Settings.get('tmdbKey'); },

  async tmdb(path, params, opts) {
    params = params || {}; opts = opts || {};
    if (this.demo() && !opts.key) return Demo.tmdb(path, params);
    const key = (opts.key || Settings.get('tmdbKey') || '').trim();
    if (!key) throw new ApiError('Falta la clave de TMDB', 401);

    const q = new URLSearchParams();
    const all = Object.assign({ language: Settings.get('lang') }, params);
    Object.keys(all).sort().forEach(k => { const v = all[k]; if (v !== undefined && v !== null && v !== '') q.set(k, v); });
    const cacheKey = path + '?' + q.toString();

    if (!opts.fresh) {
      const m = this.mem.get(cacheKey);
      if (m && Date.now() - m.t < (opts.ttl || this.TTL)) return m.v;
      if (opts.persist) {
        const p = LS.get('rb.c.' + cacheKey, null);
        if (p && Date.now() - p.t < opts.persist) { this.mem.set(cacheKey, p); return p.v; }
      }
    }

    const headers = { accept: 'application/json' };
    if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
    else q.set('api_key', key);

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15000);
    let res;
    try {
      res = await fetch(this.base + path + '?' + q.toString(), { headers, signal: ctl.signal });
    } catch (e) {
      throw new ApiError('Sin conexión con TMDB', 0);
    } finally { clearTimeout(timer); }
    if (res.status === 401) throw new ApiError('La clave de TMDB no es válida', 401);
    if (res.status === 404) throw new ApiError('No encontrado', 404);
    if (!res.ok) throw new ApiError('TMDB respondió ' + res.status, res.status);
    const v = await res.json();
    const entry = { t: Date.now(), v };
    this.mem.set(cacheKey, entry);
    if (opts.persist) LS.set('rb.c.' + cacheKey, entry);
    return v;
  },

  img(path, size) { return path ? 'https://image.tmdb.org/t/p/' + (size || 'w342') + path : null; },

  /** Convierte un resultado de TMDB en un ítem común para la interfaz */
  item(r, type) {
    const t = r.media_type || type || (r.title !== undefined ? 'movie' : 'tv');
    const date = r.release_date || r.first_air_date || '';
    return {
      type: t, id: r.id, title: r.title || r.name || '', orig: r.original_title || r.original_name || '',
      date, year: yearOf(date), poster: r.poster_path || null, backdrop: r.backdrop_path || null,
      vote: r.vote_average || 0, votes: r.vote_count || 0, overview: r.overview || '', genres: r.genre_ids || []
    };
  },

  async testTmdb(key) {
    await this.tmdb('/genre/movie/list', {}, { key, fresh: true });
    return true;
  },

  async genres(type) {
    const r = await this.tmdb('/genre/' + type + '/list', {}, { persist: 7 * 864e5 });
    return (r.genres || []).slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  },

  /** Proveedores de streaming del país (películas y series juntos) */
  async loadProviders() {
    const region = Settings.get('region');
    const opts = { persist: 864e5 };
    const [m, t] = await Promise.all([
      this.tmdb('/watch/providers/movie', { watch_region: region }, opts).catch(() => ({ results: [] })),
      this.tmdb('/watch/providers/tv', { watch_region: region }, opts).catch(() => ({ results: [] }))
    ]);
    const byId = new Map();
    for (const p of (m.results || []).concat(t.results || [])) if (!byId.has(p.provider_id)) byId.set(p.provider_id, p);
    const prio = p => (p.display_priorities && p.display_priorities[region] != null) ? p.display_priorities[region] : (p.display_priority != null ? p.display_priority : 999);
    Platforms.all = Array.from(byId.values()).sort((a, b) => prio(a) - prio(b));
    return Platforms.all;
  },

  async providersFor(type, id) {
    const r = await this.tmdb('/' + type + '/' + id + '/watch/providers', {}, { ttl: 6 * 3600e3 });
    return (r.results || {})[Settings.get('region')] || null;
  },

  /** Notas de IMDb, Rotten Tomatoes y Metacritic */
  async omdb(imdbId) {
    if (!imdbId) return null;
    if (this.demo()) return Demo.omdb(imdbId);
    const key = (Settings.get('omdbKey') || '').trim();
    if (!key) return null;
    const ck = 'rb.omdb.' + imdbId;
    const c = LS.get(ck, null);
    if (c && Date.now() - c.t < 14 * 864e5) return c.v;
    try {
      const res = await fetch('https://www.omdbapi.com/?apikey=' + encodeURIComponent(key) + '&i=' + imdbId);
      const j = await res.json();
      if (j.Response !== 'True') return null;
      const out = { imdb: j.imdbRating && j.imdbRating !== 'N/A' ? j.imdbRating : null, rt: null, mc: null };
      for (const r of (j.Ratings || [])) {
        if (r.Source === 'Rotten Tomatoes') out.rt = r.Value;
        if (r.Source === 'Metacritic') out.mc = r.Value.split('/')[0];
      }
      if (!out.mc && j.Metascore && j.Metascore !== 'N/A') out.mc = j.Metascore;
      LS.set(ck, { t: Date.now(), v: out });
      return out;
    } catch (e) { return null; }
  },

  async testOmdb(key) {
    const res = await fetch('https://www.omdbapi.com/?apikey=' + encodeURIComponent(key) + '&i=tt0088763');
    const j = await res.json();
    if (j.Response !== 'True') throw new ApiError(j.Error || 'Clave inválida', 401);
    return true;
  }
};

/* ===== Consultas armadas ===== */
const Q = {
  mine() {
    if (!Settings.get('onlyMine')) return {};
    const ids = Platforms.selectedIds();
    if (!ids.length) return {};
    return { watch_region: Settings.get('region'), with_watch_providers: ids.join('|'), with_watch_monetization_types: 'flatrate|free|ads' };
  },
  base() {
    const p = { include_adult: false };
    const min = Settings.get('minRating');
    if (min) { p['vote_average.gte'] = min; p['vote_count.gte'] = 50; }
    return p;
  },
  /** Descubrir títulos; mine=false ignora el filtro de plataformas */
  async discover(type, params, mine) {
    const p = Object.assign({}, this.base(), mine === false ? {} : this.mine(), params);
    const r = await API.tmdb('/discover/' + type, p);
    return { page: r.page, total: Math.min(r.total_pages || 1, 500), items: this.clean((r.results || []).map(x => API.item(x, type))) };
  },
  async list(path, params, type) {
    const r = await API.tmdb(path, Object.assign({ region: Settings.get('region') }, params));
    return { page: r.page, total: Math.min(r.total_pages || 1, 500), items: this.clean((r.results || []).map(x => API.item(x, type))) };
  },
  clean(items) {
    let out = items.filter(i => i.type === 'movie' || i.type === 'tv');
    if (Settings.get('hideWatched')) {
      const seen = Lists.seenSet();
      out = out.filter(i => !seen.has(i.type + ':' + i.id));
    }
    return out;
  },
  dateKeys(type) {
    return type === 'movie' ? ['primary_release_date.gte', 'primary_release_date.lte'] : ['first_air_date.gte', 'first_air_date.lte'];
  },
  /** Parámetros por solapa de género: Clásicos, Décadas o Estrenos */
  shelf(type, mode, decade) {
    const [gte, lte] = this.dateKeys(type);
    if (mode === 'classic') {
      return { [lte]: yearsAgo(type === 'movie' ? 25 : 15), 'vote_count.gte': type === 'movie' ? 800 : 300, sort_by: 'vote_average.desc' };
    }
    if (mode === 'decade') {
      const end = Math.min(decade + 9, new Date().getFullYear());
      return { [gte]: decade + '-01-01', [lte]: end + '-12-31', 'vote_count.gte': type === 'movie' ? 150 : 60, sort_by: 'vote_count.desc' };
    }
    return { [gte]: daysFromNow(-150), [lte]: daysFromNow(0), sort_by: 'popularity.desc' };
  }
};

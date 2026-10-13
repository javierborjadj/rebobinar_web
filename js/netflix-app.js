const DEFAULT_PLATFORMS = [
  { provider_id: 8, provider_name: 'Netflix', logo_path: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
  { provider_id: 119, provider_name: 'Amazon Prime Video', logo_path: '/dQeAar5H991VYporEjUspolDarG.jpg' },
  { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/97yvRBw1GzX7fXprcF80er19ot.jpg' },
  { provider_id: 1899, provider_name: 'Max', logo_path: '/fksCUZ9QDWZMUwL2LgMtLckROUN.jpg' },
  { provider_id: 531, provider_name: 'Paramount Plus', logo_path: '/h5DcR0J2EESLitnhR8xLG1QymTE.jpg' },
  { provider_id: 350, provider_name: 'Apple TV Plus', logo_path: '/2E03IAZsX4ZaUqM7tXlctEPMGWS.jpg' },
  { provider_id: 339, provider_name: 'MovistarTV', logo_path: '/f6TRLB3H4jDpFEZ0z2KWSSvu1SB.jpg' },
  { provider_id: 619, provider_name: 'Mercado Play', logo_path: '/adO1535eaO2c1793c1k5c7U31F4.jpg' },
  { provider_id: 300, provider_name: 'Pluto TV', logo_path: '/dB8G41Q6tSL5NBisrIeqByfepBc.jpg' },
  { provider_id: 457, provider_name: 'VIX', logo_path: '/jwRPknT20dfU1GeVqbcDXFyvtdG.jpg' },
  { provider_id: 283, provider_name: 'Crunchyroll', logo_path: '/mXeC4TrcgdU6ltE9bCBCEORwSQR.jpg' },
  { provider_id: 11, provider_name: 'MUBI', logo_path: '/bVR4Z1LCHY7gidXAJF5pMa4QrDS.jpg' },
  { provider_id: 167, provider_name: 'Claro video', logo_path: '/21M5CpiOYGOhHj2sVPXqwt61XqG.jpg' },
  { provider_id: 546, provider_name: 'Flow', logo_path: '/l9BR81Z4K4636p4N0R02Y96S3d.jpg' }
];

const OSCAR_WINNERS_BY_YEAR = [
  { year: 2025, id: 1064213, title: 'Anora' },
  { year: 2024, id: 872585, title: 'Oppenheimer' },
  { year: 2023, id: 545611, title: 'Todo en todas partes al mismo tiempo' },
  { year: 2022, id: 776503, title: 'CODA' },
  { year: 2021, id: 581734, title: 'Nomadland' },
  { year: 2020, id: 496243, title: 'Parásitos' },
  { year: 2019, id: 490132, title: 'Green Book' },
  { year: 2018, id: 399055, title: 'La forma del agua' },
  { year: 2017, id: 376867, title: 'Luz de luna' },
  { year: 2016, id: 314365, title: 'En primera plana' },
  { year: 2015, id: 194662, title: 'Birdman' },
  { year: 2014, id: 76203, title: '12 años de esclavitud' },
  { year: 2013, id: 68734, title: 'Argo' },
  { year: 2012, id: 74643, title: 'El artista' },
  { year: 2011, id: 45269, title: 'El discurso del rey' },
  { year: 2010, id: 12162, title: 'Vivir al límite' },
  { year: 2009, id: 12405, title: '¿Quién quiere ser millonario?' },
  { year: 2008, id: 6977, title: 'Sin lugar para los débiles' },
  { year: 2007, id: 1422, title: 'Los infiltrados' },
  { year: 2006, id: 1640, title: 'Vidas cruzadas' },
  { year: 2005, id: 70, title: 'Million Dollar Baby' },
  { year: 2004, id: 122, title: 'El Señor de los Anillos: El retorno del Rey' },
  { year: 2003, id: 1574, title: 'Chicago' },
  { year: 2002, id: 453, title: 'Una mente brillante' },
  { year: 2001, id: 98, title: 'Gladiador' },
  { year: 2000, id: 14, title: 'Belleza americana' },
  { year: 1999, id: 1934, title: 'Shakespeare apasionado' },
  { year: 1998, id: 597, title: 'Titanic' },
  { year: 1997, id: 409, title: 'El paciente inglés' },
  { year: 1996, id: 197, title: 'Corazón valiente' },
  { year: 1995, id: 13, title: 'Forrest Gump' },
  { year: 1994, id: 424, title: 'La lista de Schindler' },
  { year: 1993, id: 33, title: 'Los imperdonables' },
  { year: 1992, id: 274, title: 'El silencio de los inocentes' },
  { year: 1991, id: 581, title: 'Danza con lobos' },
  { year: 1990, id: 403, title: 'Conduciendo a Miss Daisy' },
  { year: 1989, id: 380, title: 'Rain Man' },
  { year: 1988, id: 746, title: 'El último emperador' },
  { year: 1980, id: 12102, title: 'Kramer vs. Kramer' },
  { year: 1975, id: 240, title: 'El Padrino Parte II' },
  { year: 1973, id: 238, title: 'El Padrino' },
  { year: 1944, id: 289, title: 'Casablanca' }
];

const App = {
  apiKey: '',
  omdbKey: '',
  region: 'AR',
  allRegionPlatforms: [...DEFAULT_PLATFORMS],
  myPlatforms: [8, 119, 337, 1899, 531, 350, 339, 619, 300, 457, 283, 11, 167, 546],
  myList: [],
  providerCache: {},
  heroCandidates: [],
  currentView: 'home',
  currentDecade: 'all',

  async init() {
    this.loadSavedConfig();
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('navbar');
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    });

    if (!this.apiKey) {
      this.openSettings('apis');
    } else {
      await this.loadAllRegionProviders(this.region);
      this.navigate('home');
    }
  },

  loadSavedConfig() {
    this.apiKey = (localStorage.getItem('rebobinar_tmdb_key') || localStorage.getItem('tmdb_api_key') || '').trim();
    if (!this.apiKey) {
      for (let i = 0; i < localStorage.length; i++) {
        const val = localStorage.getItem(localStorage.key(i)) || '';
        const m = val.match(/[a-f0-9]{32}/i);
        if (m) { this.apiKey = m[0]; break; }
      }
    }
    this.omdbKey = (localStorage.getItem('rebobinar_omdb_key') || '').trim();
    this.region = localStorage.getItem('rebobinar_region') || 'AR';
    const savedPlats = localStorage.getItem('rebobinar_platforms');
    if (savedPlats) {
      try { this.myPlatforms = JSON.parse(savedPlats); } catch (e) {}
    }
    const savedList = localStorage.getItem('rebobinar_mylist');
    if (savedList) {
      try { this.myList = JSON.parse(savedList); } catch (e) {}
    }
    this.updatePlatCountBadge();
  },

  formatDate(d) {
    return d.toISOString().split('T')[0];
  },

  getDatesForFilter(filterKey, decade = 'all') {
    if (decade && decade !== 'all') {
      if (decade === 'classic') return { gte: '1920-01-01', lte: '1969-12-31' };
      const startYear = Number(decade);
      return { gte: `${startYear}-01-01`, lte: `${startYear + 9}-12-31` };
    }

    // Si es 'all', devolvemos rango amplio para que no traiga vacío
    if (filterKey === 'streaming' || filterKey === 'new_releases') {
      const today = new Date();
      const from = new Date();
      from.setMonth(today.getMonth() - 2);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }

    const today = new Date();
    const from = new Date();
    const to = new Date();

    if (filterKey === 'streaming') {
      // Últimos 2 meses para Nuevas en Streaming
      from.setMonth(today.getMonth() - 2);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }
    if (filterKey === 'popular_home') {
      from.setDate(today.getDate() - 14);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }
    if (filterKey === 'new_releases') {
      from.setMonth(today.getMonth() - 2);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }
    if (filterKey === 'theatres') {
      from.setDate(today.getDate() - 30);
      to.setMonth(today.getMonth() + 2);
      return { gte: this.formatDate(from), lte: this.formatDate(to) };
    }
    if (filterKey === 'upcoming') {
      to.setMonth(today.getMonth() + 6);
      return { gte: this.formatDate(today), lte: this.formatDate(to) };
    }
    if (['netflix', 'prime', 'disney', 'new_series'].includes(filterKey)) {
      from.setMonth(today.getMonth() - 2);
      to.setMonth(today.getMonth() + 1);
      return { gte: this.formatDate(from), lte: this.formatDate(to) };
    }
    if (filterKey === 'popular') {
      from.setMonth(today.getMonth() - 6);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }
    return { gte: '', lte: '' };
  },

  async fetchTMDB(endpoint, params = {}) {
    if (!this.apiKey) return null;
    const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
    url.searchParams.set('language', 'es-MX');
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const headers = {};
    if (this.apiKey.startsWith('eyJ')) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else {
      url.searchParams.set('api_key', this.apiKey);
    }

    try {
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  async testTmdbApi() {
    const statusEl = document.getElementById('tmdbTestStatus');
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) { statusEl.style.color = '#ff5252'; statusEl.textContent = '⚠️ Ingresá una clave de TMDB.'; return; }
    statusEl.style.color = '#f5c518'; statusEl.textContent = 'Probando conexión con TMDB...';
    const url = new URL('https://api.themoviedb.org/3/configuration');
    const headers = {};
    if (key.startsWith('eyJ')) headers['Authorization'] = `Bearer ${key}`;
    else url.searchParams.set('api_key', key);
    try {
      const res = await fetch(url.toString(), { headers });
      if (res.ok) {
        statusEl.style.color = '#46d369';
        statusEl.textContent = '✓ ¡Conexión exitosa!';
      } else {
        statusEl.style.color = '#ff5252';
        statusEl.textContent = `✕ Clave inválida (${res.status}).`;
      }
    } catch (e) {
      statusEl.style.color = '#ff5252';
      statusEl.textContent = '✕ Error de red.';
    }
  },

  async testOmdbApi() {
    const statusEl = document.getElementById('omdbTestStatus');
    const key = document.getElementById('omdbKeyInput').value.trim();
    if (!key) { statusEl.style.color = '#ff5252'; statusEl.textContent = '⚠️ Ingresá una clave de OMDb.'; return; }
    statusEl.style.color = '#f5c518'; statusEl.textContent = 'Probando conexión con OMDb...';
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=tt0111161&apikey=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (res.ok && data && data.Response === 'True') {
        statusEl.style.color = '#46d369';
        statusEl.textContent = `✓ ¡Conexión exitosa! (${data.Title})`;
      } else {
        statusEl.style.color = '#ff5252';
        statusEl.textContent = `✕ Clave OMDb inválida.`;
      }
    } catch (e) {
      statusEl.style.color = '#ff5252';
      statusEl.textContent = '✕ Error de red.';
    }
  },

  async loadAllRegionProviders(regionCode = this.region) {
    if (!this.apiKey) {
      this.renderPlatformsCheckboxes(DEFAULT_PLATFORMS);
      return;
    }
    const [movProv, tvProv] = await Promise.all([
      this.fetchTMDB('/watch/providers/movie', { watch_region: regionCode }),
      this.fetchTMDB('/watch/providers/tv', { watch_region: regionCode })
    ]);
    const combined = [...(movProv?.results || []), ...(tvProv?.results || []), ...DEFAULT_PLATFORMS];
    const map = new Map();
    for (const p of combined) { if (!map.has(p.provider_id)) map.set(p.provider_id, p); }
    this.allRegionPlatforms = Array.from(map.values()).sort((a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999));
    this.renderPlatformsCheckboxes(this.allRegionPlatforms);
  },

  renderPlatformsCheckboxes(list) {
    const grid = document.getElementById('platformsSelector');
    if (!grid) return;
    grid.innerHTML = list.map(p => {
      const checked = this.myPlatforms.includes(p.provider_id) ? 'checked' : '';
      const logo = p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '';
      return `
        <label class="platform-check" data-name="${p.provider_name.toLowerCase()}">
          <input type="checkbox" value="${p.provider_id}" ${checked} onchange="App.onPlatformCheckChange()" />
          ${logo ? `<img src="${logo}" alt="${p.provider_name}" loading="lazy" />` : ''}
          <span>${p.provider_name}</span>
        </label>
      `;
    }).join('');
    this.updatePlatCountBadge();
  },

  onPlatformCheckChange() {
    const checks = Array.from(document.querySelectorAll('#platformsSelector input:checked')).map(c => Number(c.value));
    const badge = document.getElementById('platCountBadge');
    if (badge) badge.textContent = checks.length;
  },

  updatePlatCountBadge() {
    const badge = document.getElementById('platCountBadge');
    if (badge) badge.textContent = this.myPlatforms.length;
  },

  filterPlatformsList(q) {
    const term = q.trim().toLowerCase();
    document.querySelectorAll('#platformsSelector .platform-check').forEach(el => {
      el.style.display = el.dataset.name.includes(term) ? 'flex' : 'none';
    });
  },

  toggleAllPlatforms(selectAll) {
    document.querySelectorAll('#platformsSelector input[type="checkbox"]').forEach(cb => {
      if (cb.parentElement.style.display !== 'none') cb.checked = selectAll;
    });
    this.onPlatformCheckChange();
  },

  async getProviders(mediaType, id) {
    const key = `${mediaType}_${id}_${this.region}`;
    if (this.providerCache[key]) return this.providerCache[key];

    const data = await this.fetchTMDB(`/${mediaType}/${id}/watch/providers`);
    const countryData = data?.results?.[this.region] || {};
    const all = [
      ...(countryData.flatrate || []),
      ...(countryData.free || []),
      ...(countryData.ads || [])
    ];
    const unique = [];
    const seen = new Set();
    for (const p of all) {
      if (!seen.has(p.provider_id)) {
        seen.add(p.provider_id);
        unique.push(p);
      }
    }
    this.providerCache[key] = unique;
    return unique;
  },

  async navigate(view) {
    this.currentView = view;
    this.currentDecade = 'all';
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === view);
    });

    const hero = document.getElementById('heroBanner');
    const container = document.getElementById('catalogContainer');
    document.getElementById('detailViewContainer').classList.add('hidden');
    container.innerHTML = '<div style="padding:40px 0; color:#999;">Cargando catálogo...</div>';

    if (view === 'home') {
      hero.classList.remove('hidden');
      container.style.paddingTop = '10px';
      await this.renderHome();
    } else {
      hero.classList.add('hidden');
      container.style.paddingTop = '90px';
      if (view === 'today') await this.renderWhatToWatchToday();
      if (view === 'movies') await this.renderCatalogSection('movie', 'streaming', 'all');
      if (view === 'tv') await this.renderCatalogSection('tv', 'streaming', 'all');
      if (view === 'genres') await this.renderGenresSection('movie', 28);
      if (view === 'oscars') await this.renderOscars('all');
      if (view === 'top100') await this.renderTop100('imdb');
      if (view === 'kids') await this.renderCatalogSection('kids', 'streaming', 'all');
      if (view === 'mylist') await this.renderMyList();
    }
  },

  pickRandomHero() {
    if (!this.heroCandidates || this.heroCandidates.length === 0) return;
    const pool = this.heroCandidates.filter(x => x.backdrop_path);
    const list = pool.length > 0 ? pool : this.heroCandidates;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    this.updateHero(randomItem, randomItem.media_type || (randomItem.first_air_date ? 'tv' : 'movie'));
  },

  async updateHero(item, mediaType = 'movie') {
    if (!item) return;
    const backdrop = item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    document.getElementById('heroBackdrop').style.backgroundImage = `url('${backdrop}')`;
    document.getElementById('heroTitle').textContent = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const score = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    document.getElementById('heroMeta').innerHTML = `<span>${year}</span> <span>★ ${score} TMDB</span>`;
    document.getElementById('heroDesc').textContent = item.overview || 'Sin descripción disponible.';

    const providers = await this.getProviders(mediaType, item.id);
    const provContainer = document.getElementById('heroProviders');
    if (providers.length > 0) {
      provContainer.innerHTML = providers.slice(0, 5).map(p => `
        <span class="provider-pill">
          <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}" />
          ${p.provider_name}
        </span>
      `).join('');
    } else {
      provContainer.innerHTML = `<span class="provider-pill" style="color:#aaa;">No disponible en streaming</span>`;
    }

    document.getElementById('heroButtons').innerHTML = `
      <button class="btn-play" onclick="App.openDetail('${mediaType}', ${item.id})">▶ Ver Ficha</button>
      <button class="btn-info" onclick="App.pickRandomHero()" title="Cambiar título destacado">🔀 Otro destacado</button>
    `;
  },

  async renderHome() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      ${this.myList.length > 0 ? `
        <section class="row-section">
          <div class="row-header"><h2 class="row-title">📌 Mi Lista</h2></div>
          <div class="row-scroller" id="rowHomeMyList"></div>
        </section>
      ` : ''}

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">🎥 Últimos Tráilers</h2></div>
        <div class="row-scroller" id="rowTrailers"></div>
      </section>

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">✨ Nuevas incorporaciones</h2></div>
        <div class="row-scroller" id="rowNewReleases"></div>
      </section>

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">👁️ Más vistas del día</h2></div>
        <div class="row-scroller" id="rowMostWatched"></div>
      </section>

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">🎬 Tendencias en Películas</h2></div>
        <div class="row-scroller" id="rowTrendingMovies"></div>
      </section>

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">📺 Tendencias en Series</h2></div>
        <div class="row-scroller" id="rowTrendingTV"></div>
      </section>

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">🍿 Lo más popular</h2></div>
        <div class="row-scroller" id="rowPopular"></div>
      </section>

      <section class="row-section">
        <div class="row-header"><h2 class="row-title">🆓 Ver gratis</h2></div>
        <div class="row-scroller" id="rowFree"></div>
      </section>
    `;

    if (this.myList.length > 0) this.populatePosterRow('rowHomeMyList', this.myList, false, false);
    this.loadLatestTrailersRow();
    this.loadNewReleasesRow('movie');
    this.loadMostWatchedDay();
    this.loadTrendingStreaming('movie', 'day');
    this.loadTrendingStreaming('tv', 'day');
    this.loadPopularRow();
    this.loadFreeRow('movie');
  },

  async loadMostWatchedDay() {
    const data = await this.fetchTMDB('/trending/all/day');
    const items = data?.results || [];
    if (items.length > 0) {
      this.heroCandidates = items;
      this.pickRandomHero();
    }
    this.populatePosterRow('rowMostWatched', items.slice(0, 16), true, false);
  },

  async loadTrendingStreaming(mediaType, timeWindow) {
    const data = await this.fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
    const items = (data?.results || []).map(x => ({ ...x, media_type: mediaType }));
    const rowId = mediaType === 'movie' ? 'rowTrendingMovies' : 'rowTrendingTV';
    this.populatePosterRow(rowId, items, false, false);
  },

  async loadNewReleasesRow(mediaType) {
    const dates = this.getDatesForFilter('new_releases');
    const params = {
      sort_by: 'popularity.desc',
      watch_region: this.region,
      with_watch_monetization_types: 'flatrate',
      'primary_release_date.gte': dates.gte,
      'primary_release_date.lte': dates.lte
    };
    const data = await this.fetchTMDB('/discover/movie', params);
    const items = (data?.results || []).map(x => ({ ...x, media_type: 'movie' }));
    this.populatePosterRow('rowNewReleases', items, false, false);
  },

  async loadPopularRow() {
    const weekDates = this.getDatesForFilter('popular_home');
    let data = await this.fetchTMDB('/discover/movie', {
      sort_by: 'popularity.desc',
      watch_region: this.region,
      with_watch_monetization_types: 'flatrate',
      'primary_release_date.gte': weekDates.gte,
      'primary_release_date.lte': weekDates.lte
    });
    this.populatePosterRow('rowPopular', data?.results || [], false, false);
  },

  async loadFreeRow(mediaType) {
    const data = await this.fetchTMDB(`/discover/${mediaType}`, {
      sort_by: 'popularity.desc',
      watch_region: this.region,
      with_watch_monetization_types: 'free|ads'
    });
    const items = (data?.results || []).map(x => ({ ...x, media_type: mediaType }));
    this.populatePosterRow('rowFree', items, false, false);
  },

  async loadLatestTrailersRow() {
    const dates = this.getDatesForFilter('new_releases');
    const data = await this.fetchTMDB('/discover/movie', {
      sort_by: 'popularity.desc',
      'primary_release_date.gte': dates.gte,
      'primary_release_date.lte': dates.lte
    });
    const row = document.getElementById('rowTrailers');
    if (!row) return;
    const movies = (data?.results || []).slice(0, 12);
    row.innerHTML = movies.map(m => {
      const bg = m.backdrop_path ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}` : '';
      return `
        <div class="trailer-card" onclick="App.openDetail('movie', ${m.id})">
          <div class="trailer-thumb" style="background-image:url('${bg}')">
            <div class="play-circle">▶</div>
          </div>
          <div class="poster-info">
            <div class="poster-title">${m.title}</div>
            <div class="poster-sub"><span>🔊 Tráiler</span></div>
          </div>
        </div>
      `;
    }).join('');
  },

  async renderWhatToWatchToday() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <div class="today-recommender-box">
        <h2 class="row-title">🎲 ¿Qué puedo ver hoy?</h2>
        <div class="today-controls-grid">
          <div>
            <label class="field-label">Formato</label>
            <select id="todayType" class="web-input"><option value="movie">🎬 Películas</option><option value="tv">📺 Series</option></select>
          </div>
          <div>
            <label class="field-label">Género</label>
            <select id="todayMood" class="web-input">
              <option value="">Cualquier género</option>
              <option value="28,12">🔥 Acción</option>
              <option value="35">😂 Comedia</option>
              <option value="53,9648">🕵️ Suspenso</option>
              <option value="878,14">🚀 Ciencia Ficción</option>
              <option value="18">🎭 Drama</option>
              <option value="27">👻 Terror</option>
            </select>
          </div>
          <div>
            <label class="field-label">Puntaje</label>
            <select id="todayRating" class="web-input"><option value="7.0">★ +7.0</option><option value="7.8">★ +7.8</option><option value="6.0">★ +6.0</option></select>
          </div>
          <div>
            <button class="btn-primary" style="width:100%; height:42px; margin-top:22px;" onclick="App.runTodaySearch(true)">🎲 Sortear</button>
          </div>
        </div>
      </div>
      <div class="media-grid" id="gridToday"></div>
    `;
    await this.runTodaySearch(false);
  },

  async runTodaySearch(shuffle = false) {
    const type = document.getElementById('todayType')?.value || 'movie';
    const mood = document.getElementById('todayMood')?.value || '';
    const rating = document.getElementById('todayRating')?.value || '7.0';
    const params = { watch_region: this.region, sort_by: 'popularity.desc', 'vote_average.gte': rating, 'vote_count.gte': 100, with_watch_monetization_types: 'flatrate|free|ads' };
    if (mood) params.with_genres = mood.replace(',', '|');
    const data = await this.fetchTMDB(`/discover/${type}`, params);
    let items = (data?.results || []).map(x => ({ ...x, media_type: type }));
    if (shuffle) items = items.sort(() => Math.random() - 0.5);
    this.populatePosterRow('gridToday', items, false, false);
  },

  async renderCatalogSection(sectionType, activeFilter = 'streaming', decade = this.currentDecade, customDates = null) {
    this.currentDecade = decade;
    const isTV = sectionType === 'tv' || activeFilter === 'kids_tv';
    const isKids = sectionType === 'kids';
    const endpoint = isTV ? '/discover/tv' : '/discover/movie';

    const filters = isKids ? [
      { key: 'streaming', label: 'Nuevas en Streaming' },
      { key: 'popular', label: 'Populares' },
      { key: 'netflix', label: 'Netflix' },
      { key: 'prime', label: 'Prime Video' },
      { key: 'disney', label: 'Disney+' },
      { key: 'top_rated', label: 'Mejor Valoradas' },
      { key: 'acclaimed', label: 'Aclamadas' },
      { key: 'gems', label: 'Joyas Ocultas' },
      { key: 'free', label: 'Ver Gratis' },
      { key: 'kids_tv', label: 'Series Infantiles' }
    ] : [
      { key: 'streaming', label: 'Nuevas en Streaming' },
      { key: 'popular', label: 'Populares' },
      { key: 'top_rated', label: 'Mejor Valoradas' },
      { key: 'acclaimed', label: 'Aclamadas' },
      { key: 'gems', label: 'Joyas Ocultas' },
      { key: 'free', label: 'Ver Gratis' },
      { key: 'netflix', label: 'Netflix' },
      { key: 'prime', label: 'Prime Video' },
      { key: 'disney', label: 'Disney+' }
    ];

    const decades = [
      { key: 'all', label: 'Todas' }, { key: '2020', label: '2020s' }, { key: '2010', label: '2010s' },
      { key: '2000', label: '2000s' }, { key: '1990', label: '90s' }, { key: '1980', label: '80s' }
    ];

    const preset = customDates || this.getDatesForFilter(activeFilter, decade);
    const params = { watch_region: this.region, sort_by: 'popularity.desc' };
    if (preset.gte) params[isTV ? 'first_air_date.gte' : 'primary_release_date.gte'] = preset.gte;
    if (preset.lte) params[isTV ? 'first_air_date.lte' : 'primary_release_date.lte'] = preset.lte;
    
    if (isKids) {
      if (activeFilter === 'kids_tv') {
        params.with_genres = '10762';
      } else {
        params.with_genres = '16,10751';
      }
    }

    if (activeFilter === 'netflix') params.with_watch_providers = '8';
    else if (activeFilter === 'prime') params.with_watch_providers = '119';
    else if (activeFilter === 'disney') params.with_watch_providers = '337';
    else if (activeFilter === 'free') params.with_watch_monetization_types = 'free|ads';
    else if (activeFilter === 'top_rated') { params.sort_by = 'vote_average.desc'; params['vote_count.gte'] = 200; }
    else if (activeFilter === 'streaming') { params.with_watch_monetization_types = 'flatrate'; }

    const [p1, p2] = await Promise.all([
      this.fetchTMDB(isKids && activeFilter === 'kids_tv' ? '/discover/tv' : endpoint, { ...params, page: 1 }),
      this.fetchTMDB(isKids && activeFilter === 'kids_tv' ? '/discover/tv' : endpoint, { ...params, page: 2 })
    ]);
    let items = [...(p1?.results || []), ...(p2?.results || [])].map(i => ({ ...i, media_type: isKids && activeFilter === 'kids_tv' ? 'tv' : (isTV ? 'tv' : 'movie') }));

    const titleMap = { movie: '🎥 Películas', tv: '📺 Series de TV', kids: '🎈 Infantiles y Familia' };
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">${titleMap[sectionType]}</h2>
      <div class="filter-chips-bar">
        ${filters.map(f => `<button class="filter-chip ${f.key === activeFilter ? 'active' : ''}" onclick="App.renderCatalogSection('${sectionType}', '${f.key}', '${decade}')">${f.label}</button>`).join('')}
      </div>
      <div class="decade-chips-bar">
        <span class="decade-label">Década:</span>
        ${decades.map(d => `<button class="decade-chip ${d.key === decade ? 'active' : ''}" onclick="App.renderCatalogSection('${sectionType}', '${activeFilter}', '${d.key}')">${d.label}</button>`).join('')}
      </div>
      <div class="media-grid" id="gridCatalog"></div>
    `;
    this.populatePosterRow('gridCatalog', items, false, false);
  },

  async renderGenresSection(mediaType = 'movie', selectedGenreId = null) {
    const genreData = await this.fetchTMDB(`/genre/${mediaType}/list`);
    const genres = genreData?.genres || [];
    const activeGenre = selectedGenreId || (genres[0]?.id ?? 28);
    const data = await this.fetchTMDB(`/discover/${mediaType}`, { with_genres: activeGenre, watch_region: this.region, with_watch_monetization_types: 'flatrate|free|ads', sort_by: 'popularity.desc', page: 1 });
    const items = (data?.results || []).map(x => ({ ...x, media_type: mediaType }));

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <div class="row-header"><h2 class="row-title">🎭 Explorar por Géneros</h2></div>
      <div class="filter-chips-bar">
        ${genres.map(g => `<button class="filter-chip ${g.id === activeGenre ? 'active' : ''}" onclick="App.renderGenresSection('${mediaType}', ${g.id})">${g.name}</button>`).join('')}
      </div>
      <div class="media-grid" id="gridGenres"></div>
    `;
    this.populatePosterRow('gridGenres', items, false, false);
  },

  async renderOscars(decadeFilter = 'all') {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `<h2 class="row-title">🏆 Premios Óscar — Mejor Película</h2><div class="media-grid" id="gridOscars"></div>`;
    const results = await Promise.all(OSCAR_WINNERS_BY_YEAR.map(async e => {
      const m = await this.fetchTMDB(`/movie/${e.id}`);
      return m ? { ...m, oscarYear: e.year, media_type: 'movie' } : null;
    }));
    this.populatePosterRow('gridOscars', results.filter(Boolean), false, false);
  },

  async renderTop100(mode = 'imdb') {
    const tabs = [
      { key: 'imdb', label: '⭐ Top 100 IMDb' },
      { key: 'tmdb', label: '🔥 Top 100 TMDB' },
      { key: 'tomatoes', label: '🍅 Top 100 Rotten Tomatoes' }
    ];

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">⭐ Top 100 Mejores Películas</h2>
      <div class="filter-chips-bar">
        ${tabs.map(t => `<button class="filter-chip ${t.key === mode ? 'active' : ''}" onclick="App.renderTop100('${t.key}')">${t.label}</button>`).join('')}
      </div>
      <div class="media-grid" id="gridTop100"></div>
    `;

    let pages = [];
    if (mode === 'imdb') {
      pages = await Promise.all([1, 2, 3, 4, 5].map(page => this.fetchTMDB('/discover/movie', { sort_by: 'vote_average.desc', 'vote_count.gte': 12000, page })));
    } else if (mode === 'tmdb') {
      pages = await Promise.all([1, 2, 3, 4, 5].map(page => this.fetchTMDB('/movie/top_rated', { page })));
    } else if (mode === 'tomatoes') {
      pages = await Promise.all([1, 2, 3, 4, 5].map(page => this.fetchTMDB('/discover/movie', { sort_by: 'vote_average.desc', 'vote_count.gte': 2500, 'vote_count.lte': 15000, 'vote_average.gte': 7.9, page })));
    }
    const all100 = pages.flatMap(p => p?.results || []).slice(0, 100);
    this.populatePosterRow('gridTop100', all100, true, false);
  },

  async populatePosterRow(containerId, items, showRank = false, requireStreaming = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let processedItems = items;
    if (requireStreaming) {
      const verified = await Promise.all(items.map(async item => {
        const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const provs = await this.getProviders(mType, item.id);
        return provs.length > 0 ? item : null;
      }));
      processedItems = verified.filter(Boolean);
    }

    if (processedItems.length === 0) {
      container.innerHTML = '<p style="color:#888; font-size:14px; padding:10px;">No hay títulos disponibles.</p>';
      return;
    }

    container.innerHTML = processedItems.map((item, idx) => {
      const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const cardId = `card_${containerId}_${mType}_${item.id}_${idx}`;
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '';
      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const score = item.vote_average ? item.vote_average.toFixed(1) : '-';

      return `
        <div class="poster-card" id="${cardId}" onclick="App.openDetail('${mType}', ${item.id})">
          <div class="poster-img-wrap">
            ${item.oscarYear ? `<div class="badge-oscar-year">🏆 ÓSCAR ${item.oscarYear}</div>` : ''}
            ${!item.oscarYear && showRank ? `<div class="badge-rank">#${idx + 1}</div>` : ''}
            <img class="poster-img" src="${poster}" alt="${title}" loading="lazy" />
            <div class="provider-slot"></div>
          </div>
          <div class="poster-info">
            <div class="poster-title" title="${title}">${title}</div>
            <div class="poster-sub"><span>${year}</span><span class="rating-star">★ ${score}</span></div>
          </div>
        </div>
      `;
    }).join('');

    processedItems.forEach(async (item, idx) => {
      const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const cardEl = document.getElementById(`card_${containerId}_${mType}_${item.id}_${idx}`);
      if (!cardEl) return;
      const providers = await this.getProviders(mType, item.id);
      const slot = cardEl.querySelector('.provider-slot');
      const misMatches = providers.filter(p => this.myPlatforms.includes(p.provider_id));

      if (misMatches.length > 0 && slot) {
        slot.innerHTML = `<div class="badge-providers">${misMatches.slice(0, 3).map(p => `<img src="https://image.tmdb.org/t/p/w92${p.logo_path}" />`).join('')}</div>`;
      } else if (providers.length > 0 && slot) {
        // Está en streaming pero no la tenés -> Se ve en GRIS indicando la plataforma
        cardEl.classList.add('unavailable');
        slot.innerHTML = `<div class="badge-unavailable">No tenés: ${providers[0].provider_name}</div>`;
      } else {
        // Si no está en ninguna plataforma, la ocultamos de la pantalla para que no ensucie
        cardEl.style.display = 'none';
      }
    });
  },

  async renderMyList() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `<h2 class="row-title">📌 Mi Lista</h2><div class="media-grid" id="gridMyList" style="margin-top:18px;"></div>`;
    this.populatePosterRow('gridMyList', this.myList, false, false);
  },

  async onSearch(query) {
    const q = query.trim();
    if (q.length < 2) { if (this.currentView === 'search') this.navigate('home'); return; }
    this.currentView = 'search';
    document.getElementById('heroBanner').classList.add('hidden');
    const container = document.getElementById('catalogContainer');
    container.style.paddingTop = '90px';
    const data = await this.fetchTMDB('/search/multi', { query: q });
    const items = (data?.results || []).filter(x => x.media_type === 'movie' || x.media_type === 'tv');
    container.innerHTML = `<h2 class="row-title">🔍 Resultados para "${q}"</h2><div class="media-grid" id="gridSearch" style="margin-top:18px;"></div>`;
    this.populatePosterRow('gridSearch', items, false, false);
  },

  async findBestTrailer(mediaType, id) {
    const res = await this.fetchTMDB(`/${mediaType}/${id}/videos`);
    const videos = res?.results || [];
    return videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos[0] || null;
  },

  async openDetail(mediaType, id) {
    document.getElementById('heroBanner').classList.add('hidden');
    document.getElementById('catalogContainer').innerHTML = '';
    const viewContainer = document.getElementById('detailViewContainer');
    const bodyContainer = document.getElementById('detailViewBody');
    const topActions = document.getElementById('detailTopActions');
    viewContainer.classList.remove('hidden');
    bodyContainer.innerHTML = '<div style="padding:60px; text-align:center; color:#888;">Cargando ficha completa...</div>';

    const [details, providers, trailer, creditsObj, reviewsObj] = await Promise.all([
      this.fetchTMDB(`/${mediaType}/${id}`),
      this.getProviders(mediaType, id),
      this.findBestTrailer(mediaType, id),
      this.fetchTMDB(`/${mediaType}/${id}/credits`),
      this.fetchTMDB(`/${mediaType}/${id}/reviews`)
    ]);

    if (!details) return;
    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').slice(0, 4);
    const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 105);
    const inList = this.myList.some(x => x.id === details.id);

    const now = new Date();
    now.setMinutes(now.getMinutes() + (runtime || 105));
    const finishTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let omdbRatings = '';
    if (this.omdbKey && details.imdb_id) {
      try {
        const omdbRes = await fetch(`https://www.omdbapi.com/?i=${details.imdb_id}&apikey=${this.omdbKey}`);
        const omdbData = await omdbRes.json();
        if (omdbData && omdbData.Response === 'True' && omdbData.Ratings) {
          omdbRatings = omdbData.Ratings.map(r => `<span>${r.Source}: <strong>${r.Value}</strong></span>`).join(' | ');
        }
      } catch (e) {}
    }

    topActions.innerHTML = `
      <button class="btn-secondary" onclick='App.toggleMyListFromDetail(${JSON.stringify({ id: details.id, title: title, poster_path: details.poster_path, vote_average: details.vote_average, release_date: details.release_date || details.first_air_date, media_type: mediaType }).replace(/'/g, "&apos;")})'>
        ${inList ? '✓ En Mi Lista' : '+ Mi Lista'}
      </button>
    `;

    bodyContainer.innerHTML = `
      ${trailer ? `
        <div class="video-container" style="max-height:450px; border-radius:8px; overflow:hidden; margin-bottom:20px;">
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      ` : ''}

      <div style="display:flex; gap:24px; flex-wrap:wrap;">
        <img src="https://image.tmdb.org/t/p/w342${details.poster_path}" style="width:220px; border-radius:8px; box-shadow:0 8px 20px rgba(0,0,0,0.8);" />
        <div style="flex:1;">
          <h1 style="font-size:32px; margin-bottom:8px;">${title} (${year})</h1>
          <div style="color:#46d369; font-weight:700; font-size:16px; margin-bottom:10px;">
            ★ ${details.vote_average?.toFixed(1) || '-'} TMDB ${omdbRatings ? ' | ' + omdbRatings : ''} · ${(details.genres || []).map(g => g.name).join(', ')} · ${runtime} min
          </div>
          <div class="finish-time-badge">
            🔴 Si la empezás a ver ahora, terminás a las ${finishTimeStr}
          </div>
          <p style="color:#ddd; line-height:1.6; font-size:16px; margin:14px 0 20px;">${details.overview || 'Sin sinopsis disponible.'}</p>
          
          <div style="margin-bottom:20px;">
            <strong style="font-size:13px; color:#aaa; display:block; margin-bottom:8px;">DISPONIBLE EN ${this.region}:</strong>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              ${providers.length > 0 ? providers.map(p => `
                <a href="https://www.google.com/search?q=ver+${encodeURIComponent(title)}+en+${encodeURIComponent(p.provider_name)}" target="_blank" class="platform-launch-btn">
                  <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" style="width:20px; height:20px; border-radius:4px;" /> Ver en ${p.provider_name} ↗
                </a>
              `).join('') : '<span style="color:#888;">No disponible en streaming directo.</span>'}
            </div>
          </div>
        </div>
      </div>

      ${creditsObj?.cast?.length > 0 ? `
        <div style="margin-top:30px;">
          <h3 style="font-size:18px; margin-bottom:12px;">🎭 Reparto Principal</h3>
          <div class="cast-grid">
            ${creditsObj.cast.slice(0, 10).map(c => `
              <div class="cast-card">
                <img src="${c.profile_path ? 'https://image.tmdb.org/t/p/w185' + c.profile_path : 'https://via.placeholder.com/185x185/222/888?text=Sin+Foto'}" class="cast-img" />
                <div class="cast-name">${c.name}</div>
                <div style="font-size:10px; color:#aaa; padding:0 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.character || ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="reviews-section">
        <h3 style="font-size:18px; margin-bottom:14px;">💬 Comentarios y Opiniones de Usuarios</h3>
        ${reviewsObj?.results?.length > 0 ? reviewsObj.results.slice(0, 3).map(r => `
          <div class="review-card">
            <strong style="color:#fff; font-size:14px;">${r.author}</strong>
            <p style="color:#bbb; font-size:13px; margin-top:6px; line-height:1.4;">${r.content.slice(0, 300)}...</p>
          </div>
        `).join('') : '<p style="color:#888; font-size:14px;">No hay comentarios registrados para este título.</p>'}
      </div>
    `;
  },

  goBackFromDetail() {
    document.getElementById('detailViewContainer').classList.add('hidden');
    this.navigate(this.currentView || 'home');
  },

  toggleMyListFromDetail(item) {
    const idx = this.myList.findIndex(x => x.id === item.id);
    if (idx >= 0) this.myList.splice(idx, 1);
    else this.myList.push(item);
    localStorage.setItem('rebobinar_mylist', JSON.stringify(this.myList));
    this.openDetail(item.media_type, item.id);
  },

  toggleMyList(item) {
    const idx = this.myList.findIndex(x => x.id === item.id);
    if (idx >= 0) this.myList.splice(idx, 1);
    else this.myList.push(item);
    localStorage.setItem('rebobinar_mylist', JSON.stringify(this.myList));
  },

  switchSettingsTab(tab) {
    document.getElementById('tabBtnApis').classList.toggle('active', tab === 'apis');
    document.getElementById('tabBtnPlatforms').classList.toggle('active', tab === 'platforms');
    document.getElementById('settingsTabApis').classList.toggle('hidden', tab !== 'apis');
    document.getElementById('settingsTabPlatforms').classList.toggle('hidden', tab !== 'platforms');
  },

  async openSettings(defaultTab = 'apis') {
    document.getElementById('apiKeyInput').value = this.apiKey;
    document.getElementById('omdbKeyInput').value = this.omdbKey;
    document.getElementById('regionSelect').value = this.region;
    document.getElementById('tmdbTestStatus').textContent = '';
    document.getElementById('omdbTestStatus').textContent = '';
    document.getElementById('settingsModal').classList.remove('hidden');
    this.switchSettingsTab(defaultTab);
    await this.loadAllRegionProviders(this.region);
  },

  closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
  },

  saveSettings() {
    const key = document.getElementById('apiKeyInput').value.trim();
    const omdb = document.getElementById('omdbKeyInput').value.trim();
    const reg = document.getElementById('regionSelect').value;
    const checks = Array.from(document.querySelectorAll('#platformsSelector input:checked')).map(c => Number(c.value));

    this.apiKey = key;
    this.omdbKey = omdb;
    this.region = reg;
    this.myPlatforms = checks;
    this.providerCache = {};

    localStorage.setItem('rebobinar_tmdb_key', key);
    localStorage.setItem('rebobinar_omdb_key', omdb);
    localStorage.setItem('rebobinar_region', reg);
    localStorage.setItem('rebobinar_platforms', JSON.stringify(checks));

    this.updatePlatCountBadge();
    this.closeSettings();
    this.navigate(this.currentView || 'home');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());


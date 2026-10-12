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
  currentView: 'home',

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

  getDatesForFilter(filterKey) {
    const today = new Date();
    const from = new Date();
    const to = new Date();

    if (filterKey === 'popular_home') {
      // Para Populares del Inicio: última semana
      from.setDate(today.getDate() - 7);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }
    if (filterKey === 'new_releases') {
      // Nuevas incorporaciones: últimas 3 semanas
      from.setDate(today.getDate() - 21);
      return { gte: this.formatDate(from), lte: this.formatDate(today) };
    }
    if (filterKey === 'theatres') {
      from.setDate(today.getDate() - 30);
      to.setMonth(today.getMonth() + 2);
      return { gte: this.formatDate(from), lte: this.formatDate(to), label: 'En cartelera y próximos estrenos' };
    }
    if (filterKey === 'upcoming') {
      to.setMonth(today.getMonth() + 6);
      return { gte: this.formatDate(today), lte: this.formatDate(to), label: 'Próximos estrenos' };
    }
    if (['streaming', 'netflix', 'prime', 'disney', 'new_series'].includes(filterKey)) {
      from.setDate(today.getDate() - 28);
      to.setMonth(today.getMonth() + 1);
      return { gte: this.formatDate(from), lte: this.formatDate(to), label: 'Últimas 4 semanas en adelante' };
    }
    if (filterKey === 'popular') {
      from.setMonth(today.getMonth() - 6);
      return { gte: this.formatDate(from), lte: this.formatDate(today), label: 'Últimos 6 meses' };
    }
    return { gte: '', lte: '', label: 'Catálogo completo' };
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
    for (const p of combined) {
      if (!map.has(p.provider_id)) map.set(p.provider_id, p);
    }
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
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === view);
    });

    const hero = document.getElementById('heroBanner');
    const container = document.getElementById('catalogContainer');
    container.innerHTML = '<div style="padding:40px 0; color:#999;">Cargando catálogo...</div>';

    if (view === 'home') {
      hero.classList.remove('hidden');
      container.style.paddingTop = '10px';
      await this.renderHome();
    } else {
      hero.classList.add('hidden');
      container.style.paddingTop = '90px';
      if (view === 'movies') await this.renderCatalogSection('movie', 'popular');
      if (view === 'tv') await this.renderCatalogSection('tv', 'popular');
      if (view === 'genres') await this.renderGenresSection('movie', 28);
      if (view === 'oscars') await this.renderOscars('all');
      if (view === 'top100') await this.renderTop100('imdb');
      if (view === 'kids') await this.renderCatalogSection('kids', 'popular');
      if (view === 'mylist') await this.renderMyList();
    }
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
      provContainer.innerHTML = `<span class="provider-pill" style="color:#aaa;">No disponible en plataformas de suscripción</span>`;
    }

    document.getElementById('heroButtons').innerHTML = `
      <button class="btn-play" onclick="App.openDetail('${mediaType}', ${item.id}, true)">▶ Ver Tráiler</button>
      <button class="btn-info" onclick="App.openDetail('${mediaType}', ${item.id}, false)">ⓘ Más información</button>
    `;
  },

  // INICIO REORGANIZADO: MI LISTA + MÁS VISTAS + TENDENCIAS SEPARADAS + NUEVAS + POPULARES
  async renderHome() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      ${this.myList.length > 0 ? `
        <section class="row-section">
          <div class="row-header"><h2 class="row-title">📌 Continuar viendo / Mi Lista</h2></div>
          <div class="row-scroller" id="rowHomeMyList"></div>
        </section>
      ` : ''}

      <!-- 1. Más vistas del día -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">👁️ Más vistas del día</h2>
        </div>
        <div class="row-scroller" id="rowMostWatched"></div>
      </section>

      <!-- 2. Tendencias en CINE -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">🎬 Tendencias en Películas (Cine)</h2>
          <div class="pill-tabs">
            <button class="pill-tab active" onclick="App.loadTrendingMedia('movie', 'day', this)">Hoy</button>
            <button class="pill-tab" onclick="App.loadTrendingMedia('movie', 'week', this)">Esta semana</button>
          </div>
        </div>
        <div class="row-scroller" id="rowTrendingMovies"></div>
      </section>

      <!-- 3. Tendencias en SERIES DE TV -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">📺 Tendencias en Series de TV</h2>
          <div class="pill-tabs">
            <button class="pill-tab active" onclick="App.loadTrendingMedia('tv', 'day', this)">Hoy</button>
            <button class="pill-tab" onclick="App.loadTrendingMedia('tv', 'week', this)">Esta semana</button>
          </div>
        </div>
        <div class="row-scroller" id="rowTrendingTV"></div>
      </section>

      <!-- 4. Nuevas incorporaciones -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">✨ Nuevas incorporaciones (Últimas semanas)</h2>
          <div class="pill-tabs">
            <button class="pill-tab active" onclick="App.loadNewReleasesRow('movie', this)">Películas</button>
            <button class="pill-tab" onclick="App.loadNewReleasesRow('tv', this)">Series</button>
          </div>
        </div>
        <div class="row-scroller" id="rowNewReleases"></div>
      </section>

      <!-- 5. Lo más popular (última semana) -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">🍿 Lo más popular</h2>
          <div class="pill-tabs">
            <button class="pill-tab active" onclick="App.loadPopularRow('streaming', this)">Retransmisión</button>
            <button class="pill-tab" onclick="App.loadPopularRow('tv', this)">En televisión</button>
            <button class="pill-tab" onclick="App.loadPopularRow('rent', this)">En alquiler</button>
            <button class="pill-tab" onclick="App.loadPopularRow('theatres', this)">En cines</button>
          </div>
        </div>
        <div class="row-scroller" id="rowPopular"></div>
      </section>

      <!-- 6. Tráilers y Gratis -->
      <section class="row-section">
        <div class="row-header"><h2 class="row-title">🎥 Últimos Tráilers (Español / Doblados)</h2></div>
        <div class="row-scroller" id="rowTrailers"></div>
      </section>

      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">🆓 Ver gratis</h2>
          <div class="pill-tabs">
            <button class="pill-tab active" onclick="App.loadFreeRow('movie', this)">Películas</button>
            <button class="pill-tab" onclick="App.loadFreeRow('tv', this)">Televisión</button>
          </div>
        </div>
        <div class="row-scroller" id="rowFree"></div>
      </section>
    `;

    if (this.myList.length > 0) this.populatePosterRow('rowHomeMyList', this.myList);
    this.loadMostWatchedDay();
    this.loadTrendingMedia('movie', 'day');
    this.loadTrendingMedia('tv', 'day');
    this.loadNewReleasesRow('movie');
    this.loadPopularRow('streaming');
    this.loadLatestTrailersRow();
    this.loadFreeRow('movie');
  },

  async loadMostWatchedDay() {
    const data = await this.fetchTMDB('/trending/all/day');
    const items = data?.results || [];
    if (items.length > 0) {
      this.updateHero(items[0], items[0].media_type || 'movie');
    }
    this.populatePosterRow('rowMostWatched', items.slice(0, 16), true);
  },

  async loadTrendingMedia(mediaType, timeWindow, btn) {
    if (btn) {
      btn.parentElement.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const data = await this.fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
    const items = (data?.results || []).map(x => ({ ...x, media_type: mediaType }));
    const rowId = mediaType === 'movie' ? 'rowTrendingMovies' : 'rowTrendingTV';
    this.populatePosterRow(rowId, items);
  },

  async loadNewReleasesRow(mediaType, btn) {
    if (btn) {
      btn.parentElement.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const dates = this.getDatesForFilter('new_releases');
    const isTV = mediaType === 'tv';
    const params = {
      sort_by: 'popularity.desc',
      watch_region: this.region,
      [isTV ? 'first_air_date.gte' : 'primary_release_date.gte']: dates.gte,
      [isTV ? 'first_air_date.lte' : 'primary_release_date.lte']: dates.lte
    };
    const data = await this.fetchTMDB(`/discover/${mediaType}`, params);
    const items = (data?.results || []).map(x => ({ ...x, media_type: mediaType }));
    this.populatePosterRow('rowNewReleases', items);
  },

  async loadPopularRow(mode, btn) {
    if (btn) {
      btn.parentElement.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const weekDates = this.getDatesForFilter('popular_home');
    let data = null;

    if (mode === 'streaming') {
      data = await this.fetchTMDB('/discover/movie', {
        sort_by: 'popularity.desc',
        watch_region: this.region,
        with_watch_monetization_types: 'flatrate',
        'primary_release_date.gte': weekDates.gte,
        'primary_release_date.lte': weekDates.lte
      });
    } else if (mode === 'tv') {
      data = await this.fetchTMDB('/discover/tv', {
        sort_by: 'popularity.desc',
        'air_date.gte': weekDates.gte,
        'air_date.lte': weekDates.lte
      });
      if (data?.results) data.results.forEach(r => r.media_type = 'tv');
    } else if (mode === 'rent') {
      data = await this.fetchTMDB('/discover/movie', {
        sort_by: 'popularity.desc',
        watch_region: this.region,
        with_watch_monetization_types: 'rent'
      });
    } else if (mode === 'theatres') {
      const thDates = this.getDatesForFilter('theatres');
      data = await this.fetchTMDB('/discover/movie', {
        sort_by: 'popularity.desc',
        with_release_type: '2|3',
        'primary_release_date.gte': thDates.gte,
        'primary_release_date.lte': thDates.lte
      });
    }
    this.populatePosterRow('rowPopular', data?.results || []);
  },

  async loadFreeRow(mediaType, btn) {
    if (btn) {
      btn.parentElement.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const data = await this.fetchTMDB(`/discover/${mediaType}`, {
      sort_by: 'popularity.desc',
      watch_region: this.region,
      with_watch_monetization_types: 'free|ads'
    });
    const items = (data?.results || []).map(x => ({ ...x, media_type: mediaType }));
    this.populatePosterRow('rowFree', items);
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
      const bg = m.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
        : `https://image.tmdb.org/t/p/w500${m.poster_path}`;
      return `
        <div class="trailer-card" onclick="App.openDetail('movie', ${m.id}, true)">
          <div class="trailer-thumb" style="background-image:url('${bg}')">
            <div class="play-circle">▶</div>
          </div>
          <div class="poster-info">
            <div class="poster-title">${m.title}</div>
            <div class="poster-sub"><span>Estreno: ${(m.release_date || '').slice(0, 10)}</span> <span>🔊 Español / Sub</span></div>
          </div>
        </div>
      `;
    }).join('');
  },

  async renderCatalogSection(sectionType, activeFilter = 'popular', customDates = null) {
    const isTV = sectionType === 'tv' || activeFilter === 'kids_tv';
    const isKids = sectionType === 'kids';
    const endpoint = isTV ? '/discover/tv' : '/discover/movie';

    const filters = isTV && !isKids ? [
      { key: 'popular', label: 'Popular' },
      { key: 'airing_today', label: 'Emitiéndose Hoy' },
      { key: 'on_the_air', label: 'En Emisión' },
      { key: 'new_series', label: 'Nuevas Series (4 sem.)' },
      { key: 'netflix', label: 'Nuevas en Netflix' },
      { key: 'prime', label: 'Nuevas en Prime' },
      { key: 'disney', label: 'Nuevas en Disney+' },
      { key: 'free', label: 'Ver Gratis' },
      { key: 'top_rated', label: 'Mejor Valoradas' },
      { key: 'gems', label: 'Joyas Ocultas' },
      { key: 'acclaimed', label: 'Aclamadas por la Crítica' }
    ] : [
      { key: 'popular', label: 'Popular' },
      { key: 'theatres', label: 'En Cines' },
      { key: 'upcoming', label: 'Próximamente' },
      { key: 'streaming', label: 'Nuevas en Streaming (4 sem.)' },
      { key: 'netflix', label: 'Nuevas en Netflix' },
      { key: 'prime', label: 'Nuevas en Prime' },
      { key: 'disney', label: 'Nuevas en Disney+' },
      { key: 'rent', label: 'En Alquiler' },
      { key: 'free', label: 'Ver Gratis' },
      { key: 'top_rated', label: 'Mejor Valoradas' },
      { key: 'gems', label: 'Joyas Ocultas' },
      { key: 'acclaimed', label: 'Aclamadas por la Crítica' },
      ...(isKids ? [{ key: 'kids_tv', label: '📺 Series Infantiles' }] : [])
    ];

    const preset = customDates || this.getDatesForFilter(activeFilter);
    const dateFieldGte = isTV ? 'first_air_date.gte' : 'primary_release_date.gte';
    const dateFieldLte = isTV ? 'first_air_date.lte' : 'primary_release_date.lte';

    const params = {
      watch_region: this.region,
      sort_by: 'popularity.desc'
    };

    if (preset.gte) params[dateFieldGte] = preset.gte;
    if (preset.lte) params[dateFieldLte] = preset.lte;

    if (isKids) {
      params.with_genres = isTV ? '10762,16' : '16,10751';
    }

    if (activeFilter === 'theatres') params.with_release_type = '2|3';
    if (activeFilter === 'upcoming') params.with_release_type = '2|3';
    if (activeFilter === 'streaming') params.with_watch_monetization_types = 'flatrate';
    if (activeFilter === 'netflix') params.with_watch_providers = '8';
    if (activeFilter === 'prime') params.with_watch_providers = '119';
    if (activeFilter === 'disney') params.with_watch_providers = '337';
    if (activeFilter === 'rent') params.with_watch_monetization_types = 'rent';
    if (activeFilter === 'free') params.with_watch_monetization_types = 'free|ads';
    if (activeFilter === 'top_rated') { params.sort_by = 'vote_average.desc'; params['vote_count.gte'] = isKids ? 100 : 250; }
    if (activeFilter === 'gems') { params.sort_by = 'vote_average.desc'; params['vote_count.gte'] = 25; params['vote_count.lte'] = 350; }
    if (activeFilter === 'acclaimed') { params['vote_average.gte'] = 7.6; params['vote_count.gte'] = 150; }

    let items = [];
    if (!isKids && activeFilter === 'airing_today') {
      const r = await this.fetchTMDB('/tv/airing_today');
      items = r?.results || [];
    } else if (!isKids && activeFilter === 'on_the_air') {
      const r = await this.fetchTMDB('/tv/on_the_air');
      items = r?.results || [];
    } else {
      const [p1, p2] = await Promise.all([
        this.fetchTMDB(endpoint, { ...params, page: 1 }),
        this.fetchTMDB(endpoint, { ...params, page: 2 })
      ]);
      items = [...(p1?.results || []), ...(p2?.results || [])];
    }

    items.forEach(i => i.media_type = isTV ? 'tv' : 'movie');

    const titleMap = { movie: '🎥 Películas', tv: '📺 Series de TV', kids: '🎈 Infantiles y Familia' };
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">${titleMap[sectionType]}</h2>
      <div class="filter-chips-bar">
        ${filters.map(f => `
          <button class="filter-chip ${f.key === activeFilter ? 'active' : ''}"
                  onclick="App.renderCatalogSection('${sectionType}', '${f.key}')">${f.label}</button>
        `).join('')}
      </div>
      <div class="date-filter-bar">
        <span>📅 Fecha Desde:</span>
        <input type="date" id="filterDateGte" value="${preset.gte}" />
        <span>Hasta:</span>
        <input type="date" id="filterDateLte" value="${preset.lte}" />
        <button class="btn-secondary" onclick="App.applyCustomDateFilter('${sectionType}', '${activeFilter}')">Aplicar Fechas</button>
        <span class="date-badge-info">${preset.label || ''}</span>
      </div>
      <div class="media-grid" id="gridCatalog"></div>
    `;

    this.populatePosterRow('gridCatalog', items);
  },

  applyCustomDateFilter(sectionType, activeFilter) {
    const gte = document.getElementById('filterDateGte').value;
    const lte = document.getElementById('filterDateLte').value;
    this.renderCatalogSection(sectionType, activeFilter, { gte, lte, label: 'Filtro personalizado' });
  },

  async renderGenresSection(mediaType = 'movie', selectedGenreId = null) {
    const genreData = await this.fetchTMDB(`/genre/${mediaType}/list`);
    const genres = genreData?.genres || [];
    const activeGenre = selectedGenreId || (genres[0]?.id ?? 28);

    const [p1, p2] = await Promise.all([
      this.fetchTMDB(`/discover/${mediaType}`, { with_genres: activeGenre, sort_by: 'popularity.desc', page: 1 }),
      this.fetchTMDB(`/discover/${mediaType}`, { with_genres: activeGenre, sort_by: 'popularity.desc', page: 2 })
    ]);
    const items = [...(p1?.results || []), ...(p2?.results || [])].map(x => ({ ...x, media_type: mediaType }));

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <div class="row-header">
        <h2 class="row-title">🎭 Explorar por Géneros</h2>
        <div class="pill-tabs">
          <button class="pill-tab ${mediaType === 'movie' ? 'active' : ''}" onclick="App.renderGenresSection('movie')">Películas</button>
          <button class="pill-tab ${mediaType === 'tv' ? 'active' : ''}" onclick="App.renderGenresSection('tv')">Series</button>
        </div>
      </div>
      <div class="filter-chips-bar">
        ${genres.map(g => `
          <button class="filter-chip ${g.id === activeGenre ? 'active' : ''}"
                  onclick="App.renderGenresSection('${mediaType}', ${g.id})">${g.name}</button>
        `).join('')}
      </div>
      <div class="media-grid" id="gridGenres"></div>
    `;
    this.populatePosterRow('gridGenres', items);
  },

  async renderOscars(decadeFilter = 'all') {
    const decades = [
      { key: 'all', label: 'Todos los Años' },
      { key: '2020', label: '2020s' },
      { key: '2010', label: '2010s' },
      { key: '2000', label: '2000s' },
      { key: '1990', label: '1990s' },
      { key: '1980', label: '1980s' },
      { key: 'classic', label: 'Clásicos' }
    ];

    const filteredList = OSCAR_WINNERS_BY_YEAR.filter(item => {
      if (decadeFilter === 'all') return true;
      if (decadeFilter === 'classic') return item.year < 1980;
      const dec = Number(decadeFilter);
      return item.year >= dec && item.year < dec + 10;
    });

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">🏆 Premios Óscar — Mejor Película por Año</h2>
      <div class="filter-chips-bar">
        ${decades.map(d => `
          <button class="filter-chip ${d.key === decadeFilter ? 'active' : ''}"
                  onclick="App.renderOscars('${d.key}')">${d.label}</button>
        `).join('')}
      </div>
      <div class="media-grid" id="gridOscars"></div>
    `;

    const results = await Promise.all(
      filteredList.map(async (entry) => {
        const movie = await this.fetchTMDB(`/movie/${entry.id}`);
        if (!movie) return null;
        return { ...movie, oscarYear: entry.year, media_type: 'movie' };
      })
    );
    this.populatePosterRow('gridOscars', results.filter(Boolean));
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
        ${tabs.map(t => `
          <button class="filter-chip ${t.key === mode ? 'active' : ''}"
                  onclick="App.renderTop100('${t.key}')">${t.label}</button>
        `).join('')}
      </div>
      <div class="media-grid" id="gridTop100"></div>
    `;

    let pages = [];
    if (mode === 'imdb') {
      pages = await Promise.all([1, 2, 3, 4, 5].map(page =>
        this.fetchTMDB('/discover/movie', { sort_by: 'vote_average.desc', 'vote_count.gte': 12000, page })
      ));
    } else if (mode === 'tmdb') {
      pages = await Promise.all([1, 2, 3, 4, 5].map(page =>
        this.fetchTMDB('/movie/top_rated', { page })
      ));
    } else if (mode === 'tomatoes') {
      pages = await Promise.all([1, 2, 3, 4, 5].map(page =>
        this.fetchTMDB('/discover/movie', {
          sort_by: 'vote_average.desc',
          'vote_count.gte': 2500,
          'vote_count.lte': 15000,
          'vote_average.gte': 7.9,
          page
        })
      ));
    }
    const all100 = pages.flatMap(p => p?.results || []).slice(0, 100);
    this.populatePosterRow('gridTop100', all100, true);
  },

  // RENDERIZADO DE TARJETAS DE PÓSTER CON LOGOS GRANDES (34px)
  async populatePosterRow(containerId, items, showRank = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map((item, idx) => {
      const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const cardId = `card_${containerId}_${mType}_${item.id}_${idx}`;
      const poster = item.poster_path
        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
        : 'https://via.placeholder.com/342x513/222/888?text=Sin+Poster';
      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const score = item.vote_average ? item.vote_average.toFixed(1) : '-';

      return `
        <div class="poster-card" id="${cardId}" onclick="App.openDetail('${mType}', ${item.id}, false)">
          <div class="poster-img-wrap">
            ${item.oscarYear ? `<div class="badge-oscar-year">🏆 ÓSCAR ${item.oscarYear}</div>` : ''}
            ${!item.oscarYear && showRank ? `<div class="badge-rank">#${idx + 1}</div>` : ''}
            <img class="poster-img" src="${poster}" alt="${title}" loading="lazy" />
            <div class="provider-slot"></div>
          </div>
          <div class="poster-info">
            <div class="poster-title" title="${title}">${title}</div>
            <div class="poster-sub">
              <span>${year}</span>
              <span class="rating-star">★ ${score}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    items.forEach(async (item, idx) => {
      const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const cardEl = document.getElementById(`card_${containerId}_${mType}_${item.id}_${idx}`);
      if (!cardEl) return;

      const providers = await this.getProviders(mType, item.id);
      const slot = cardEl.querySelector('.provider-slot');
      const misMatches = providers.filter(p => this.myPlatforms.includes(p.provider_id));

      if (misMatches.length > 0) {
        if (slot) {
          slot.innerHTML = `<div class="badge-providers">
            ${misMatches.slice(0, 3).map(p => `<img src="https://image.tmdb.org/t/p/w92${p.logo_path}" title="${p.provider_name}" />`).join('')}
          </div>`;
        }
      } else if (providers.length > 0) {
        cardEl.classList.add('unavailable');
        if (slot) {
          slot.innerHTML = `<div class="badge-unavailable" title="Disponible en: ${providers.map(p => p.provider_name).join(', ')}">No tenés: ${providers[0].provider_name}</div>`;
        }
      } else {
        cardEl.classList.add('unavailable');
        if (slot) {
          slot.innerHTML = `<div class="badge-unavailable">En ninguna</div>`;
        }
      }
    });
  },

  async renderMyList() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">📌 Mi Lista</h2>
      <div class="media-grid" id="gridMyList" style="margin-top:18px;"></div>
    `;
    if (this.myList.length === 0) {
      document.getElementById('gridMyList').innerHTML = '<p style="color:#aaa;">Todavía no agregaste títulos a Mi Lista.</p>';
      return;
    }
    this.populatePosterRow('gridMyList', this.myList);
  },

  async onSearch(query) {
    const q = query.trim();
    if (q.length < 2) {
      if (this.currentView === 'search') this.navigate('home');
      return;
    }
    this.currentView = 'search';
    document.getElementById('heroBanner').classList.add('hidden');
    const container = document.getElementById('catalogContainer');
    container.style.paddingTop = '90px';

    const data = await this.fetchTMDB('/search/multi', { query: q });
    const items = (data?.results || []).filter(x => x.media_type === 'movie' || x.media_type === 'tv');
    container.innerHTML = `
      <h2 class="row-title">🔍 Resultados para "${q}"</h2>
      <div class="media-grid" id="gridSearch" style="margin-top:18px;"></div>
    `;
    this.populatePosterRow('gridSearch', items);
  },

  async findBestTrailer(mediaType, id) {
    const [esMX, esES, enUS] = await Promise.all([
      this.fetchTMDB(`/${mediaType}/${id}/videos`, { language: 'es-MX' }),
      this.fetchTMDB(`/${mediaType}/${id}/videos`, { language: 'es-ES' }),
      this.fetchTMDB(`/${mediaType}/${id}/videos`, { language: 'en-US' })
    ]);

    const allVideos = [
      ...(esMX?.results || []),
      ...(esES?.results || []),
      ...(enUS?.results || [])
    ].filter(v => v.site === 'YouTube');

    const doblado = allVideos.find(v => /doblado|latino|español/i.test(v.name));
    if (doblado) return doblado;

    const trailerEs = (esMX?.results || []).concat(esES?.results || []).find(v => v.site === 'YouTube' && v.type === 'Trailer');
    if (trailerEs) return trailerEs;

    return allVideos.find(v => v.type === 'Trailer') || allVideos[0] || null;
  },

  async openDetail(mediaType, id, autoPlayTrailer = false) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    modal.classList.remove('hidden');
    content.innerHTML = '<div style="padding:40px; text-align:center;">Cargando ficha...</div>';

    const [details, providers, trailer] = await Promise.all([
      this.fetchTMDB(`/${mediaType}/${id}`),
      this.getProviders(mediaType, id),
      this.findBestTrailer(mediaType, id)
    ]);

    if (!details) return;
    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').slice(0, 4);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + year + ' trailer español latino')}`;
    const inList = this.myList.some(x => x.id === details.id);

    content.innerHTML = `
      ${trailer ? `
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=${autoPlayTrailer ? 1 : 0}&rel=0"
                  allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      ` : `
        <div style="height:260px; background:url('https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path}') center/cover; display:flex; align-items:flex-end; padding:20px;">
          <a href="${ytSearchUrl}" target="_blank" class="btn-play" style="text-decoration:none;">▶ Buscar Tráiler en YouTube</a>
        </div>
      `}
      <div class="detail-body">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div>
            <h2 style="font-size:26px; margin-bottom:6px;">${title} (${year})</h2>
            <div style="color:#46d369; font-weight:700; margin-bottom:12px;">
              ★ ${details.vote_average?.toFixed(1) || '-'} · ${(details.genres || []).map(g => g.name).join(', ')}
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-secondary" onclick='App.toggleMyList(${JSON.stringify({ id: details.id, title: title, poster_path: details.poster_path, vote_average: details.vote_average, release_date: details.release_date || details.first_air_date, media_type: mediaType }).replace(/'/g, "&apos;")})'>
              ${inList ? '✓ En Mi Lista' : '+ Mi Lista'}
            </button>
            <button class="btn-secondary" onclick="App.closeModal()">✕ Cerrar</button>
          </div>
        </div>
        <p style="color:#ddd; line-height:1.6; margin-bottom:18px;">${details.overview || 'Sin sinopsis disponible.'}</p>
        <div>
          <strong style="font-size:13px; color:#aaa; display:block; margin-bottom:8px;">DISPONIBLE EN (${this.region}):</strong>
          ${providers.length > 0 ? providers.map(p => `
            <span class="provider-pill" style="margin-right:6px; margin-bottom:6px;">
              <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" /> ${p.provider_name}
            </span>
          `).join('') : '<span style="color:#888;">En ninguna plataforma de streaming registrada en tu país.</span>'}
        </div>
      </div>
    `;
  },

  closeModal() {
    const modal = document.getElementById('detailModal');
    document.getElementById('detailContent').innerHTML = '';
    modal.classList.add('hidden');
  },

  toggleMyList(item) {
    const idx = this.myList.findIndex(x => x.id === item.id);
    if (idx >= 0) this.myList.splice(idx, 1);
    else this.myList.push(item);
    localStorage.setItem('rebobinar_mylist', JSON.stringify(this.myList));
    this.openDetail(item.media_type, item.id, false);
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

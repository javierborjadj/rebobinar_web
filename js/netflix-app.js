const PLATFORMS_LIST = [
  { id: 8, name: 'Netflix' },
  { id: 119, name: 'Amazon Prime Video' },
  { id: 337, name: 'Disney+' },
  { id: 1899, name: 'Max' },
  { id: 531, name: 'Paramount+' },
  { id: 350, name: 'Apple TV+' },
  { id: 339, name: 'MovistarTV' },
  { id: 619, name: 'Star+ / Mercado Play' },
  { id: 300, name: 'Pluto TV (Gratis)' },
  { id: 457, name: 'VIX (Gratis)' },
  { id: 283, name: 'Crunchyroll' },
  { id: 11, name: 'MUBI' }
];

// IDs de Ganadoras y Nominadas históricas al Óscar a Mejor Película en TMDB
const OSCAR_BEST_PICTURE_IDS = [
  872585, 545611, 776503, 581734, 496243, 490132, 399055, 376867, 314365, 194662,
  76203, 68734, 74643, 45269, 12162, 12405, 6977, 1422, 1640, 70, 122, 1574, 453,
  98, 14, 1934, 597, 409, 197, 13, 424, 33, 274, 581, 403, 380, 746, 279, 11050,
  783, 9443, 12102, 11778, 703, 1366, 510, 240, 238, 1051, 11202, 3116
];

const App = {
  apiKey: '',
  region: 'AR',
  myPlatforms: [8, 119, 337, 1899, 531, 350, 339, 619, 300],
  myList: [],
  providerCache: {},
  currentView: 'home',

  init() {
    this.loadSavedConfig();
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('navbar');
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    });

    if (!this.apiKey) {
      this.openSettings();
    } else {
      this.navigate('home');
    }
  },

  loadSavedConfig() {
    // Intentar leer clave guardada de la versión anterior o la nueva
    const savedKey = localStorage.getItem('rebobinar_tmdb_key') ||
                     localStorage.getItem('tmdb_api_key') ||
                     localStorage.getItem('tmdbKey') || '';
    this.apiKey = savedKey.trim();

    // Buscar automáticamente si estaba guardada en algún JSON de la app de TV anterior
    if (!this.apiKey) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const val = localStorage.getItem(k) || '';
        const match32 = val.match(/[a-f0-9]{32}/i);
        if (match32) {
          this.apiKey = match32[0];
          break;
        }
      }
    }

    this.region = localStorage.getItem('rebobinar_region') || 'AR';
    const savedPlats = localStorage.getItem('rebobinar_platforms');
    if (savedPlats) {
      try { this.myPlatforms = JSON.parse(savedPlats); } catch (e) {}
    }
    const savedList = localStorage.getItem('rebobinar_mylist');
    if (savedList) {
      try { this.myList = JSON.parse(savedList); } catch (e) {}
    }
  },

  getSixMonthsWindow() {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const fmt = (d) => d.toISOString().split('T')[0];
    return { gte: fmt(sixMonthsAgo), lte: fmt(today) };
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
      console.error('Error TMDB:', err);
      return null;
    }
  },

  async getProviders(mediaType, id) {
    const key = `${mediaType}_${id}`;
    if (this.providerCache[key]) return this.providerCache[key];

    const data = await this.fetchTMDB(`/${mediaType}/${id}/watch/providers`);
    const countryData = data?.results?.[this.region] || data?.results?.['AR'] || data?.results?.['ES'] || {};
    const all = [
      ...(countryData.flatrate || []),
      ...(countryData.free || []),
      ...(countryData.ads || [])
    ];
    // Eliminar duplicados
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

  isAvailableInMyPlatforms(providers) {
    if (!providers || providers.length === 0) return false;
    return providers.some(p =>
      this.myPlatforms.includes(p.provider_id) ||
      this.myPlatforms.some(myId => {
        const myObj = PLATFORMS_LIST.find(x => x.id === myId);
        return myObj && p.provider_name.toLowerCase().includes(myObj.name.split(' ')[0].toLowerCase());
      })
    );
  },

  async navigate(view) {
    this.currentView = view;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === view);
    });

    const hero = document.getElementById('heroBanner');
    const container = document.getElementById('catalogContainer');
    container.innerHTML = '<div style="padding:40px 0; color:#999;">Cargando contenidos...</div>';

    if (view === 'home') {
      hero.classList.remove('hidden');
      await this.renderHome();
    } else {
      hero.classList.add('hidden');
      container.style.paddingTop = '90px';
      if (view === 'movies') await this.renderMovies6Months('popular');
      if (view === 'tv') await this.renderTV6Months('popular');
      if (view === 'oscars') await this.renderOscars();
      if (view === 'top100') await this.renderTop100();
      if (view === 'kids') await this.renderKids('popular');
      if (view === 'mylist') await this.renderMyList();
    }
    if (view === 'home') container.style.paddingTop = '10px';
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
      <button class="btn-play" onclick="App.openDetail('${mediaType}', ${item.id}, true)">▶ Ver Tráiler (Español)</button>
      <button class="btn-info" onclick="App.openDetail('${mediaType}', ${item.id}, false)">ⓘ Más información</button>
    `;
  },

  async renderHome() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <!-- 1. Tendencias -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">🔥 Tendencias</h2>
          <div class="pill-tabs" id="tabsTrending">
            <button class="pill-tab active" onclick="App.loadTrendingRow('day', this)">Hoy</button>
            <button class="pill-tab" onclick="App.loadTrendingRow('week', this)">Esta semana</button>
          </div>
        </div>
        <div class="row-scroller" id="rowTrending"></div>
      </section>

      <!-- 2. Últimos Tráilers (Doblados / Español) -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">🎬 Últimos Tráilers (Español / Doblados - Últimos 6 meses)</h2>
        </div>
        <div class="row-scroller" id="rowTrailers"></div>
      </section>

      <!-- 3. Lo más popular (Retransmisión / En televisión / En alquiler / En cines) -->
      <section class="row-section">
        <div class="row-header">
          <h2 class="row-title">🍿 Lo más popular (Últimos 6 meses)</h2>
          <div class="pill-tabs">
            <button class="pill-tab active" onclick="App.loadPopularRow('streaming', this)">Retransmisión</button>
            <button class="pill-tab" onclick="App.loadPopularRow('tv', this)">En televisión</button>
            <button class="pill-tab" onclick="App.loadPopularRow('rent', this)">En alquiler</button>
            <button class="pill-tab" onclick="App.loadPopularRow('theatres', this)">En cines</button>
          </div>
        </div>
        <div class="row-scroller" id="rowPopular"></div>
      </section>

      <!-- 4. Ver Gratis (Películas / Televisión) -->
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

    this.loadTrendingRow('day');
    this.loadLatestTrailersRow();
    this.loadPopularRow('streaming');
    this.loadFreeRow('movie');
  },

  async loadTrendingRow(timeWindow, btn) {
    if (btn) {
      btn.parentElement.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const data = await this.fetchTMDB(`/trending/all/${timeWindow}`);
    const items = data?.results || [];
    if (items.length > 0 && timeWindow === 'day') {
      const heroPick = items[0];
      this.updateHero(heroPick, heroPick.media_type || 'movie');
    }
    this.populatePosterRow('rowTrending', items);
  },

  async loadPopularRow(mode, btn) {
    if (btn) {
      btn.parentElement.querySelectorAll('.pill-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const { gte, lte } = this.getSixMonthsWindow();
    let data = null;

    if (mode === 'streaming') {
      data = await this.fetchTMDB('/discover/movie', {
        sort_by: 'popularity.desc',
        watch_region: this.region,
        with_watch_monetization_types: 'flatrate',
        'primary_release_date.gte': gte,
        'primary_release_date.lte': lte
      });
    } else if (mode === 'tv') {
      data = await this.fetchTMDB('/discover/tv', {
        sort_by: 'popularity.desc',
        'first_air_date.gte': gte,
        'first_air_date.lte': lte
      });
      if (data?.results) data.results.forEach(r => r.media_type = 'tv');
    } else if (mode === 'rent') {
      data = await this.fetchTMDB('/discover/movie', {
        sort_by: 'popularity.desc',
        watch_region: this.region,
        with_watch_monetization_types: 'rent',
        'primary_release_date.gte': gte,
        'primary_release_date.lte': lte
      });
    } else if (mode === 'theatres') {
      data = await this.fetchTMDB('/discover/movie', {
        sort_by: 'popularity.desc',
        with_release_type: '2|3',
        'primary_release_date.gte': gte,
        'primary_release_date.lte': lte
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
    const { gte, lte } = this.getSixMonthsWindow();
    const data = await this.fetchTMDB('/discover/movie', {
      sort_by: 'popularity.desc',
      'primary_release_date.gte': gte,
      'primary_release_date.lte': lte
    });
    const row = document.getElementById('rowTrailers');
    if (!row) return;
    const movies = (data?.results || []).slice(0, 12);
    row.innerHTML = movies.map(m => {
      const bg = m.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
        : `https://image.tmdb.org/t/p/w500${m.poster_path}`;
      const date = (m.release_date || '').slice(0, 10);
      return `
        <div class="trailer-card" onclick="App.openDetail('movie', ${m.id}, true)">
          <div class="trailer-thumb" style="background-image:url('${bg}')">
            <div class="play-circle">▶</div>
          </div>
          <div class="poster-info">
            <div class="poster-title">${m.title}</div>
            <div class="poster-sub"><span>Estreno: ${date}</span> <span>🔊 Español / Sub</span></div>
          </div>
        </div>
      `;
    }).join('');
  },

  async populatePosterRow(containerId, items, showRank = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map((item, idx) => {
      const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const cardId = `card_${containerId}_${mType}_${item.id}`;
      const poster = item.poster_path
        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
        : 'https://via.placeholder.com/342x513/222/888?text=Sin+Poster';
      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const score = item.vote_average ? item.vote_average.toFixed(1) : '-';

      return `
        <div class="poster-card" id="${cardId}" onclick="App.openDetail('${mType}', ${item.id}, false)">
          <div class="poster-img-wrap">
            ${showRank ? `<div class="badge-rank">#${idx + 1}</div>` : ''}
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

    // Verificar disponibilidad en plataformas de cada tarjeta para poner en GRIS las que no estén
    items.forEach(async (item) => {
      const mType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      const cardEl = document.getElementById(`card_${containerId}_${mType}_${item.id}`);
      if (!cardEl) return;

      const providers = await this.getProviders(mType, item.id);
      const available = this.isAvailableInMyPlatforms(providers);
      const slot = cardEl.querySelector('.provider-slot');

      if (!available) {
        cardEl.classList.add('unavailable');
        if (slot) slot.innerHTML = `<div class="badge-unavailable">Sin plataforma</div>`;
      } else if (slot) {
        const matching = providers.slice(0, 3);
        slot.innerHTML = `<div class="badge-providers">
          ${matching.map(p => `<img src="https://image.tmdb.org/t/p/w45${p.logo_path}" title="${p.provider_name}" />`).join('')}
        </div>`;
      }
    });
  },

  // PELÍCULAS CON FILTROS DE TMDB (6 MESES HACIA ATRÁS DESDE HOY)
  async renderMovies6Months(activeFilter = 'popular') {
    const { gte, lte } = this.getSixMonthsWindow();
    const filters = [
      { key: 'popular', label: 'Popular (6 meses)' },
      { key: 'theatres', label: 'En Cines (In Theatres)' },
      { key: 'streaming', label: 'Nuevas en Streaming' },
      { key: 'netflix', label: 'Nuevas en Netflix' },
      { key: 'prime', label: 'Nuevas en Prime Video' },
      { key: 'disney', label: 'Nuevas en Disney+' },
      { key: 'rent', label: 'En Alquiler (For Rent)' },
      { key: 'free', label: 'Gratis (Free to Watch)' },
      { key: 'top_rated', label: 'Mejor Valoradas (6 meses)' },
      { key: 'gems', label: 'Joyas Ocultas (Hidden Gems)' },
      { key: 'acclaimed', label: 'Aclamadas por la Crítica' }
    ];

    const params = {
      'primary_release_date.gte': gte,
      'primary_release_date.lte': lte,
      watch_region: this.region,
      sort_by: 'popularity.desc'
    };

    if (activeFilter === 'theatres') params.with_release_type = '2|3';
    if (activeFilter === 'streaming') params.with_watch_monetization_types = 'flatrate';
    if (activeFilter === 'netflix') params.with_watch_providers = '8';
    if (activeFilter === 'prime') params.with_watch_providers = '119';
    if (activeFilter === 'disney') params.with_watch_providers = '337';
    if (activeFilter === 'rent') params.with_watch_monetization_types = 'rent';
    if (activeFilter === 'free') params.with_watch_monetization_types = 'free|ads';
    if (activeFilter === 'top_rated') { params.sort_by = 'vote_average.desc'; params['vote_count.gte'] = 150; }
    if (activeFilter === 'gems') { params.sort_by = 'vote_average.desc'; params['vote_count.gte'] = 30; params['vote_count.lte'] = 400; }
    if (activeFilter === 'acclaimed') { params['vote_average.gte'] = 7.5; params['vote_count.gte'] = 200; }

    const p1 = await this.fetchTMDB('/discover/movie', { ...params, page: 1 });
    const p2 = await this.fetchTMDB('/discover/movie', { ...params, page: 2 });
    const items = [...(p1?.results || []), ...(p2?.results || [])];

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">🎥 Películas — Ventana Últimos 6 Meses (${gte} a ${lte})</h2>
      <div class="filter-chips-bar">
        ${filters.map(f => `
          <button class="filter-chip ${f.key === activeFilter ? 'active' : ''}"
                  onclick="App.renderMovies6Months('${f.key}')">${f.label}</button>
        `).join('')}
      </div>
      <div class="media-grid" id="gridMovies"></div>
    `;
    this.populatePosterRow('gridMovies', items);
  },

  // SERIES CON FILTROS DE TMDB (6 MESES HACIA ATRÁS DESDE HOY)
  async renderTV6Months(activeFilter = 'popular') {
    const { gte, lte } = this.getSixMonthsWindow();
    const filters = [
      { key: 'popular', label: 'Populares (6 meses)' },
      { key: 'airing_today', label: 'Emitiéndose Hoy (Airing Tonight)' },
      { key: 'on_the_air', label: 'En Emisión (Currently Airing)' },
      { key: 'new_series', label: 'Nuevas Series (Últimos 6 meses)' },
      { key: 'netflix', label: 'En Netflix' },
      { key: 'prime', label: 'En Prime Video' },
      { key: 'disney', label: 'En Disney+' },
      { key: 'free', label: 'Ver Gratis' },
      { key: 'top_rated', label: 'Mejor Valoradas (6 meses)' }
    ];

    const params = {
      'air_date.gte': gte,
      'air_date.lte': lte,
      watch_region: this.region,
      sort_by: 'popularity.desc'
    };

    if (activeFilter === 'new_series') {
      params['first_air_date.gte'] = gte;
      params['first_air_date.lte'] = lte;
    }
    if (activeFilter === 'netflix') params.with_watch_providers = '8';
    if (activeFilter === 'prime') params.with_watch_providers = '119';
    if (activeFilter === 'disney') params.with_watch_providers = '337';
    if (activeFilter === 'free') params.with_watch_monetization_types = 'free|ads';
    if (activeFilter === 'top_rated') { params.sort_by = 'vote_average.desc'; params['vote_count.gte'] = 80; }

    let items = [];
    if (activeFilter === 'airing_today') {
      const res = await this.fetchTMDB('/tv/airing_today');
      items = res?.results || [];
    } else if (activeFilter === 'on_the_air') {
      const res = await this.fetchTMDB('/tv/on_the_air');
      items = res?.results || [];
    } else {
      const p1 = await this.fetchTMDB('/discover/tv', { ...params, page: 1 });
      const p2 = await this.fetchTMDB('/discover/tv', { ...params, page: 2 });
      items = [...(p1?.results || []), ...(p2?.results || [])];
    }

    items.forEach(i => i.media_type = 'tv');

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">📺 Series de TV — Ventana Últimos 6 Meses (${gte} a ${lte})</h2>
      <div class="filter-chips-bar">
        ${filters.map(f => `
          <button class="filter-chip ${f.key === activeFilter ? 'active' : ''}"
                  onclick="App.renderTV6Months('${f.key}')">${f.label}</button>
        `).join('')}
      </div>
      <div class="media-grid" id="gridTV"></div>
    `;
    this.populatePosterRow('gridTV', items);
  },

  // SECCIÓN PREMIOS ÓSCAR (MEJOR PELÍCULA)
  async renderOscars() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">🏆 Premios de la Academia (Óscar — Mejor Película)</h2>
      <p style="color:#aaa; margin:8px 0 22px;">Ganadoras y destacadas históricas al Óscar a Mejor Película. Las que no estén en tus plataformas aparecen en gris.</p>
      <div class="media-grid" id="gridOscars"></div>
    `;

    const promises = OSCAR_BEST_PICTURE_IDS.slice(0, 36).map(id => this.fetchTMDB(`/movie/${id}`));
    const results = (await Promise.all(promises)).filter(Boolean);
    this.populatePosterRow('gridOscars', results);
  },

  // SECCIÓN TOP 100 MEJORES DE IMDb / TMDB
  async renderTop100() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">⭐ Las 100 Mejores Películas (Ranking IMDb / TMDB)</h2>
      <p style="color:#aaa; margin:8px 0 22px;">Las 100 películas mejor valoradas de la historia. Si un clásico no está en tus plataformas, su póster se muestra en gris.</p>
      <div class="media-grid" id="gridTop100"></div>
    `;

    const pages = await Promise.all([1, 2, 3, 4, 5].map(page =>
      this.fetchTMDB('/movie/top_rated', { page })
    ));
    const all100 = pages.flatMap(p => p?.results || []).slice(0, 100);
    this.populatePosterRow('gridTop100', all100, true);
  },

  // SECCIÓN INFANTILES Y FAMILIA
  async renderKids(subFilter = 'popular') {
    const { gte, lte } = this.getSixMonthsWindow();
    const params = {
      with_genres: '16,10751', // Animación + Familia
      watch_region: this.region,
      sort_by: 'popularity.desc'
    };

    if (subFilter === 'recent') {
      params['primary_release_date.gte'] = gte;
      params['primary_release_date.lte'] = lte;
    } else if (subFilter === 'top') {
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 200;
    }

    const p1 = await this.fetchTMDB('/discover/movie', { ...params, page: 1 });
    const p2 = await this.fetchTMDB('/discover/movie', { ...params, page: 2 });
    const items = [...(p1?.results || []), ...(p2?.results || [])];

    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">🎈 Sección Infantiles y Familia</h2>
      <div class="filter-chips-bar">
        <button class="filter-chip ${subFilter === 'popular' ? 'active' : ''}" onclick="App.renderKids('popular')">Más Populares</button>
        <button class="filter-chip ${subFilter === 'recent' ? 'active' : ''}" onclick="App.renderKids('recent')">Estrenos Últimos 6 Meses</button>
        <button class="filter-chip ${subFilter === 'top' ? 'active' : ''}" onclick="App.renderKids('top')">Mejor Valoradas</button>
      </div>
      <div class="media-grid" id="gridKids"></div>
    `;
    this.populatePosterRow('gridKids', items);
  },

  async renderMyList() {
    const container = document.getElementById('catalogContainer');
    container.innerHTML = `
      <h2 class="row-title">📌 Mi Lista</h2>
      <div class="media-grid" id="gridMyList"></div>
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

  // BUSCADOR DE TRÁILERS PRIORIZANDO ESPAÑOL LATINO (DOBLADO) -> ESPAÑOL -> ORIGINAL
  async findBestTrailer(mediaType, id) {
    // 1. Buscar en Español Latino (es-MX)
    const esMX = await this.fetchTMDB(`/${mediaType}/${id}/videos`, { language: 'es-MX' });
    // 2. Buscar en Español España (es-ES)
    const esES = await this.fetchTMDB(`/${mediaType}/${id}/videos`, { language: 'es-ES' });
    // 3. Buscar en Inglés (en-US) como respaldo
    const enUS = await this.fetchTMDB(`/${mediaType}/${id}/videos`, { language: 'en-US' });

    const allVideos = [
      ...(esMX?.results || []),
      ...(esES?.results || []),
      ...(enUS?.results || [])
    ].filter(v => v.site === 'YouTube');

    // Priorizar los que dicen "Doblado" o "Español" o son Trailer oficial en español
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
    content.innerHTML = '<div style="padding:40px; text-align:center;">Cargando ficha y tráiler...</div>';

    const [details, providers, trailer] = await Promise.all([
      this.fetchTMDB(`/${mediaType}/${id}`),
      this.getProviders(mediaType, id),
      this.findBestTrailer(mediaType, id)
    ]);

    if (!details) return;
    const title = details.title || details.name;
    const year = (details.release_date || details.first_air_date || '').slice(0, 4);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + year + ' trailer español latino doblado')}`;
    const inList = this.myList.some(x => x.id === details.id);

    content.innerHTML = `
      ${trailer ? `
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=${autoPlayTrailer ? 1 : 0}&rel=0"
                  allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      ` : `
        <div style="height:260px; background:url('https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path}') center/cover; display:flex; align-items:flex-end; padding:20px;">
          <a href="${ytSearchUrl}" target="_blank" class="btn-play" style="text-decoration:none;">▶ Buscar Tráiler Doblado en YouTube</a>
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
        <p style="color:#ddd; line-height:1.6; margin-bottom:18px;">${details.overview || 'Sin sinopsis en español.'}</p>
        <div style="margin-bottom:14px;">
          <strong style="font-size:13px; color:#aaa; display:block; margin-bottom:8px;">DISPONIBLE EN (${this.region}):</strong>
          ${providers.length > 0 ? providers.map(p => `
            <span class="provider-pill" style="margin-right:6px; margin-bottom:6px;">
              <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" /> ${p.provider_name}
            </span>
          `).join('') : '<span style="color:#888;">No figura en plataformas de streaming registradas en tu región (Póster en gris).</span>'}
        </div>
        <div style="margin-top:14px;">
          <a href="${ytSearchUrl}" target="_blank" style="color:#e50914; font-weight:700; text-decoration:none; font-size:14px;">
            🔎 Abrir búsqueda de Tráiler Español Latino en YouTube ↗
          </a>
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

  openSettings() {
    document.getElementById('apiKeyInput').value = this.apiKey;
    document.getElementById('regionSelect').value = this.region;
    const grid = document.getElementById('platformsSelector');
    grid.innerHTML = PLATFORMS_LIST.map(p => `
      <label class="platform-check">
        <input type="checkbox" value="${p.id}" ${this.myPlatforms.includes(p.id) ? 'checked' : ''} />
        <span>${p.name}</span>
      </label>
    `).join('');
    document.getElementById('settingsModal').classList.remove('hidden');
  },

  closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
  },

  saveSettings() {
    const key = document.getElementById('apiKeyInput').value.trim();
    const reg = document.getElementById('regionSelect').value;
    const checks = Array.from(document.querySelectorAll('#platformsSelector input:checked')).map(c => Number(c.value));

    this.apiKey = key;
    this.region = reg;
    this.myPlatforms = checks;
    this.providerCache = {};

    localStorage.setItem('rebobinar_tmdb_key', key);
    localStorage.setItem('rebobinar_region', reg);
    localStorage.setItem('rebobinar_platforms', JSON.stringify(checks));

    this.closeSettings();
    this.navigate(this.currentView || 'home');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

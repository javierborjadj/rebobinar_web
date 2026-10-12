/* Ficha de una película o serie: datos, notas, dónde verla, tráiler automático y hora de fin */
'use strict';

Screens.detail = {
  nav: null,
  render(params) {
    const type = params.type, id = params.id;
    const root = h('div', { class: 'detail' }, h('div', { class: 'bdph' }), h('div', { class: 'shade' }));
    const wrap = h('div', { class: 'wrap sy' }, spinnerEl());
    root.appendChild(wrap);
    const self = { el: root };
    let box = null, endEl = null, runtime = 0, d = null, item = null, video = null;
    let actionsEl = null;

    const updateEnd = () => {
      if (!endEl || !runtime) return;
      const now = new Date();
      clear(endEl);
      appendKids(endEl, [h('span', null, 'SON LAS ' + hhmm(now)), h('span', { class: 'sep' }, '│'),
        h('span', null, (type === 'movie' ? 'SI LA EMPEZÁS YA, TERMINA A LAS ' : 'UN EPISODIO TERMINA A LAS ') + hhmm(new Date(now.getTime() + runtime * 60000)))]);
    };
    self.tick = updateEnd;

    const drawActions = () => {
      if (!actionsEl) return;
      const focusedIdx = $$('.btn', actionsEl).indexOf(Nav.cur);
      clear(actionsEl);
      const pr = (d['watch/providers'] || {}).results ? d['watch/providers'].results[Settings.get('region')] : null;
      const best = bestProvider(pr);
      if (best) {
        actionsEl.appendChild(h('button', { class: 'btn pri', f: true, 'data-autofocus': '', 'data-k': 'play', onclick: () => toast(Platforms.open(best.p.provider_name, item.title), 5000) },
          (best.kind === 'rent' ? '▶ Alquilar en ' : best.kind === 'buy' ? '▶ Comprar en ' : '▶ Ver en ') + platName(best.p.provider_name)));
      }
      actionsEl.appendChild(h('button', { class: 'btn', f: true, 'data-autofocus': best ? null : '', 'data-k': 'trailer', onclick: () => openPopup() }, 'Tráiler'));
      const inList = Lists.has(type, id, 'pend'), seen = Lists.has(type, id, 'seen'), fav = Lists.has(type, id, 'fav');
      const st = (Lists.get(type, id) || {}).stars || 0;
      actionsEl.appendChild(h('button', { class: 'btn sm', f: true, 'data-k': 'list', onclick: () => { const on = Lists.toggle(item, 'pend'); toast(on ? 'Agregada a tu lista' : 'Sacada de tu lista'); drawActions(); } }, inList ? '✓ En mi lista' : '+ Mi lista'));
      actionsEl.appendChild(h('button', { class: 'btn sm', f: true, 'data-k': 'seen', onclick: () => { const on = Lists.toggle(item, 'seen'); toast(on ? 'Marcada como vista' : 'Desmarcada'); drawActions(); } }, seen ? '✓ Vista' : 'Marcar vista'));
      actionsEl.appendChild(h('button', { class: 'btn sm', f: true, 'data-k': 'fav', onclick: () => { const on = Lists.toggle(item, 'fav'); toast(on ? 'Agregada a favoritas' : 'Sacada de favoritas'); drawActions(); } }, fav ? '♥ Favorita' : '♡ Favorita'));
      actionsEl.appendChild(h('button', { class: 'btn sm', f: true, 'data-k': 'rate', onclick: () => UI.rate(item) }, st ? '★'.repeat(st) : '★ Puntuar'));
      if (focusedIdx >= 0) { const b = $$('.btn', actionsEl)[focusedIdx]; if (b) Nav.focus(b, { noScroll: true }); }
    };
    self.refresh = drawActions;

    const openPopup = () => {
      if (!video) { toast('No hay tráiler cargado en TMDB para este título'); return; }
      if (box && box.failed) { Native.openYouTube(video.key); return; }
      const t = box ? box.time : 0;
      if (box) box.pause();
      Trailer.popup(video, item.title, t, () => { if (box) box.resume(); });
    };

    const ready = (async () => {
      const append = type === 'movie'
        ? 'credits,videos,watch/providers,external_ids,release_dates,recommendations'
        : 'credits,videos,watch/providers,external_ids,content_ratings,recommendations';
      d = await API.tmdb('/' + type + '/' + id, { append_to_response: append, include_video_language: (Settings.get('lang') || 'es').slice(0, 2) + ',en,null' });
      if (!d.overview) {
        try { const en = await API.tmdb('/' + type + '/' + id, { language: 'en-US' }); d.overview = en.overview; } catch (e) { }
      }
      item = API.item(d, type);
      runtime = type === 'movie' ? (d.runtime || 0) : ((d.episode_run_time || [])[0] || (d.last_episode_to_air || {}).runtime || (d.next_episode_to_air || {}).runtime || 0);
      item.runtime = runtime;
      Saver.add(item);
      if (Lists.get(type, id)) { Lists.upsert(item); Lists.save(); }
      video = Trailer.pick((d.videos || {}).results, Settings.get('lang'));

      // Fondo
      if (d.backdrop_path) root.insertBefore(h('img', { class: 'bd', src: API.img(d.backdrop_path, 'w1280'), alt: '' }), root.firstChild.nextSibling);

      // Datos
      const year = item.year;
      const cert = certification(d, type);
      const crew = (d.credits || {}).crew || [];
      const director = type === 'movie' ? (crew.find(c => c.job === 'Director') || {}).name : ((d.created_by || [])[0] || {}).name;
      const meta = type === 'movie'
        ? [year, runtimeTxt(runtime), cert, director ? 'Dir. ' + director : ''].filter(Boolean).join(' · ')
        : [year, d.number_of_seasons ? d.number_of_seasons + (d.number_of_seasons === 1 ? ' temporada' : ' temporadas') : '', d.number_of_episodes ? d.number_of_episodes + ' episodios' : '', cert, director ? 'Creada por ' + director : ''].filter(Boolean).join(' · ');

      endEl = runtime ? h('div', { class: 'endtime' }) : null;
      updateEnd();

      const scores = h('div', { class: 'scores' });
      const scoreEl = (l, v, c) => h('div', { class: 'score', vars: { '--c': c } }, h('div', { class: 'l' }, l), h('div', { class: 'v' }, v));
      const tmdbScore = d.vote_average ? d.vote_average.toFixed(1) : '—';
      scores.appendChild(scoreEl('TMDB', tmdbScore, 'var(--a2)'));
      const imdbId = (d.external_ids || {}).imdb_id;
      const hasOmdb = !!Settings.get('omdbKey') || API.demo();
      let omdbNote = null;
      if (hasOmdb && imdbId) {
        const ph = [scoreEl('IMDb', '…', 'var(--a1)'), scoreEl('ROTTEN', '…', 'var(--red)'), scoreEl('METACRITIC', '…', 'var(--ok)')];
        ph.forEach(x => scores.appendChild(x));
        API.omdb(imdbId).then(o => {
          const vals = o ? [o.imdb, o.rt, o.mc] : [null, null, null];
          ph.forEach((x, i) => { $('.v', x).textContent = vals[i] || '—'; });
        });
      } else if (!hasOmdb) {
        omdbNote = h('div', { class: 'attr' }, 'Cargá la clave de OMDb en Ajustes para ver IMDb, Rotten Tomatoes y Metacritic.');
      }

      const genres = h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
        (d.genres || []).slice(0, 4).map(g => h('button', { class: 'chip f', tabindex: -1, onclick: () => App.go('genres', { type, genre: g.id }) }, g.name)));
      $$('.chip', genres).forEach(c => c.classList.add('f'));

      actionsEl = h('div', { class: 'actions' });

      // Dónde verla
      const pr = (d['watch/providers'] || {}).results ? d['watch/providers'].results[Settings.get('region')] : null;
      const provList = h('div', { class: 'list' });
      const added = new Set();
      const addProv = (p, kindLabel) => {
        const name = platName(p.provider_name);
        const k = name + kindLabel;
        if (added.has(k)) return;
        added.add(k);
        const mine = Platforms.isMine(p.provider_id, p.provider_name);
        provList.appendChild(h('button', { class: 'prov' + (mine ? ' mine' : ''), f: true, onclick: () => toast(Platforms.open(p.provider_name, item.title), 5000) },
          p.logo_path ? h('img', { src: API.img(p.logo_path, 'w92'), alt: '' }) : h('span', { style: { width: '6px' } }),
          name + ' · ' + kindLabel));
      };
      if (pr) {
        (pr.flatrate || []).forEach(p => addProv(p, 'Incluida'));
        (pr.free || []).concat(pr.ads || []).forEach(p => addProv(p, 'Gratis'));
        (pr.rent || []).slice(0, 3).forEach(p => addProv(p, 'Alquiler'));
        (pr.buy || []).slice(0, 2).forEach(p => addProv(p, 'Compra'));
      }
      const provs = h('div', { class: 'provs' },
        h('div', { class: 'vt muted', style: { fontSize: '18px', letterSpacing: '1px' } }, 'DISPONIBLE EN ' + regionName(Settings.get('region')).toUpperCase()),
        added.size ? provList : h('div', { style: { fontSize: '18px' } }, 'Por ahora no está en streaming en tu país.'),
        h('div', { class: 'attr' }, 'Datos de disponibilidad: JustWatch'));

      // Póster
      const poster = h('div', { class: 'd-poster' },
        h('div', { class: 'vhs', vars: { '--c': vhsColor(id), '--s': vhsStripe(id) } },
          h('div', { class: 'ph' }, h('b', { style: { fontSize: '22px' } }, item.title), h('i', null, year)),
          d.poster_path ? h('img', { src: API.img(d.poster_path, 'w500'), alt: '' }) : null,
          stickerFor(item) ? h('div', { class: 'sticker', style: { fontSize: '13px' } }, stickerFor(item)) : null),
        h('div', { class: 'rewind' }, 'POR FAVOR REBOBINE'));

      const info = h('div', { class: 'd-info' },
        h('h1', null, item.title),
        item.orig && norm(item.orig) !== norm(item.title) ? h('div', { class: 'orig' }, item.orig) : null,
        h('div', { class: 'd-meta' }, meta),
        endEl, genres, scores, omdbNote,
        h('p', { class: 'overview' }, d.overview || 'Sin sinopsis disponible.'),
        actionsEl, provs);

      // Tráiler y reparto
      const tbox = h('div', { class: 'tbox f', tabindex: -1, 'data-k': 'tbox', onclick: openPopup });
      if (video) box = Trailer.box(tbox, video);
      else appendKids(tbox, [h('div', { class: 'wait' }, h('div', { class: 'vt', style: { fontSize: '24px', color: 'var(--muted)' } }, 'SIN TRÁILER'))]);
      const castList = ((d.credits || {}).cast || []).slice(0, 5);
      const cast = h('div', { class: 'cast mem' }, castList.map(c => {
        const b = h('button', { class: 'person f', tabindex: -1, onclick: () => App.go('person', { id: c.id }) },
          h('div', { class: 'ph', vars: { '--c': vhsColor(c.id) } }, c.profile_path ? h('img', { src: API.img(c.profile_path, 'w185'), alt: '' }) : initials(c.name)),
          h('div', { class: 'n' }, c.name), h('div', { class: 'r' }, c.character || ''));
        return b;
      }));
      $$('.person', cast).forEach(c => c.classList.add('f'));
      const side = h('div', { class: 'd-side' }, tbox,
        h('div', { class: 'hint' }, video ? 'OK sobre el tráiler: pantalla completa con sonido' : 'Este título no tiene tráiler en TMDB'),
        castList.length ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,.45)', padding: '8px 10px', borderRadius: '4px' } },
          h('div', { class: 'vt muted', style: { fontSize: '18px', letterSpacing: '1px' } }, 'REPARTO'), cast) : null);

      clear(wrap);
      wrap.appendChild(h('div', { class: 'd-main' }, poster, info, side));
      drawActions();

      const recs = ((d.recommendations || {}).results || []).map(x => API.item(x, type)).filter(x => x.poster || API.demo());
      if (recs.length) {
        const r = row('Si te gustó, llevate también', 'recomendaciones', async () => ({ items: recs, total: 1 }), { paged: false });
        r.style.margin = '18px -40px 0';
        wrap.appendChild(r);
      }
    })().catch(e => {
      clear(wrap);
      wrap.appendChild(emptyEl('Ups', errorText(e)));
      wrap.appendChild(h('div', { style: { textAlign: 'center' } }, h('button', { class: 'btn pri', f: true, 'data-autofocus': '', onclick: () => App.back() }, 'Volver')));
    });

    self.ready = ready;
    self.destroy = () => { if (box) box.stop(); };
    self.onPause = () => { if (box) box.pause(); };
    return self;
  }
};

function platName(n) { const g = Platforms.of(n); return g ? g.name : n; }
function regionName(r) { return ({ AR: 'Argentina', UY: 'Uruguay', CL: 'Chile', MX: 'México', ES: 'España', US: 'Estados Unidos', CO: 'Colombia', PE: 'Perú', BR: 'Brasil' })[r] || r; }

function bestProvider(pr) {
  if (!pr) return null;
  const inc = (pr.flatrate || []).concat(pr.free || [], pr.ads || []);
  const mine = inc.find(p => Platforms.isMine(p.provider_id, p.provider_name));
  if (mine) return { p: mine, kind: 'flatrate' };
  if (inc.length) return { p: inc[0], kind: 'flatrate' };
  if ((pr.rent || []).length) return { p: pr.rent[0], kind: 'rent' };
  if ((pr.buy || []).length) return { p: pr.buy[0], kind: 'buy' };
  return null;
}

function certification(d, type) {
  const reg = Settings.get('region');
  if (type === 'movie') {
    const r = ((d.release_dates || {}).results || []);
    const pickCert = code => { const x = r.find(y => y.iso_3166_1 === code); return x ? (x.release_dates.find(z => z.certification) || {}).certification : ''; };
    const c = pickCert(reg) || '';
    return c ? (c === 'ATP' || c === 'G' ? 'ATP' : c.replace(/^(\d+)$/, '+$1')) : '';
  }
  const r = ((d.content_ratings || {}).results || []);
  const x = r.find(y => y.iso_3166_1 === reg);
  return x && x.rating ? (/^\d+$/.test(x.rating) ? '+' + x.rating : x.rating) : '';
}

function stickerFor(item) {
  if (!item.date) return '';
  if (item.date > daysFromNow(0)) return 'PRÓXIMAMENTE';
  if (item.date >= daysFromNow(-60)) return 'ESTRENO';
  if (item.date <= yearsAgo(25)) return 'CLÁSICO';
  return '';
}

/* Inicio: recomendado del videoclub, filas y pasillos */
'use strict';

const Screens = window.Screens = {};

Screens.home = {
  nav: 'Inicio',
  render(params) {
    const root = h('div', { class: 'sy', style: { height: '100%' } });
    const hero = h('section', { class: 'hero' }, h('div', { class: 'info' }, h('div', { class: 'kicker' }, '★ RECOMENDADO DEL VIDEOCLUB'), spinnerEl()));
    root.appendChild(hero);

    const today = daysFromNow(0);
    const rows = [];
    const addRow = r => { rows.push(r); root.appendChild(r); };
    const collect = items => { items.forEach(i => Saver.add(i)); return items; };

    addRow(row('Nuevo en tus plataformas', Settings.get('onlyMine') ? 'películas recientes' : 'películas recientes · todas las plataformas',
      async p => { const r = await Q.discover('movie', { 'primary_release_date.gte': daysFromNow(-150), 'primary_release_date.lte': today, sort_by: 'popularity.desc', 'vote_count.gte': 10, page: p }); collect(r.items); return r; },
      { cardOpts: it => (it.date >= daysFromNow(-45) ? { sticker: 'ESTRENO' } : null) }));

    const pend = Lists.list('pend');
    if (pend.length) {
      addRow(row('Seguí con tu lista', pend.length + ' pendientes',
        async () => ({ items: pend.map(i => ({ type: i.type, id: i.id, title: i.title, year: i.year, poster: i.poster, vote: 0 })), total: 1 }),
        { paged: false }));
    }

    addRow(row('Series del momento', 'en tus plataformas',
      async p => { const r = await Q.discover('tv', { sort_by: 'popularity.desc', 'vote_count.gte': 80, page: p }); collect(r.items); return r; }));

    const offset = params.offset != null ? params.offset : (params.offset = Math.floor(Math.random() * 3));
    addRow(row('Clásicos para esta noche', 'más de 25 años · muy votadas',
      async p => { const r = await Q.discover('movie', Object.assign(Q.shelf('movie', 'classic'), { page: p + offset })); collect(r.items); return r; },
      { cardOpts: () => ({ sticker: 'CLÁSICO', stickerAlt: true }) }));

    const decade = params.decade || (params.decade = pick([1970, 1980, 1990, 2000]));
    addRow(row('Estante de los ' + String(decade).slice(2) + 's', 'lo más alquilado de la década',
      async p => { const r = await Q.discover('movie', Object.assign(Q.shelf('movie', 'decade', decade), { page: p })); collect(r.items); return r; }));

    addRow(row('Series que marcaron época', 'clásicos de la tele',
      async p => Q.discover('tv', Object.assign(Q.shelf('tv', 'classic'), { page: p }))));

    // Pasillos (atajos a géneros)
    const aisles = h('div', { class: 'aisles mem' });
    const aislesSec = h('section', { class: 'row' }, h('div', { class: 'head' }, h('h2', { class: 'h-sec' }, 'Pasillos'), h('span', { class: 'h-sub' }, 'elegí un género')), aisles);
    root.appendChild(aislesSec);
    const colors = ['var(--a3)', 'var(--a1)', 'var(--red)', 'var(--a2)'];
    API.genres('movie').then(gs => {
      gs.forEach((g, i) => aisles.appendChild(h('button', { class: 'sign f', tabindex: -1, vars: { '--c': colors[i % 4] }, onclick: () => App.go('genres', { type: 'movie', genre: g.id }) }, g.name.toUpperCase())));
      $$('.sign', aisles).forEach(b => b.classList.add('f'));
    }).catch(() => { });

    // Recomendado
    const fillHero = async () => {
      let it = params.heroPick;
      if (!it) {
        const r = await Q.discover('movie', Object.assign(Q.shelf('movie', 'classic'), { page: 1 + Math.floor(Math.random() * 3) }));
        const withBd = r.items.filter(x => x.backdrop);
        it = pick(withBd.length ? withBd : r.items);
        params.heroPick = it;
      }
      if (!it) { hero.classList.add('hidden'); return; }
      Saver.add(it);
      const plats = h('div', { class: 'plats' });
      const meta = h('div', { class: 'm' }, [it.year, it.vote ? '★ ' + it.vote.toFixed(1) : ''].filter(Boolean).join(' · '));
      clear(hero);
      if (it.backdrop) hero.appendChild(h('img', { class: 'bd', src: API.img(it.backdrop, 'w1280'), alt: '' }));
      hero.appendChild(h('div', { class: 'shade' }));
      hero.appendChild(h('div', { class: 'info' },
        h('div', { class: 'kicker' }, '★ RECOMENDADO DEL VIDEOCLUB'),
        h('div', { class: 't' }, it.title), meta, h('div', { class: 'o' }, it.overview), plats,
        h('div', { class: 'actions' },
          h('button', { class: 'btn pri', f: true, 'data-k': 'hero', 'data-autofocus': '', onclick: () => App.go('detail', { type: it.type, id: it.id }) }, 'Ver ficha'),
          h('button', { class: 'btn', f: true, onclick: async () => {
            try {
              const d = await API.tmdb('/' + it.type + '/' + it.id, { append_to_response: 'videos', include_video_language: 'es,en,null' });
              Trailer.popup(Trailer.pick((d.videos || {}).results, Settings.get('lang')), it.title);
            } catch (e) { toast(errorText(e)); }
          } }, '▶ Tráiler'),
          h('button', { class: 'btn', f: true, onclick: () => App.go('roulette') }, '¿Qué veo hoy?'))));
      try {
        const pr = await API.providersFor(it.type, it.id);
        const names = providerNames(pr);
        if (names.length) for (const n of names.slice(0, 5)) plats.appendChild(h('span', { class: 'pl' }, n));
        else plats.appendChild(h('span', { class: 'pl' }, 'Sin streaming en ' + Settings.get('region')));
      } catch (e) { }
    };
    const heroReady = fillHero().catch(e => { clear(hero); hero.appendChild(h('div', { class: 'info' }, h('div', { class: 'kicker' }, 'UPS'), h('div', { class: 'o' }, errorText(e)))); });

    return { el: root, ready: Promise.all([heroReady].concat(rows.map(r => r.ready))) };
  }
};

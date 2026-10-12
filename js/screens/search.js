/* Buscar: teclado en pantalla, resultados de películas, series y personas */
'use strict';

Screens.search = {
  nav: 'Buscar',
  render(params) {
    params.q = params.q || '';
    const results = h('div', { class: 'sy', style: { flex: 1, minHeight: 0, paddingRight: '30px' } });
    const head = h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '12px' } });
    const recent = h('div', { class: 'mem', style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });
    let token = 0;

    const run = async q => {
      const my = ++token;
      params.q = q;
      clear(head);
      q = q.trim();
      if (q.length < 2) {
        appendKids(head, [h('h2', { class: 'h-sec' }, 'Tendencias de la semana'), h('span', { class: 'h-sub' }, 'lo más buscado')]);
        clear(results); results.appendChild(spinnerEl());
        try {
          const r = await API.tmdb('/trending/all/week', {});
          if (my !== token) return;
          drawResults(Q.clean((r.results || []).map(x => API.item(x))), []);
        } catch (e) { if (my === token) { clear(results); results.appendChild(emptyEl('Ups', errorText(e))); } }
        return;
      }
      appendKids(head, [h('h2', { class: 'h-sec' }, 'Resultados'), h('span', { class: 'h-sub' }, '«' + q + '»')]);
      clear(results); results.appendChild(spinnerEl());
      try {
        const [a, b] = await Promise.all([
          API.tmdb('/search/multi', { query: q, include_adult: false, page: 1 }),
          API.tmdb('/search/multi', { query: q, include_adult: false, page: 2 }).catch(() => ({ results: [] }))
        ]);
        if (my !== token) return;
        const seenK = new Set();
        const all = (a.results || []).concat(b.results || []).filter(x => { const k = x.media_type + ':' + x.id; if (seenK.has(k)) return false; seenK.add(k); return true; });
        const titles = Q.clean(all.filter(x => x.media_type === 'movie' || x.media_type === 'tv').map(x => API.item(x)));
        const people = all.filter(x => x.media_type === 'person').slice(0, 8);
        drawResults(titles, people);
        if (titles.length || people.length) saveRecent(q);
      } catch (e) { if (my === token) { clear(results); results.appendChild(emptyEl('Ups', errorText(e))); } }
    };
    const debounced = debounce(run, 450);

    const drawResults = (titles, people) => {
      clear(results);
      if (!titles.length && !people.length) { results.appendChild(emptyEl('Nada en el videoclub', 'Probá con otra palabra o con el título original.')); return; }
      if (people.length) {
        results.appendChild(h('div', { class: 'vt muted', style: { fontSize: '19px', letterSpacing: '2px', marginTop: '6px' } }, 'PERSONAS'));
        const pl = h('div', { class: 'people mem' }, people.map(p => {
          const kf = (p.known_for || []).map(k => k.title || k.name).filter(Boolean)[0];
          const b = h('button', { class: 'pchip', f: true, 'data-k': 'p' + p.id, onclick: () => App.go('person', { id: p.id }) },
            h('div', { class: 'ph', vars: { '--c': vhsColor(p.id) } }, p.profile_path ? h('img', { src: API.img(p.profile_path, 'w185'), alt: '' }) : initials(p.name)),
            h('div', { style: { textAlign: 'left' } }, h('div', { class: 'n' }, p.name), h('div', { class: 'r' }, [dept(p.known_for_department), kf].filter(Boolean).join(' · '))));
          return b;
        }));
        results.appendChild(pl);
      }
      if (titles.length) {
        results.appendChild(h('div', { class: 'vt muted', style: { fontSize: '19px', letterSpacing: '2px', marginTop: '6px' } }, 'PELÍCULAS Y SERIES'));
        results.appendChild(h('div', { class: 'grid', vars: { '--pw': '124px' } }, titles.map(t => card(t))));
      }
    };

    const saveRecent = q => {
      const list = [q].concat((Settings.get('recentSearches') || []).filter(x => norm(x) !== norm(q))).slice(0, 6);
      Settings.set('recentSearches', list);
    };
    const drawRecent = () => {
      clear(recent);
      const list = Settings.get('recentSearches') || [];
      if (!list.length) return;
      recent.appendChild(h('span', { class: 'vt muted', style: { fontSize: '18px', alignSelf: 'center' } }, 'RECIENTES:'));
      for (const r of list) recent.appendChild(h('button', { class: 'chip', f: true, onclick: () => { kb.set(r); } }, r));
    };

    const kb = new Keyboard({ value: params.q, layout: 'search', placeholder: 'ESCRIBÍ UN TÍTULO O UN NOMBRE', onChange: v => debounced(v) });
    const voice = h('div', { class: 'vt muted', style: { fontSize: '18px' } }, 'Tip: escaneá el QR del panel del celular (Ajustes) para escribir con el teléfono.');
    const left = h('div', { class: 'left' }, kb.el, recent, voice);
    const root = h('div', { class: 'search' }, left, h('div', { class: 'right' }, head, results));
    drawRecent();
    run(params.q);
    return { el: root };
  }
};

function dept(d) { return ({ Acting: 'Actuación', Directing: 'Dirección', Writing: 'Guion', Production: 'Producción', Sound: 'Música', Camera: 'Fotografía', Editing: 'Montaje' })[d] || d || ''; }

/* Estrenos: sin importar el género, separado en Películas y Series */
'use strict';

Screens.releases = {
  nav: 'Estrenos',
  render(params) {
    params.kind = params.kind || 'movie';
    const CHIPS = {
      movie: [['stream', 'En streaming'], ['cines', 'En cines'], ['pronto', 'Próximamente']],
      tv: [['nuevas', 'Series nuevas'], ['temporadas', 'Temporadas nuevas'], ['pronto', 'Próximamente']]
    };
    if (!CHIPS[params.kind].some(c => c[0] === params.chip)) params.chip = CHIPS[params.kind][0][0];

    const seg = h('div', { class: 'seg' });
    const chips = h('div', { class: 'mem', style: { display: 'flex', gap: '8px' } });
    const note = h('div', { class: 'vt muted', style: { marginLeft: 'auto', fontSize: '19px' } });
    const info = h('div', { class: 'focusinfo' });
    const gridBox = h('div', { class: 'sy', style: { flex: 1, minHeight: 0, paddingRight: '34px' } });
    focusInfo(gridBox, info);
    const root = h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 0 0 40px' } },
      h('div', { class: 'bar' }, h('div', { class: 'label-red' }, 'ESTRENOS'), seg, chips, note), info, gridBox);

    const today = daysFromNow(0);
    const loaders = {
      'movie:stream': p => Q.discover('movie', { 'primary_release_date.gte': daysFromNow(-100), 'primary_release_date.lte': today, with_release_type: '4|5', sort_by: 'popularity.desc', page: p }),
      'movie:cines': p => Q.list('/movie/now_playing', { page: p }, 'movie'),
      'movie:pronto': async p => {
        const r = await Q.list('/movie/upcoming', { page: p }, 'movie');
        r.items = r.items.filter(i => i.date > today).sort((a, b) => a.date.localeCompare(b.date));
        return r;
      },
      'tv:nuevas': p => Q.discover('tv', { 'first_air_date.gte': daysFromNow(-90), 'first_air_date.lte': today, sort_by: 'popularity.desc', page: p }),
      'tv:temporadas': p => Q.discover('tv', { 'air_date.gte': daysFromNow(-21), 'air_date.lte': today, 'first_air_date.lte': daysFromNow(-200), sort_by: 'popularity.desc', page: p }),
      'tv:pronto': p => Q.discover('tv', { 'first_air_date.gte': daysFromNow(1), sort_by: 'popularity.desc', page: p }, false)
    };
    const notes = {
      'movie:stream': 'llegaron a streaming en los últimos 3 meses', 'movie:cines': 'en cartelera en ' + Settings.get('region') + ' · todas',
      'movie:pronto': 'en cines próximamente', 'tv:nuevas': 'primera temporada', 'tv:temporadas': 'con episodios nuevos esta semana o la anterior',
      'tv:pronto': 'series por estrenar · todas las plataformas'
    };
    const stickers = { 'movie:stream': 'ESTRENO', 'movie:cines': 'EN CINES', 'movie:pronto': 'PRONTO', 'tv:nuevas': 'SERIE NUEVA', 'tv:temporadas': 'TEMPORADA', 'tv:pronto': 'PRONTO' };

    const draw = () => {
      clear(seg);
      [['movie', 'PELÍCULAS'], ['tv', 'SERIES']].forEach(([k, l]) => seg.appendChild(h('button', {
        class: 'tab' + (params.kind === k ? ' on' : ''), f: true, 'data-autofocus': params.kind === k ? '' : null, onclick: () => {
          if (params.kind === k) return;
          params.kind = k; params.chip = CHIPS[k][0][0]; draw();
          Nav.focus($$('.tab', seg)[k === 'movie' ? 0 : 1]);
        }
      }, l)));
      clear(chips);
      for (const [k, l] of CHIPS[params.kind]) {
        const b = h('button', { class: 'chip' + (params.chip === k ? ' on' : ''), f: true, onclick: () => { params.chip = k; draw(); Nav.focus($$('.chip', chips).find(x => x.textContent === l)); } }, l);
        chips.appendChild(b);
        if (params.chip === k) chips._last = b;
      }
      const key = params.kind + ':' + params.chip;
      note.textContent = notes[key];
      clear(info);
      const altSticker = key.endsWith('pronto');
      return grid(gridBox, loaders[key], {
        cardOpts: it => ({ sticker: stickers[key], stickerAlt: altSticker, sub: (it.date ? ddmm(it.date) + (it.date.slice(0, 4) !== today.slice(0, 4) ? '/' + it.date.slice(2, 4) : '') : '') + (it.vote ? ' · ★ ' + it.vote.toFixed(1) : '') }),
        emptyText: key.startsWith('movie:stream') || key.startsWith('tv') ? 'No hay estrenos en tus plataformas con este filtro. Probá desactivar «Solo mis plataformas».' : ''
      }).ready;
    };
    return { el: root, ready: draw() };
  }
};

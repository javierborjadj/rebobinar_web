/* Géneros: pasillos a la izquierda; Clásicos, Décadas y Estrenos de cada género */
'use strict';

Screens.genres = {
  nav: 'Géneros',
  render(params) {
    params.type = params.type || 'movie';
    params.tab = params.tab || 'classic';
    params.decade = params.decade || 1980;

    const typeSeg = h('div', { class: 'seg', style: { margin: '0 22px 10px 0' } });
    const list = h('div', { class: 'sy mem', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' } });
    const aside = h('aside', { class: 'aside' }, h('div', { class: 'vt muted', style: { fontSize: '19px', letterSpacing: '2px', marginBottom: '6px' } }, 'PASILLOS'), typeSeg, list);

    const title = h('div', { class: 'big neon' });
    const tabs = h('div', { style: { display: 'flex', gap: '6px' } });
    const hint = h('div', { class: 'vt muted', style: { marginLeft: 'auto', fontSize: '19px' } });
    const decades = h('div', { class: 'mem', style: { display: 'flex', gap: '8px', marginTop: '10px' } });
    const info = h('div', { class: 'focusinfo' });
    const gridBox = h('div', { class: 'sy', style: { flex: 1, minHeight: 0, paddingRight: '34px' } });
    const content = h('div', { class: 'content' }, h('div', { class: 'bar' }, title, tabs, hint), decades, info, gridBox);
    focusInfo(gridBox, info);

    let genres = [];
    const TABS = [['classic', 'Clásicos'], ['decade', 'Décadas'], ['new', 'Estrenos']];
    const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

    const drawType = () => {
      clear(typeSeg);
      [['movie', 'PELIS'], ['tv', 'SERIES']].forEach(([t, l]) => typeSeg.appendChild(h('button', {
        class: 'tab' + (params.type === t ? ' on' : ''), f: true, onclick: async () => {
          if (params.type === t) return;
          params.type = t; params.genre = null;
          drawType(); await loadGenres(); drawList(); drawContent();
        }
      }, l)));
    };
    const drawList = () => {
      clear(list);
      for (const g of genres) {
        const on = g.id === params.genre;
        const b = h('button', { class: 'side' + (on ? ' on' : ''), f: true, 'data-k': 'g' + g.id, 'data-autofocus': on ? '' : null, onclick: () => {
          params.genre = g.id;
          $$('.side', list).forEach(x => x.classList.toggle('on', x === b));
          drawContent();
        } }, on ? g.name + '  ›' : g.name);
        list.appendChild(b);
        if (on) list._last = b;
      }
    };
    const drawContent = () => {
      const g = genres.find(x => x.id === params.genre) || genres[0];
      if (!g) return;
      params.genre = g.id;
      $$('.side', list).forEach(x => { const on = x.getAttribute('data-k') === 'g' + g.id; x.classList.toggle('on', on); x.textContent = (genres.find(y => 'g' + y.id === x.getAttribute('data-k')) || {}).name + (on ? '  ›' : ''); });
      title.textContent = g.name.toUpperCase();
      clear(tabs);
      for (const [k, l] of TABS) tabs.appendChild(h('button', { class: 'tab' + (params.tab === k ? ' on' : ''), f: true, onclick: () => { params.tab = k; drawContent(); Nav.focus($$('.tab', tabs)[TABS.findIndex(t => t[0] === k)]); } }, l));
      clear(decades);
      decades.classList.toggle('hidden', params.tab !== 'decade');
      if (params.tab === 'decade') {
        for (const d of DECADES) {
          const b = h('button', { class: 'chip' + (params.decade === d ? ' on' : ''), f: true, onclick: () => { params.decade = d; drawContent(); Nav.focus($$('.chip', decades)[DECADES.indexOf(d)]); } }, d >= 2000 ? String(d) + 's' : String(d).slice(2) + 's');
          decades.appendChild(b);
          if (params.decade === d) decades._last = b;
        }
      }
      hint.textContent = params.tab === 'classic' ? (params.type === 'movie' ? 'más de 25 años · muy votadas' : 'más de 15 años · muy votadas')
        : params.tab === 'decade' ? 'estante de los ' + (params.decade >= 2000 ? params.decade : String(params.decade).slice(2)) + 's' : 'últimos 5 meses';
      clear(info);
      const type = params.type, tab = params.tab, decade = params.decade, gid = g.id;
      grid(gridBox, p => Q.discover(type, Object.assign({ with_genres: gid, page: p }, Q.shelf(type, tab, decade))), {
        cardOpts: it => tab === 'new' && it.date >= daysFromNow(-45) ? { sticker: 'ESTRENO' } : null
      });
      gridBox.scrollTop = 0;
    };
    const loadGenres = async () => {
      genres = await API.genres(params.type);
      if (!genres.some(g => g.id === params.genre)) params.genre = genres.length ? genres[0].id : null;
    };

    drawType();
    const root = h('div', { class: 'split' }, aside, content);
    const ready = loadGenres().then(() => { drawList(); drawContent(); }).catch(e => { clear(gridBox); gridBox.appendChild(emptyEl('Ups', errorText(e))); });
    return { el: root, ready };
  }
};

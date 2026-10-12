/* Persona: actor, actriz o director, con su filmografía */
'use strict';

Screens.person = {
  nav: null,
  render(params) {
    const root = h('div', { class: 'sy', style: { height: '100%' } }, spinnerEl());
    const ready = (async () => {
      const p = await API.tmdb('/person/' + params.id, { append_to_response: 'combined_credits' });
      let bio = p.biography;
      if (!bio) { try { bio = (await API.tmdb('/person/' + params.id, { language: 'en-US' })).biography; } catch (e) { } }
      const cc = p.combined_credits || {};
      const isDirector = p.known_for_department === 'Directing';
      const pool = (isDirector ? (cc.crew || []).filter(c => c.job === 'Director').concat(cc.cast || []) : (cc.cast || []).concat((cc.crew || []).filter(c => c.job === 'Director')));
      const seen = new Set();
      const items = [];
      for (const x of pool.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))) {
        const it = API.item(x);
        const k = it.type + ':' + it.id;
        if (seen.has(k) || (!it.poster && !API.demo())) continue;
        if (x.media_type === 'tv' && (x.genre_ids || []).some(g => g === 10767 || g === 10763)) continue; // programas de entrevistas y noticieros
        seen.add(k);
        it.role = x.character || x.job || '';
        items.push(it);
      }
      const born = [p.birthday ? 'Nació el ' + p.birthday.split('-').reverse().join('/') : '', p.place_of_birth || ''].filter(Boolean).join(' en ');
      clear(root);
      root.appendChild(h('div', { class: 'pers-head' },
        h('div', { class: 'photo' }, p.profile_path ? h('img', { src: API.img(p.profile_path, 'w342'), alt: '' }) : initials(p.name)),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          h('div', { class: 'big', style: { color: 'var(--a1)' } }, p.name),
          h('div', { style: { fontSize: '20px' } }, [dept(p.known_for_department), born].filter(Boolean).join(' · ')),
          bio ? h('p', { class: 'bio', style: { margin: 0 } }, bio) : null,
          h('div', { class: 'vt muted', style: { fontSize: '19px' } }, items.length + ' títulos en el videoclub · ordenados por más vistos'))));
      const g = h('div', { class: 'grid', style: { padding: '12px 40px 40px' } },
        items.map(it => card(it, { sub: [it.year, it.role].filter(Boolean).join(' · ') })));
      root.appendChild(g);
    })().catch(e => { clear(root); root.appendChild(emptyEl('Ups', errorText(e))); });
    return { el: root, ready };
  }
};

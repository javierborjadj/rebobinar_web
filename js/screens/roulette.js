/* ¿Qué veo hoy?: ruleta del videoclub según tiempo, ganas y época */
'use strict';

Screens.roulette = {
  nav: '¿Qué veo hoy?',
  render(params) {
    params.time = params.time || 'any';
    params.type = params.type || 'movie';
    params.era = params.era || 'any';
    params.genres = params.genres || [];
    params.recent = params.recent || [];

    const MOODS = [['accion', 'Acción', 28, 10759], ['comedia', 'Comedia', 35, 35], ['terror', 'Terror', 27, 9648], ['suspenso', 'Suspenso', 53, 9648],
      ['scifi', 'Ciencia ficción', 878, 10765], ['drama', 'Drama', 18, 18], ['animacion', 'Animación', 16, 16], ['romance', 'Romance', 10749, 18],
      ['aventura', 'Aventura', 12, 10759], ['crimen', 'Crimen', 80, 80]];
    const left = h('div', { class: 'left' });
    const res = h('div', { class: 'res' });
    let spinning = false;

    const group = (label, opts, isOn, onPick) => h('div', { class: 'grp' }, h('div', { class: 'l' }, label),
      h('div', { class: 'opts mem' }, opts.map(([k, l]) => h('button', { class: 'opt' + (isOn(k) ? ' on' : ''), f: true, 'data-k': label + k, onclick: () => { onPick(k); drawLeft(); Nav.restore(label + k); } }, l))));

    const drawLeft = () => {
      clear(left);
      appendKids(left, [
        h('div', { class: 'bg neon', style: { fontSize: '36px', lineHeight: 1 } }, '¿QUÉ ALQUILAMOS HOY?'),
        group('TENGO', [['90', '90 min'], ['130', '2 horas'], ['any', 'Sin apuro']], k => params.time === k, k => { params.time = k; }),
        group('TIPO', [['movie', 'Película'], ['tv', 'Serie']], k => params.type === k, k => { params.type = k; }),
        group('ÉPOCA', [['any', 'Cualquiera'], ['classic', 'Clásico'], ['1980', '80s'], ['1990', '90s'], ['2000', '2000s'], ['new', 'Reciente']], k => params.era === k, k => { params.era = k; }),
        group('GANAS DE (podés marcar varias)', MOODS.map(m => [m[0], m[1]]), k => params.genres.includes(k), k => {
          params.genres = params.genres.includes(k) ? params.genres.filter(x => x !== k) : params.genres.concat(k);
        }),
        h('button', { class: 'spinbtn f', tabindex: -1, 'data-autofocus': '', 'data-k': 'spin', onclick: () => spin() }, 'GIRAR LA RULETA')
      ]);
      $$('.spinbtn', left).forEach(b => b.classList.add('f'));
    };

    const query = () => {
      const t = params.type;
      const [gte, lte] = Q.dateKeys(t);
      const p = { sort_by: 'popularity.desc', 'vote_count.gte': t === 'movie' ? 150 : 60, 'vote_average.gte': 6.3 };
      const gids = params.genres.map(k => { const m = MOODS.find(x => x[0] === k); return m ? m[t === 'movie' ? 2 : 3] : null; }).filter(Boolean);
      if (gids.length) p.with_genres = Array.from(new Set(gids)).join('|');
      if (params.time !== 'any') p['with_runtime.lte'] = t === 'movie' ? params.time : 60;
      if (params.era === 'classic') { p[lte] = yearsAgo(25); p['vote_count.gte'] = 600; }
      else if (params.era === 'new') { p[gte] = daysFromNow(-730); }
      else if (/^\d{4}$/.test(params.era)) { p[gte] = params.era + '-01-01'; p[lte] = (Number(params.era) + 9) + '-12-31'; }
      return p;
    };

    const spin = async () => {
      if (spinning) return;
      spinning = true;
      const t = params.type;
      try {
        const base = query();
        const first = await Q.discover(t, Object.assign({}, base, { page: 1 }));
        if (!first.items.length) { showEmpty(); return; }
        const pages = Math.min(first.total, 8);
        const pg = 1 + Math.floor(Math.random() * pages);
        const r = pg === 1 ? first : await Q.discover(t, Object.assign({}, base, { page: pg }));
        let pool = (r.items.length ? r.items : first.items).filter(i => !Lists.has(i.type, i.id, 'seen') && !params.recent.includes(i.type + ':' + i.id));
        if (!pool.length) pool = r.items.length ? r.items : first.items;
        const win = pick(pool);
        params.recent = [win.type + ':' + win.id].concat(params.recent).slice(0, 20);
        // efecto ruleta
        const flick = shuffle(first.items.concat(r.items)).slice(0, 9);
        for (const f of flick) { drawResult(f, true); await sleep(85); }
        await drawResult(win, false);
      } catch (e) { clear(res); res.appendChild(emptyEl('Ups', errorText(e))); }
      finally { spinning = false; }
    };

    const showEmpty = () => { clear(res); res.appendChild(emptyEl('No hay nada así', 'Sacá algún filtro o desactivá «Solo mis plataformas».')); };

    let shown = null;
    const drawResult = async (it, quick) => {
      clear(res);
      const c = card(it, { sticker: quick ? null : '¡ESTA!', sub: '' });
      res.appendChild(c);
      const meta = h('div', { style: { fontSize: '22px' } }, [it.year, it.vote ? '★ ' + it.vote.toFixed(1) : '', it.type === 'tv' ? 'Serie' : 'Película'].filter(Boolean).join(' · '));
      const where = h('div', { class: 'muted', style: { fontSize: '21px' } }, quick ? '' : 'Buscando dónde está…');
      const extra = h('div', { class: 'muted', style: { fontSize: '19px', lineHeight: 1.3, maxWidth: '420px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, quick ? '' : it.overview);
      const btns = h('div', { class: 'actions', style: { marginTop: '6px' } });
      const info = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 } },
        h('div', { class: 'vt', style: { fontSize: '22px', color: 'var(--a2)' } }, quick ? 'GIRANDO…' : 'TIRADA Nº ' + params.recent.length),
        h('div', { class: 'bg', style: { fontSize: '32px', color: 'var(--a1)', lineHeight: 1.05 } }, it.title), meta, where, extra, btns);
      res.appendChild(info);
      if (quick) return;
      shown = it;
      appendKids(btns, [
        h('button', { class: 'btn pri', f: true, 'data-k': 'ficha', onclick: () => App.go('detail', { type: it.type, id: it.id }) }, 'Ver ficha'),
        h('button', { class: 'btn', f: true, onclick: () => spin() }, 'Otra'),
        h('button', { class: 'btn', f: true, onclick: async () => {
          try { const d = await API.tmdb('/' + it.type + '/' + it.id, { append_to_response: 'videos', include_video_language: 'es,en,null' }); Trailer.popup(Trailer.pick((d.videos || {}).results), it.title); } catch (e) { toast(errorText(e)); }
        } }, 'Tráiler'),
        h('button', { class: 'btn', f: true, onclick: () => { const on = Lists.toggle(it, 'pend'); toast(on ? 'Agregada a tu lista' : 'Sacada de tu lista'); } }, '+ Mi lista')
      ]);
      Nav.focus($('.btn.pri', btns));
      try {
        const pr = await API.providersFor(it.type, it.id);
        if (shown !== it) return;
        const names = providerNames(pr);
        where.textContent = names.length ? 'En ' + names.slice(0, 3).join(', ') : 'No está en streaming en tu país';
      } catch (e) { where.textContent = ''; }
    };

    drawLeft();
    res.appendChild(h('div', { class: 'empty', style: { textAlign: 'left' } }, h('span', { class: 'bg' }, 'Elegí y girá'), 'Marcá cuánto tiempo tenés y qué tenés ganas de ver.'));
    return { el: h('div', { class: 'roul' }, left, res) };
  }
};

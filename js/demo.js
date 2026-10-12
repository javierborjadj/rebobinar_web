/* Modo demo: datos de ejemplo para probar la app sin claves de API */
'use strict';

const Demo = (() => {
  const P = { netflix: [8, 'Netflix'], max: [1899, 'Max'], disney: [337, 'Disney Plus'], prime: [119, 'Amazon Prime Video'],
    paramount: [531, 'Paramount Plus'], apple: [350, 'Apple TV+'], mubi: [11, 'MUBI'], crunchy: [283, 'Crunchyroll'],
    youtube: [192, 'YouTube'], pluto: [300, 'Pluto TV'], play: [3, 'Google Play Movies'], mercado: [2001, 'Mercado Play'], flow: [2002, 'Flow'] };
  const GM = [[28, 'Acción'], [12, 'Aventura'], [16, 'Animación'], [35, 'Comedia'], [80, 'Crimen'], [99, 'Documental'], [18, 'Drama'],
    [10751, 'Familia'], [14, 'Fantasía'], [36, 'Historia'], [27, 'Terror'], [10402, 'Música'], [9648, 'Misterio'], [10749, 'Romance'],
    [878, 'Ciencia ficción'], [53, 'Suspenso'], [10752, 'Bélica'], [37, 'Western']];
  const GT = [[10759, 'Acción y aventura'], [16, 'Animación'], [35, 'Comedia'], [80, 'Crimen'], [99, 'Documental'], [18, 'Drama'],
    [10751, 'Familia'], [9648, 'Misterio'], [10765, 'Ciencia ficción y fantasía'], [10768, 'Guerra y política'], [37, 'Western']];
  const rel = n => daysFromNow(-n);

  // [id, título, fecha, géneros, duración, nota, plataformas]
  const M = [
    [105, 'Volver al futuro', '1985-07-03', [12, 35, 878], 116, 8.3, ['netflix']],
    [348, 'Alien: el octavo pasajero', '1979-05-25', [27, 878], 117, 8.2, ['disney']],
    [578, 'Tiburón', '1975-06-20', [27, 53, 12], 124, 7.7, ['netflix']],
    [603, 'Matrix', '1999-03-30', [28, 878], 136, 8.2, ['max']],
    [680, 'Tiempos violentos', '1994-09-10', [53, 80], 154, 8.5, ['prime']],
    [18079, 'Nueve reinas', '2000-08-31', [80, 53, 18], 114, 7.9, ['netflix']],
    [807, 'Pecados capitales', '1995-09-22', [80, 9648, 53], 127, 8.4, ['max']],
    [280, 'Terminator 2', '1991-07-03', [28, 878, 53], 137, 8.1, ['prime']],
    [275, 'Fargo', '1996-03-08', [80, 18, 53], 98, 7.9, ['prime']],
    [862, 'Toy Story', '1995-10-30', [16, 12, 35, 10751], 81, 8.0, ['disney']],
    [694, 'El resplandor', '1980-05-23', [27, 53], 144, 8.2, ['max']],
    [1091, 'La cosa', '1982-06-25', [27, 9648, 878], 109, 8.1, ['prime']],
    [609, 'Poltergeist', '1982-06-04', [27, 53], 114, 7.1, ['max']],
    [377, 'Pesadilla en lo profundo de la noche', '1984-11-09', [27], 91, 7.3, ['max']],
    [9426, 'La mosca', '1986-08-15', [27, 878], 96, 7.4, ['disney']],
    [9003, 'Hellraiser', '1987-09-11', [27], 94, 6.9, ['paramount']],
    [679, 'Aliens: el regreso', '1986-07-18', [28, 27, 878], 137, 7.9, ['disney']],
    [539, 'Psicosis', '1960-06-22', [27, 53, 9648], 109, 8.4, ['paramount']],
    [9552, 'El exorcista', '1973-12-26', [27], 122, 7.7, ['max']],
    [948, 'Halloween', '1978-10-25', [27, 53], 91, 7.5, ['prime']],
    [78, 'Blade Runner', '1982-06-25', [878, 18, 53], 117, 7.9, ['max']],
    [85, 'Los cazadores del arca perdida', '1981-06-12', [12, 28], 115, 7.9, ['paramount']],
    [601, 'E.T., el extraterrestre', '1982-06-11', [878, 12, 10751], 115, 7.5, ['netflix']],
    [11, 'La guerra de las galaxias', '1977-05-25', [12, 28, 878], 121, 8.2, ['disney']],
    [238, 'El padrino', '1972-03-14', [18, 80], 175, 8.7, ['paramount']],
    [13, 'Forrest Gump', '1994-06-23', [35, 18, 10749], 142, 8.5, ['netflix']],
    [120, 'El señor de los anillos', '2001-12-18', [12, 14, 28], 179, 8.4, ['max']],
    [155, 'Batman: el caballero de la noche', '2008-07-16', [18, 28, 80], 152, 8.5, ['max']],
    [27205, 'El origen', '2010-07-15', [28, 878, 12], 148, 8.4, ['netflix']],
    [1001, 'Una batalla tras otra', rel(5), [28, 80, 53], 161, 7.9, ['max']],
    [1002, 'Pecadores', rel(9), [27, 28, 53], 138, 7.6, ['max']],
    [1003, 'Frankenstein', rel(12), [27, 14, 18], 150, 7.8, ['netflix']],
    [1004, 'F1', rel(20), [28, 18], 155, 7.6, ['apple']],
    [1005, 'Superman', rel(35), [878, 12, 28], 129, 7.3, ['max']],
    [1006, 'La hora de la desaparición', rel(42), [27, 9648], 128, 7.4, ['max']],
    [1007, 'Zootopia 2', rel(60), [16, 10751, 35], 108, 7.6, ['disney']],
    [1008, 'Misión imposible: sentencia final', rel(70), [28, 12, 53], 169, 7.2, ['paramount']],
    [1009, 'Estreno en cines (ejemplo)', rel(3), [18], 110, 0, []],
    [1010, 'Próximo estreno (ejemplo)', daysFromNow(14), [35], 100, 0, []]
  ];
  const T = [
    [2001, 'El Eternauta', rel(40), [10765, 18, 9648], 50, 7.9, ['netflix'], 1],
    [2002, 'Stranger Things', '2016-07-15', [10765, 9648, 18], 55, 8.6, ['netflix'], 5],
    [2003, 'The Last of Us', '2023-01-15', [18, 10765, 10759], 55, 8.6, ['max'], 2],
    [2004, 'Merlina', '2022-11-23', [35, 80, 10765], 50, 8.4, ['netflix'], 2],
    [2005, 'Andor', '2022-09-21', [10765, 10759, 18], 45, 8.3, ['disney'], 2],
    [2006, 'Separación', '2022-02-17', [18, 9648, 10765], 50, 8.4, ['apple'], 2],
    [2007, 'The Bear', '2022-06-23', [18, 35], 32, 8.1, ['disney'], 4],
    [2008, 'Alien: Planeta Tierra', rel(55), [10765, 18], 55, 7.7, ['disney'], 1],
    [2009, 'Adolescencia', rel(90), [80, 18], 60, 8.1, ['netflix'], 1],
    [2010, 'The Pitt', rel(120), [18], 50, 8.6, ['max'], 1],
    [2011, 'Los Simuladores', '2002-04-08', [35, 80], 45, 8.5, ['youtube'], 2],
    [2012, 'Friends', '1994-09-22', [35], 22, 8.4, ['max'], 10]
  ];
  const PEOPLE = [
    [9001, 'Michael J. Fox', 'Acting'], [9002, 'Christopher Lloyd', 'Acting'], [9003, 'Lea Thompson', 'Acting'],
    [9004, 'Crispin Glover', 'Acting'], [9005, 'Robert Zemeckis', 'Directing'], [9006, 'Ricardo Darín', 'Acting'],
    [9007, 'Sigourney Weaver', 'Acting'], [9008, 'John Carpenter', 'Directing']
  ];

  const prov = keys => keys.map(k => ({ provider_id: P[k][0], provider_name: P[k][1], logo_path: null, display_priority: 1 }));
  const mrow = m => ({ id: m[0], title: m[1], original_title: m[1], release_date: m[2], genre_ids: m[3], vote_average: m[5], vote_count: 2000, poster_path: null, backdrop_path: null, overview: overviewFor(m[1]), popularity: 100 - (m[0] % 90) });
  const trow = t => ({ id: t[0], name: t[1], original_name: t[1], first_air_date: t[2], genre_ids: t[3], vote_average: t[5], vote_count: 900, poster_path: null, backdrop_path: null, overview: overviewFor(t[1]), popularity: 100 - (t[0] % 90) });
  function overviewFor(t) {
    if (t === 'Volver al futuro') return 'Marty McFly, un adolescente de 1985, viaja por accidente a 1955 en el DeLorean que su amigo Doc Brown convirtió en máquina del tiempo. Allá tiene que lograr que sus padres se enamoren para no borrarse de la existencia.';
    return 'Sinopsis de ejemplo. En la app con tu clave de TMDB acá aparece la sinopsis real de «' + t + '».';
  }
  const page = (arr, p) => { p = Number(p || 1); const per = 20; return { page: p, total_pages: Math.max(1, Math.ceil(arr.length / per)), total_results: arr.length, results: arr.slice((p - 1) * per, p * per) }; };

  function filterDiscover(rows, params, type) {
    const dk = type === 'movie' ? 2 : 2;
    let r = rows.slice();
    const gte = params['primary_release_date.gte'] || params['first_air_date.gte'] || params['air_date.gte'];
    const lte = params['primary_release_date.lte'] || params['first_air_date.lte'];
    if (params.with_genres) { const gs = String(params.with_genres).split(/[,|]/).map(Number); r = r.filter(x => x[3].some(g => gs.includes(g))); }
    if (gte) r = r.filter(x => x[dk] >= gte);
    if (lte) r = r.filter(x => x[dk] <= lte);
    if (params['with_runtime.lte']) r = r.filter(x => x[4] <= Number(params['with_runtime.lte']));
    if (params['vote_average.gte']) r = r.filter(x => x[5] >= Number(params['vote_average.gte']));
    if (params.with_watch_providers) {
      const ids = String(params.with_watch_providers).split('|').map(Number);
      r = r.filter(x => x[6].some(k => ids.includes(P[k][0])));
    } else r = r.filter(x => x[6].length || !params.watch_region);
    const s = params.sort_by || 'popularity.desc';
    if (s.startsWith('vote')) r.sort((a, b) => b[5] - a[5]);
    else if (s.includes('date')) r.sort((a, b) => b[2].localeCompare(a[2]));
    else r.sort((a, b) => (b[2] > daysFromNow(-200) ? 1 : 0) - (a[2] > daysFromNow(-200) ? 1 : 0) || b[5] - a[5]);
    return r;
  }

  function details(type, id) {
    const isM = type === 'movie';
    const row = (isM ? M : T).find(x => x[0] === id) || (isM ? M[0] : T[0]);
    const base = isM ? mrow(row) : trow(row);
    const cast = PEOPLE.slice(0, 4).map((p, i) => ({ id: p[0], name: p[1], character: ['Marty McFly', 'Doc Brown', 'Lorraine Baines', 'George McFly'][i], profile_path: null }));
    const crew = [{ id: 9005, name: 'Robert Zemeckis', job: 'Director' }];
    const keys = row[6];
    const results = {};
    results[Settings.get('region')] = {
      link: 'https://www.themoviedb.org', flatrate: prov(keys),
      rent: keys.length ? prov(['prime', 'play']) : undefined, buy: keys.length ? prov(['apple']) : undefined
    };
    const rec = (isM ? M : T).filter(x => x[0] !== id).slice(0, 10).map(isM ? mrow : trow);
    return Object.assign(base, {
      runtime: isM ? row[4] : undefined, episode_run_time: isM ? undefined : [row[4]],
      number_of_seasons: isM ? undefined : row[7], number_of_episodes: isM ? undefined : row[7] * 8,
      genres: row[3].map(g => ({ id: g, name: ((isM ? GM : GT).find(x => x[0] === g) || [0, ''])[1] })).filter(g => g.name),
      tagline: '', status: 'Released',
      created_by: isM ? undefined : [{ id: 9008, name: 'Creador de ejemplo' }],
      credits: { cast, crew },
      videos: { results: [{ key: 'qvsgGtivCgs', site: 'YouTube', type: 'Trailer', official: true, iso_639_1: 'en', name: 'Tráiler' }] },
      'watch/providers': { results },
      external_ids: { imdb_id: 'tt0088763' },
      release_dates: { results: [{ iso_3166_1: 'AR', release_dates: [{ certification: 'ATP', type: 3 }] }] },
      content_ratings: { results: [{ iso_3166_1: 'AR', rating: '13' }] },
      recommendations: { results: rec }
    });
  }

  function tmdb(path, params) {
    const r = (() => {
      if (path === '/genre/movie/list') return { genres: GM.map(g => ({ id: g[0], name: g[1] })) };
      if (path === '/genre/tv/list') return { genres: GT.map(g => ({ id: g[0], name: g[1] })) };
      if (path.startsWith('/watch/providers/')) return { results: Object.values(P).map((p, i) => ({ provider_id: p[0], provider_name: p[1], logo_path: null, display_priority: i })) };
      if (path === '/discover/movie') return page(filterDiscover(M.filter(m => m[6].length || !params.with_watch_providers), params, 'movie').map(mrow), params.page);
      if (path === '/discover/tv') return page(filterDiscover(T, params, 'tv').map(trow), params.page);
      if (path === '/movie/now_playing') return page(M.filter(m => m[2] <= daysFromNow(0) && m[2] >= daysFromNow(-45)).map(mrow), params.page);
      if (path === '/movie/upcoming') return page(M.filter(m => m[2] > daysFromNow(0)).map(mrow), params.page);
      if (path === '/trending/all/week') return page(M.slice(29, 37).map(m => Object.assign(mrow(m), { media_type: 'movie' })).concat(T.slice(0, 4).map(t => Object.assign(trow(t), { media_type: 'tv' }))), 1);
      if (path === '/search/multi') {
        const q = norm(params.query);
        const words = q.split(' ').filter(Boolean);
        const hit = s => words.every(w => norm(s).includes(w));
        const res = M.filter(m => hit(m[1])).map(m => Object.assign(mrow(m), { media_type: 'movie' }))
          .concat(T.filter(t => hit(t[1])).map(t => Object.assign(trow(t), { media_type: 'tv' })))
          .concat(PEOPLE.filter(p => hit(p[1])).map(p => ({ id: p[0], name: p[1], media_type: 'person', known_for_department: p[2], profile_path: null, known_for: [mrow(M[0])] })));
        return page(res, 1);
      }
      let m;
      if ((m = path.match(/^\/(movie|tv)\/(\d+)\/watch\/providers$/))) return { results: details(m[1], Number(m[2]))['watch/providers'].results };
      if ((m = path.match(/^\/(movie|tv)\/(\d+)$/))) return details(m[1], Number(m[2]));
      if ((m = path.match(/^\/person\/(\d+)$/))) {
        const p = PEOPLE.find(x => x[0] === Number(m[1])) || PEOPLE[0];
        return { id: p[0], name: p[1], known_for_department: p[2], birthday: '1961-06-09', place_of_birth: 'Ejemplo', biography: 'Biografía de ejemplo. Con tu clave de TMDB aparece la real.', profile_path: null,
          combined_credits: { cast: M.slice(0, 12).map(x => Object.assign(mrow(x), { media_type: 'movie', character: 'Personaje' })), crew: [] } };
      }
      return { results: [], page: 1, total_pages: 1 };
    })();
    return new Promise(res => setTimeout(() => res(JSON.parse(JSON.stringify(r))), 120));
  }

  function omdb() { return Promise.resolve({ imdb: '8.5', rt: '93%', mc: '87' }); }

  return { tmdb, omdb };
})();

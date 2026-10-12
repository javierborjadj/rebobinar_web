/* Ajustes: plataformas, claves de API, visualización, región, contenido, panel del celular */
'use strict';

Screens.settings = {
  nav: 'Ajustes',
  render(params) {
    params.sec = params.sec || 'plats';
    const SECS = [['plats', 'Mis plataformas'], ['keys', 'Claves de API'], ['look', 'Visualización'], ['region', 'Región e idioma'],
      ['content', 'Contenido'], ['phone', 'Panel del celular'], ['about', 'Acerca de']];
    const side = h('aside', { class: 'aside mem' }, h('div', { class: 'vt muted', style: { fontSize: '19px', letterSpacing: '2px', marginBottom: '6px' } }, 'AJUSTES'));
    const panel = h('div', { class: 'set-panel sy' });

    const drawSide = () => {
      $$('.side', side).forEach(b => b.remove());
      for (const [k, l] of SECS) {
        const b = h('button', { class: 'side' + (params.sec === k ? ' on' : ''), f: true, 'data-k': 's-' + k, 'data-autofocus': params.sec === k ? '' : null, onclick: () => { params.sec = k; drawSide(); drawPanel(); Nav.restore('s-' + k); } }, l);
        side.appendChild(b);
        if (params.sec === k) side._last = b;
      }
    };

    const title = (t, sub) => [h('div', { class: 'bg', style: { fontSize: '26px', color: 'var(--a1)' } }, t), sub ? h('p', { class: 'muted', style: { margin: '4px 0 14px', fontSize: '19px' } }, sub) : null];

    /** Fila de opciones: [[valor, texto]] */
    const optRow = (label, sub, key, opts, after) => {
      const row = h('div', { class: 'set-row' }, h('div', { class: 'lbl' }, label, sub ? h('small', null, sub) : null));
      const box = h('div', { class: 'opts mem' });
      const draw = () => {
        clear(box);
        for (const [v, l] of opts) {
          const on = String(Settings.get(key)) === String(v);
          const b = h('button', { class: 'chip' + (on ? ' on' : ''), f: true, 'data-k': key + '=' + v, onclick: () => { Settings.set(key, v); draw(); Nav.restore(key + '=' + v); if (after) after(v); } }, l);
          box.appendChild(b);
          if (on) box._last = b;
        }
      };
      draw();
      row.appendChild(box);
      return row;
    };

    const sections = {
      plats() {
        appendKids(panel, title('Mis plataformas', 'Marcá las que pagás. Con «Solo mis plataformas» activado, la app muestra solo lo que podés ver.'));
        panel.appendChild(optRow('Solo mis plataformas', 'filtra Inicio, Géneros y Estrenos', 'onlyMine', [[true, 'Activado'], [false, 'Ver todo']], () => App.drawNav()));
        const gridEl = h('div', { class: 'provgrid', style: { marginTop: '12px' } }, spinnerEl());
        const count = h('div', { class: 'vt muted', style: { fontSize: '19px', margin: '10px 0' } });
        panel.appendChild(count);
        panel.appendChild(gridEl);
        API.loadProviders().then(list => {
          clear(gridEl);
          const sel = () => Settings.get('providers') || [];
          const upd = () => { count.textContent = sel().length + ' marcadas · ' + list.length + ' disponibles en ' + regionName(Settings.get('region')); };
          upd();
          for (const p of list.slice(0, 48)) {
            const on = () => sel().includes(p.provider_id);
            const b = h('button', { class: 'provbtn' + (on() ? ' on' : ''), f: true, 'data-k': 'p' + p.provider_id, onclick: () => {
              const s = sel();
              Settings.set('providers', on() ? s.filter(x => x !== p.provider_id) : s.concat(p.provider_id));
              b.classList.toggle('on', on()); $('.box', b).textContent = on() ? '✓' : ''; upd();
            } },
              h('span', { class: 'box' }, on() ? '✓' : ''),
              p.logo_path ? h('img', { src: API.img(p.logo_path, 'w92'), alt: '' }) : null,
              h('span', { class: 'n' }, p.provider_name));
            gridEl.appendChild(b);
          }
        }).catch(e => { clear(gridEl); gridEl.appendChild(emptyEl('Ups', errorText(e))); });
      },

      keys() {
        appendKids(panel, title('Claves de API', 'Se guardan solo en esta TV. Lo más cómodo es cargarlas desde el celular.'));
        const card = (name, key, desc, where, layout) => {
          const val = Settings.get(key);
          const status = h('div', { class: val ? 'status-ok' : 'status-bad' }, val ? '● CARGADA' : '● FALTA');
          const shown = val ? (val.length > 12 ? val.slice(0, 6) + '••••••••' + val.slice(-4) : val.slice(0, 2) + '••••' + val.slice(-2)) : '(vacía)';
          const c = h('div', { class: 'keycard' },
            h('div', { style: { display: 'flex', alignItems: 'center' } }, h('div', { class: 'bg', style: { fontSize: '18px' } }, name), h('div', { style: { marginLeft: 'auto' } }, status)),
            h('div', { class: 'muted', style: { fontSize: '17px' } }, desc),
            h('div', { class: 'keyval' }, shown),
            h('div', { class: 'muted', style: { fontSize: '16px' } }, where),
            h('div', { class: 'actions' },
              h('button', { class: 'btn sm', f: true, onclick: () => UI.phonePanel('Escaneá el QR y pegá las claves en el celular.') }, 'Cargar desde el celular'),
              h('button', { class: 'btn sm', f: true, onclick: async () => {
                const v = await UI.prompt({ title: 'Clave de ' + name, value: '', layout, secret: true, text: layout === 'hex' ? 'Escribí la clave (letras a-f y números).' : '' });
                if (v != null && v.trim()) await App.saveKey(key, v.trim());
                App.reload();
              } }, 'Escribir con el control'),
              val ? h('button', { class: 'btn sm', f: true, onclick: async () => {
                status.className = 'status-ok'; status.textContent = 'PROBANDO…';
                try { key === 'tmdbKey' ? await API.testTmdb(val) : await API.testOmdb(val); status.textContent = '● FUNCIONA'; }
                catch (e) { status.className = 'status-bad'; status.textContent = '● ' + (e.status === 0 ? 'SIN CONEXIÓN' : 'NO FUNCIONA'); }
              } }, 'Probar') : null,
              val && key === 'omdbKey' ? h('button', { class: 'btn sm', f: true, onclick: () => { Settings.set('omdbKey', ''); App.reload(); } }, 'Borrar') : null));
          panel.appendChild(c);
        };
        card('TMDB', 'tmdbKey', 'Catálogo, pósteres, tráileres y en qué plataforma está cada título. Obligatoria.', 'Gratis en themoviedb.org › Configuración › API. Sirve la «clave de API» o el «token de lectura».', 'hex');
        card('OMDb', 'omdbKey', 'Notas de IMDb, Rotten Tomatoes y Metacritic. Opcional (1.000 consultas por día).', 'Gratis en omdbapi.com › API Key (llega por mail).', 'hex');
      },

      look() {
        appendKids(panel, title('Visualización'));
        panel.appendChild(optRow('Tema del videoclub', null, 'theme', [['neon', 'Neón'], ['barrio', 'De barrio'], ['verde', 'Monitor verde']], () => App.applyLook()));
        panel.appendChild(optRow('Efectos de TV vieja', null, 'fx', [['scan', 'Líneas de TV'], ['grain', 'Grano VHS'], ['none', 'Ninguno']], () => App.applyLook()));
        panel.appendChild(optRow('Tamaño de las cajas', null, 'posterSize', [['s', 'Chico'], ['m', 'Mediano'], ['l', 'Grande']], () => App.applyLook()));
        panel.appendChild(optRow('Tráiler en la ficha', null, 'trailerMode', [['auto', 'Arranca solo'], ['manual', 'Solo si lo pido']]));
        panel.appendChild(optRow('Arranca después de', null, 'trailerDelay', [[3, '3 seg'], [5, '5 seg'], [8, '8 seg'], [10, '10 seg']]));
        panel.appendChild(optRow('Sonido del tráiler en la ficha', 'el popup siempre tiene sonido', 'trailerSound', [[false, 'Mudo'], [true, 'Con sonido']]));
        panel.appendChild(optRow('Salvapantallas', 'pósteres de fondo con reloj', 'saver', [[5, '5 min'], [10, '10 min'], [15, '15 min'], [0, 'Nunca']]));
      },

      region() {
        appendKids(panel, title('Región e idioma', 'El país define en qué plataformas está cada título y la cartelera de cines.'));
        panel.appendChild(optRow('País', null, 'region', [['AR', 'Argentina'], ['UY', 'Uruguay'], ['CL', 'Chile'], ['MX', 'México'], ['CO', 'Colombia'], ['PE', 'Perú'], ['ES', 'España'], ['US', 'EE. UU.']],
          () => { API.mem.clear(); API.loadProviders().catch(() => { }); }));
        panel.appendChild(optRow('Idioma de títulos y sinopsis', null, 'lang', [['es-MX', 'Español latino'], ['es-ES', 'Español de España'], ['en-US', 'Inglés']], () => API.mem.clear()));
      },

      content() {
        appendKids(panel, title('Contenido'));
        panel.appendChild(optRow('Ocultar lo que ya vi', 'en Inicio, Géneros y Estrenos', 'hideWatched', [[false, 'No'], [true, 'Sí']]));
        panel.appendChild(optRow('Nota mínima', 'según TMDB', 'minRating', [[0, 'Cualquiera'], [6, '6 o más'], [7, '7 o más'], [8, '8 o más']]));
        panel.appendChild(optRow('Al tocar «Ver en…»', 'algunas apps no aceptan la búsqueda', 'openMode', [['search', 'Abrir y buscar el título'], ['launch', 'Solo abrir la app']]));
      },

      phone() {
        appendKids(panel, title('Panel del celular', 'Con el celular en el mismo Wi-Fi, escaneá el QR: cargás claves, escribís búsquedas y hacés el respaldo de tu lista.'));
        const url = Native.panelUrl();
        if (!url) { panel.appendChild(h('p', null, Native.available ? 'La TV no tiene una red local. Conectala al Wi-Fi o por cable.' : 'Disponible en la TV.')); }
        else {
          const qr = Native.qr(url, 360);
          panel.appendChild(h('div', { class: 'qrbox' }, qr ? h('img', { src: qr, alt: 'QR' }) : null, h('div', { class: 'url' }, url)));
        }
        panel.appendChild(h('button', { class: 'btn', f: true, style: { marginTop: '16px' } , onclick: () => App.reload() }, 'Actualizar'));
      },

      about() {
        appendKids(panel, title('Rebobinar', 'Versión ' + Native.version() + ' · tu videoclub para Android TV'));
        panel.appendChild(h('p', { style: { fontSize: '18px', lineHeight: 1.4, maxWidth: '820px' } },
          'Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB. Los datos de disponibilidad en plataformas son de JustWatch. Las notas de IMDb, Rotten Tomatoes y Metacritic vienen de OMDb. La app no reproduce películas: te muestra qué ver y abre la app de cada plataforma.'));
        panel.appendChild(optRow('Modo demo', 'datos de ejemplo, sin claves', 'demo', [[false, 'Apagado'], [true, 'Encendido']], () => { API.mem.clear(); App.reload(); }));
        panel.appendChild(h('div', { class: 'actions', style: { marginTop: '12px' } },
          h('button', { class: 'btn', f: true, onclick: () => {
            Object.keys(localStorage).filter(k => k.startsWith('rb.c.') || k.startsWith('rb.omdb.')).forEach(k => LS.del(k));
            API.mem.clear(); toast('Caché borrada');
          } }, 'Borrar caché'),
          h('button', { class: 'btn', f: true, onclick: async () => {
            if (await UI.confirm('¿Borrar todo?', 'Se borran tu lista, tus puntajes, los ajustes y las claves de API de esta TV.', 'Borrar todo')) {
              try { localStorage.clear(); } catch (e) { }
              location.reload();
            }
          } }, 'Borrar todo')));
      }
    };

    const drawPanel = () => { clear(panel); panel.scrollTop = 0; sections[params.sec](); };
    drawSide();
    drawPanel();
    return { el: h('div', { class: 'split' }, side, panel) };
  }
};

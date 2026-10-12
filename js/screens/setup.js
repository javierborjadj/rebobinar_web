/* Primer uso: bienvenida y carga de la clave de TMDB */
'use strict';

Screens.setup = {
  nav: null,
  hideNav: true,
  render() {
    const url = Native.panelUrl();
    const qr = url ? Native.qr(url, 300) : '';
    const qrBlock = url
      ? h('div', { class: 'qrbox', style: { justifyContent: 'center' } }, qr ? h('img', { src: qr, alt: 'QR', style: { width: '170px', height: '170px' } }) : null,
          h('div', { style: { textAlign: 'left', maxWidth: '520px' } },
            h('p', null, 'Escaneá con el celular (mismo Wi-Fi) y pegá ahí tus claves.'),
            h('div', { class: 'url', style: { fontSize: '20px' } }, url)))
      : null;
    const root = h('div', { class: 'setup' },
      h('div', { class: 'logo' }, 'REBOBINAR'),
      h('div', { class: 'tag' }, '◀◀ TU VIDEOCLUB EN LA TELE'),
      h('p', null, 'Para armar el catálogo necesito una clave gratuita de TMDB. La de OMDb es opcional y suma las notas de IMDb, Rotten Tomatoes y Metacritic.'),
      h('div', { class: 'steps' },
        h('div', { class: 'step' }, h('b', null, '1 · TMDB'), 'Creá una cuenta en themoviedb.org › Configuración › API.'),
        h('div', { class: 'step' }, h('b', null, '2 · OMDb (opcional)'), 'Pedila en omdbapi.com › API Key. Llega por mail.'),
        h('div', { class: 'step' }, h('b', null, '3 · Plataformas'), 'Después marcás qué servicios pagás.')),
      qrBlock,
      h('div', { class: 'actions', style: { justifyContent: 'center' } },
        h('button', { class: 'btn pri', f: true, 'data-autofocus': '', onclick: async () => {
          const v = await UI.prompt({ title: 'Clave de API de TMDB', layout: 'hex', secret: true, text: 'Son 32 caracteres (letras a-f y números). El token largo conviene pegarlo desde el celular.' });
          if (v && v.trim()) App.saveKey('tmdbKey', v.trim(), true);
        } }, 'Escribir la clave con el control'),
        h('button', { class: 'btn', f: true, onclick: () => { Settings.set('demo', true); App.start(); } }, 'Probar con datos de ejemplo')));
    return { el: root };
  }
};

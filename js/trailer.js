/* Tráileres de YouTube: recuadro automático en la ficha y popup a pantalla completa */
'use strict';

const Trailer = {
  players: new Set(),
  popupPlayer: null,

  /** Elige el mejor video: tráiler en español, si no en inglés, si no un teaser */
  pick(videos, lang) {
    const v = (videos || []).filter(x => x.site === 'YouTube' && x.key);
    if (!v.length) return null;
    const l2 = (lang || 'es').slice(0, 2);
    const score = x => (x.type === 'Trailer' ? 40 : x.type === 'Teaser' ? 20 : 0) + (x.iso_639_1 === l2 ? 30 : x.iso_639_1 === 'en' ? 10 : 0) + (x.official ? 5 : 0);
    return v.sort((a, b) => score(b) - score(a))[0];
  },

  get playing() { for (const p of this.players) if (p.state === 1) return true; return false; },

  /** Crea un reproductor de YouTube controlable por mensajes (sin controles propios de YouTube) */
  player(key, opts) {
    opts = opts || {};
    const id = Math.floor(Math.random() * 1e9);
    const params = new URLSearchParams({
      autoplay: '1', mute: opts.mute ? '1' : '0', controls: '0', disablekb: '1', fs: '0', iv_load_policy: '3',
      modestbranding: '1', playsinline: '1', rel: '0', enablejsapi: '1', start: String(Math.floor(opts.start || 0)),
      origin: location.origin, widget_referrer: location.origin
    });
    const iframe = h('iframe', {
      src: 'https://www.youtube.com/embed/' + key + '?' + params.toString(),
      allow: 'autoplay; encrypted-media', referrerpolicy: 'strict-origin-when-cross-origin', tabindex: '-1', title: 'Tráiler'
    });
    const p = {
      key, iframe, id, ready: false, state: -1, time: opts.start || 0, duration: 0, volume: 100, muted: !!opts.mute,
      onState: opts.onState || null, onFail: opts.onFail || null,
      cmd(func, args) {
        try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: args || [], id, channel: 'widget' }), '*'); } catch (e) { }
      },
      destroy() {
        clearInterval(listen); clearTimeout(failTimer);
        window.removeEventListener('message', onMsg);
        Trailer.players.delete(p);
        iframe.src = 'about:blank';
        iframe.remove();
        if (!Trailer.playing) Native.keepAwake(false);
      }
    };
    let tries = 0;
    const listen = setInterval(() => {
      if (p.ready || tries++ > 30) { clearInterval(listen); return; }
      try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id, channel: 'widget' }), '*'); } catch (e) { }
    }, 400);
    const fail = code => { if (p.failed) return; p.failed = true; clearTimeout(failTimer); if (p.onFail) p.onFail(code); };
    const failTimer = setTimeout(() => { if (!p.ready) fail('timeout'); }, 12000);
    const onMsg = e => {
      if (e.source !== iframe.contentWindow) return;
      let d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
      if (!d || !d.event) return;
      if (d.event === 'onReady') { p.ready = true; clearTimeout(failTimer); if (opts.mute) p.cmd('mute'); }
      if (d.event === 'onError') fail(d.info);
      if (d.event === 'onStateChange') setState(d.info);
      if (d.event === 'infoDelivery' && d.info) {
        if (typeof d.info.currentTime === 'number') p.time = d.info.currentTime;
        if (typeof d.info.duration === 'number') p.duration = d.info.duration;
        if (typeof d.info.volume === 'number') p.volume = d.info.volume;
        if (typeof d.info.playerState === 'number') setState(d.info.playerState);
        if (!p.ready) { p.ready = true; clearTimeout(failTimer); }
      }
      if (d.event === 'initialDelivery' && d.info && d.info.duration) p.duration = d.info.duration;
    };
    const setState = s => {
      if (p.state === s) return;
      p.state = s;
      Native.keepAwake(Trailer.playing);
      if (p.onState) p.onState(s);
    };
    window.addEventListener('message', onMsg);
    this.players.add(p);
    return p;
  },

  pauseAll() { for (const p of this.players) p.cmd('pauseVideo'); },

  media() {
    const p = this.popupPlayer;
    if (!p) return false;
    p.cmd(p.state === 1 ? 'pauseVideo' : 'playVideo');
    return true;
  },

  /** Recuadro de la ficha: cuenta regresiva y arranca solo */
  box(container, video, opts) {
    const delay = Math.max(1, Number(Settings.get('trailerDelay')) || 5);
    const auto = Settings.get('trailerMode') === 'auto';
    const mute = !Settings.get('trailerSound');
    let left = delay, timer = null, player = null;
    const n = h('div', { class: 'n' }, auto ? String(left) : '▶');
    const wait = h('div', { class: 'wait' }, h('div', { class: 'vt', style: { fontSize: '22px', color: 'var(--muted)' } }, 'TRÁILER'), n,
      h('div', { class: 'vt', style: { fontSize: '20px' } }, auto ? ('arranca solo' + (mute ? ' · sin sonido' : '')) : 'OK para verlo'));
    const osd = h('div', { class: 'osd hidden' }, 'PLAY ▶ ', h('span', { style: { animation: 'blink 1s steps(1) infinite' } }, '●'));
    const osd2 = h('div', { class: 'osd2 vt hidden' }, mute ? 'SIN SONIDO' : '');
    clear(container);
    appendKids(container, [wait, osd, osd2]);

    const start = () => {
      if (player) return;
      player = this.player(video.key, {
        mute,
        onState: s => { osd.classList.toggle('hidden', s !== 1); osd2.classList.toggle('hidden', s !== 1); if (s === 1) wait.classList.add('hidden'); if (s === 0) { n.textContent = '↺'; wait.classList.remove('hidden'); } },
        onFail: () => {
          if (player) { player.destroy(); player = null; }
          clear(wait); wait.classList.remove('hidden');
          appendKids(wait, [h('div', { class: 'vt', style: { fontSize: '22px', color: 'var(--muted)' } }, 'NO SE PUEDE VER ACÁ'), h('div', { class: 'vt', style: { fontSize: '20px' } }, 'OK para abrirlo en YouTube')]);
          ctl.failed = true;
        }
      });
      container.insertBefore(player.iframe, container.firstChild);
    };
    if (auto) {
      timer = setInterval(() => {
        left--;
        n.textContent = String(Math.max(0, left));
        if (left <= 0) { clearInterval(timer); start(); }
      }, 1000);
    }
    const ctl = {
      failed: false,
      get time() { return player ? player.time : 0; },
      stop() { clearInterval(timer); if (player) { player.destroy(); player = null; } },
      pause() { if (player) player.cmd('pauseVideo'); },
      resume() { if (player) player.cmd('playVideo'); }
    };
    return ctl;
  },

  /** Popup: tráiler grande, con sonido y controles del control remoto */
  popup(video, title, startAt, onClose) {
    if (!video) { toast('Esta película no tiene tráiler cargado en TMDB'); return; }
    const osd = h('div', { class: 'osd' }, 'CARGANDO…');
    const osd2 = h('div', { class: 'osd2' }, '');
    const frame = h('div', { class: 'tv-frame' }, osd, osd2, h('div', { class: 'scan' }));
    const keys = h('div', { class: 't-keys' },
      h('span', null, h('b', null, 'OK'), ' pausa'), h('span', null, h('b', null, '◀ ▶'), ' 10 seg'),
      h('span', null, h('b', null, '▲ ▼'), ' volumen'), h('span', null, h('b', null, 'ATRÁS'), ' volver'));
    const col = h('div', { class: 't-col' },
      h('div', { class: 't-label' }, h('div', { class: 'tag' }, (title || '').toUpperCase() + ' · ' + (video.name || 'TRÁILER').toUpperCase()),
        h('div', { class: 'vt', style: { fontSize: '20px', color: 'var(--muted)' } }, video.iso_639_1 === 'es' ? 'Español' : 'Idioma original')),
      frame, keys);
    let osdTimer = null, failed = false;
    const flash = (txt, txt2) => {
      osd.textContent = txt; if (txt2 != null) osd2.textContent = txt2;
      osd.style.opacity = 1; osd2.style.opacity = 1;
      clearTimeout(osdTimer);
      osdTimer = setTimeout(() => { if (p.state === 1) { osd.style.opacity = 0; osd2.style.opacity = 0; } }, 2500);
    };
    const volTxt = v => 'VOL ' + '▮'.repeat(Math.round(v / 12.5)) + '▯'.repeat(8 - Math.round(v / 12.5));
    const p = this.player(video.key, {
      mute: false, start: startAt || 0,
      onState: s => {
        if (s === 1) flash('PLAY ▶', volTxt(p.volume));
        else if (s === 2) flash('PAUSA ❚❚');
        else if (s === 0) flash('FIN ■ · OK para repetir');
      },
      onFail: () => {
        failed = true;
        const msg = h('div', { class: 'msg' },
          h('div', { class: 'bg', style: { fontSize: '26px', color: 'var(--a1)' } }, 'ESTE VIDEO NO SE PUEDE VER ACÁ'),
          h('p', { style: { fontSize: '20px', margin: 0 } }, 'YouTube no permite reproducirlo dentro de otra app. Lo podés abrir en la app de YouTube.'),
          h('div', { class: 'row-btns', style: { display: 'flex', gap: '12px' } },
            h('button', { class: 'btn pri', f: true, 'data-autofocus': '', onclick: () => { Native.openYouTube(video.key); Layers.close(layer); } }, 'Abrir en YouTube'),
            h('button', { class: 'btn', f: true, onclick: () => Layers.close(layer) }, 'Cerrar')));
        frame.appendChild(msg);
        Nav.first(layer);
      }
    });
    frame.insertBefore(p.iframe, frame.firstChild);
    this.popupPlayer = p;
    const layer = Layers.open(col, {
      cls: 'trailer-layer', noFocus: true,
      onKey: e => {
        if (failed) return false;
        const k = e.key;
        if (k === 'Enter' || k === 'NumpadEnter' || k === ' ' || k === 'MediaPlayPause' || e.keyCode === 23) {
          if (p.state === 0) p.cmd('seekTo', [0, true]);
          p.cmd(p.state === 1 ? 'pauseVideo' : 'playVideo'); return true;
        }
        if (k === 'ArrowRight') { p.cmd('seekTo', [p.time + 10, true]); flash('▶▶ +10'); return true; }
        if (k === 'ArrowLeft') { p.cmd('seekTo', [Math.max(0, p.time - 10), true]); flash('◀◀ −10'); return true; }
        if (k === 'ArrowUp' || k === 'ArrowDown') {
          p.volume = Math.max(0, Math.min(100, p.volume + (k === 'ArrowUp' ? 12.5 : -12.5)));
          p.cmd('unMute'); p.cmd('setVolume', [p.volume]); flash(p.state === 1 ? 'PLAY ▶' : 'PAUSA ❚❚', volTxt(p.volume)); return true;
        }
        return false;
      },
      onClose: () => { p.destroy(); this.popupPlayer = null; if (onClose) onClose(); }
    });
    return layer;
  }
};

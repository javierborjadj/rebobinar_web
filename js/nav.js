/* Navegación con el control remoto: foco, flechas, OK, ATRÁS y ventanas emergentes */
'use strict';

const Layers = {
  stack: [],
  top() { return this.stack[this.stack.length - 1] || null; },
  /** Abre una ventana emergente. opts: {onKey(e), onBack(), onClose(), cls} */
  open(content, opts) {
    opts = opts || {};
    const layer = h('div', { class: 'layer ' + (opts.cls || '') }, content);
    layer._opts = opts;
    layer._prevFocus = Nav.cur;
    $('#layers').appendChild(layer);
    this.stack.push(layer);
    if (!opts.noFocus) Nav.first(layer);
    return layer;
  },
  close(layer) {
    layer = layer || this.top();
    if (!layer) return;
    const i = this.stack.indexOf(layer);
    if (i >= 0) this.stack.splice(i, 1);
    if (layer._opts.onClose) { try { layer._opts.onClose(); } catch (e) { console.error(e); } }
    layer.remove();
    const prev = layer._prevFocus;
    if (prev && document.body.contains(prev)) Nav.focus(prev, { noScroll: false });
    else Nav.first(Nav.scope());
  },
  closeAll() { while (this.stack.length) this.close(); }
};

const Nav = {
  cur: null,

  scope() { return Layers.top() || $('#app'); },

  visible(el) {
    if (!el.isConnected || el.disabled) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  },

  candidates(scope) { return $$('.f', scope).filter(el => this.visible(el)); },

  focus(el, opts) {
    if (!el) return;
    opts = opts || {};
    if (this.cur && this.cur !== el) this.cur.classList.remove('focused');
    this.cur = el;
    el.classList.add('focused');
    const mem = el.closest('.mem');
    if (mem) mem._last = el;
    if (!opts.noScroll) this.ensureVisible(el);
    el.dispatchEvent(new CustomEvent('navfocus', { bubbles: true }));
  },

  first(scope) {
    scope = scope || this.scope();
    const list = this.candidates(scope);
    const pref = list.find(el => el.hasAttribute('data-autofocus')) || list.find(el => !el.closest('#topnav')) || list[0];
    if (pref) this.focus(pref);
    return pref;
  },

  /** Vuelve a poner el foco en un elemento con data-k (al volver a una pantalla) */
  restore(key, scope) {
    scope = scope || this.scope();
    if (key) {
      const el = this.candidates(scope).find(e => e.getAttribute('data-k') === key);
      if (el) { this.focus(el); return true; }
    }
    return false;
  },

  ensureVisible(el) {
    let p = el.parentElement;
    const r = el.getBoundingClientRect();
    while (p && p !== document.body) {
      if (p.classList.contains('sx')) {
        const pr = p.getBoundingClientRect();
        const m = 60;
        if (r.left < pr.left + m) p.scrollLeft -= (pr.left + m - r.left);
        else if (r.right > pr.right - m) p.scrollLeft += (r.right - (pr.right - m));
      }
      if (p.classList.contains('sy')) {
        const pr = p.getBoundingClientRect();
        const top = 70, bottom = 50;
        if (r.top < pr.top + top) p.scrollTop -= (pr.top + top - r.top);
        else if (r.bottom > pr.bottom - bottom) p.scrollTop += (r.bottom - (pr.bottom - bottom));
      }
      p = p.parentElement;
    }
  },

  move(dir) {
    const scope = this.scope();
    const cur = this.cur && scope.contains(this.cur) && this.visible(this.cur) ? this.cur : null;
    if (!cur) { this.first(scope); return; }
    const c = cur.getBoundingClientRect();
    const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    const tol = 12;
    const list = this.candidates(scope).filter(el => el !== cur).map(el => {
      const r = el.getBoundingClientRect();
      return { el, r, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }).filter(o => {
      if (dir === 'right') return o.r.left >= c.right - tol && o.x > cx;
      if (dir === 'left') return o.r.right <= c.left + tol && o.x < cx;
      if (dir === 'down') return o.r.top >= c.bottom - tol && o.y > cy;
      return o.r.bottom <= c.top + tol && o.y < cy;
    });
    if (!list.length) { this.edge(dir, cur); return; }

    const horiz = dir === 'left' || dir === 'right';
    for (const o of list) {
      o.primary = Math.max(0, dir === 'right' ? o.r.left - c.right : dir === 'left' ? c.left - o.r.right : dir === 'down' ? o.r.top - c.bottom : c.top - o.r.bottom);
      o.overlap = horiz ? Math.min(c.bottom, o.r.bottom) - Math.max(c.top, o.r.top) : Math.min(c.right, o.r.right) - Math.max(c.left, o.r.left);
      o.perp = horiz ? Math.abs(o.y - cy) : Math.abs(o.x - cx);
    }
    let pool = list;
    if (horiz) {
      const ov = list.filter(o => o.overlap > 4);
      if (ov.length) pool = ov;
      else if (!cur.closest('#topnav')) {
        // no saltar a la barra superior con ◀ ▶ desde el contenido
        const body = list.filter(o => !o.el.closest('#topnav'));
        if (!body.length) { this.edge(dir, cur); return; }
        pool = body;
      }
    }
    const minP = Math.min(...pool.map(o => o.primary));
    const band = pool.filter(o => o.primary <= minP + (horiz ? 40 : 30));
    // memoria de fila: si la fila destino recuerda su último elemento, volver a él
    const mems = new Set(band.map(o => o.el.closest('.mem')).filter(Boolean));
    for (const m of mems) {
      if (m !== cur.closest('.mem') && m._last && band.some(o => o.el === m._last)) { this.focus(m._last); return; }
    }
    band.sort((a, b) => (b.overlap > 0) - (a.overlap > 0) || a.perp - b.perp);
    this.focus(band[0].el);
  },

  /** Al llegar a un borde: la pantalla puede reaccionar (ej. cargar más) */
  edge(dir, cur) {
    const s = App.current;
    if (s && s.onEdge) s.onEdge(dir, cur);
  },

  click() {
    const el = this.cur;
    if (el && this.scope().contains(el)) el.click();
  }
};

/* ===== Teclas ===== */
const RB = window.RB = {
  onBack() {
    if (Saver.open) { Saver.hide(); return true; }
    const top = Layers.top();
    if (top) {
      if (top._opts.onBack) top._opts.onBack(); else Layers.close(top);
      return true;
    }
    return App.back();
  },
  onResume() { App.tick(); },
  onPause() { Trailer.pauseAll(); },
  exportBackup() { return exportBackup(); },
  importBackup(text) { const r = importBackup(text); if (r === 'ok') { toast('Respaldo restaurado'); App.applyLook(); App.reload(); } return r; },
  panelStatus() { return JSON.stringify({ tmdb: !!Settings.get('tmdbKey'), omdb: !!Settings.get('omdbKey') }); },
  remoteKeys(json) { try { App.remoteKeys(JSON.parse(json)); } catch (e) { } },
  remoteSearch(json) { try { const o = JSON.parse(json); if (o.q) { Layers.closeAll(); App.go('search', { q: o.q }); } } catch (e) { } }
};

const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Up: 'up', Down: 'down', Left: 'left', Right: 'right' };

document.addEventListener('keydown', e => {
  if (Saver.open) { e.preventDefault(); Saver.hide(); return; }
  App.activity();
  const top = Layers.top();
  if (top && top._opts.onKey && top._opts.onKey(e)) { e.preventDefault(); return; }
  if (!top && App.current && App.current.onKey && App.current.onKey(e)) { e.preventDefault(); return; }

  const k = e.key;
  if (KEYMAP[k]) { e.preventDefault(); Nav.move(KEYMAP[k]); return; }
  if (k === 'Enter' || k === 'NumpadEnter' || k === 'Select' || e.keyCode === 23) { e.preventDefault(); Nav.click(); return; }
  if (k === 'Escape' || k === 'GoBack' || k === 'BrowserBack' || (k === 'Backspace' && !Keyboard.active())) {
    e.preventDefault();
    RB.onBack();
    return;
  }
  // Teclado físico o del celular: escribir directo en el teclado en pantalla
  const kb = Keyboard.active();
  if (kb) {
    if (k === 'Backspace') { e.preventDefault(); kb.del(); return; }
    if (k.length === 1 && !e.ctrlKey && !e.metaKey) { e.preventDefault(); kb.type(k); return; }
  }
  if (k === 'MediaPlayPause' || k === 'MediaPlay' || k === 'MediaPause' || k === ' ') {
    if (Trailer.media(k)) e.preventDefault();
  }
}, true);

/* El mouse también funciona (útil para probar en la compu) */
document.addEventListener('mouseover', e => {
  const el = e.target.closest && e.target.closest('.f');
  if (el && Nav.scope().contains(el) && el !== Nav.cur) Nav.focus(el, { noScroll: true });
});

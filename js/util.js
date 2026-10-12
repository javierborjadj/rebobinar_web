/* Utilidades generales */
'use strict';

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/** Crea un elemento: h('div', {class:'x', onclick: fn, f:true}, 'texto', otroEl) */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'f') { el.classList.add('f'); el.tabIndex = -1; }
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'vars') { for (const n in v) el.style.setProperty(n, v[n]); }
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  appendKids(el, kids);
  return el;
}
function appendKids(el, kids) {
  for (const k of kids) {
    if (k == null || k === false) continue;
    if (Array.isArray(k)) appendKids(el, k);
    else if (k instanceof Node) el.appendChild(k);
    else el.appendChild(document.createTextNode(String(k)));
  }
}
function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; }

const sleep = ms => new Promise(r => setTimeout(r, ms));
function debounce(fn, ms) {
  let t = null;
  return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
}

/* Fechas */
function isoDate(d) {
  const z = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return isoDate(d); }
function yearsAgo(n) { const d = new Date(); d.setFullYear(d.getFullYear() - n); return isoDate(d); }
function hhmm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function ddmm(iso) {
  if (!iso) return '';
  const p = iso.split('-');
  return p.length === 3 ? p[2] + '/' + p[1] : iso;
}
function yearOf(iso) { return iso ? String(iso).slice(0, 4) : ''; }
function runtimeTxt(min) {
  if (!min) return '';
  const hh = Math.floor(min / 60), mm = min % 60;
  return hh ? (hh + ' h ' + String(mm).padStart(2, '0') + ' min') : (mm + ' min');
}

/* Colores estables para las cajas VHS sin póster */
const VHS_COLORS = ['#7A1F3D', '#1F4E79', '#2E6B3F', '#8A5A12', '#4B2A7A', '#12606B', '#8C2F1B', '#3B3550'];
const VHS_STRIPES = ['#FFD23F', '#3FE0D0', '#FF4FA3'];
function hashNum(s) { let x = 0; s = String(s); for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; }
function vhsColor(seed) { return VHS_COLORS[hashNum(seed) % VHS_COLORS.length]; }
function vhsStripe(seed) { return VHS_STRIPES[hashNum(seed + 'x') % VHS_STRIPES.length]; }
function initials(name) { return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

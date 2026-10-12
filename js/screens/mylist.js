/* Mi lista: tarjeta de socio, pendientes, vistas y favoritas */
'use strict';

Screens.mylist = {
  nav: 'Mi lista',
  render(params) {
    params.tab = params.tab || 'pend';
    const TABS = [['pend', 'Pendientes'], ['seen', 'Vistas'], ['fav', 'Favoritas']];
    const nameEl = h('div', { style: { fontSize: '22px', fontWeight: 700, position: 'relative' } }, Settings.get('memberName'));
    const member = h('div', { class: 'member' },
      h('div', { class: 'bg', style: { fontSize: '22px', color: 'var(--a1)', position: 'relative' } }, 'REBOBINAR'),
      h('div', { class: 'vt', style: { fontSize: '18px', marginTop: '18px', position: 'relative' } }, 'TARJETA DE SOCIO'),
      h('div', { class: 'vt', style: { fontSize: '30px', letterSpacing: '3px', position: 'relative' } }, 'Nº ' + String(hashNum(Settings.get('memberSince') + Settings.get('memberName')) % 10000).padStart(4, '0')),
      nameEl,
      h('div', { class: 'vt', style: { fontSize: '17px', color: '#CFE3F7', position: 'relative' } }, 'socio desde ' + Settings.get('memberSince')));
    const stats = h('div', { class: 'stats' },
      [['pend', 'pendientes', 'var(--a1)'], ['seen', 'vistas', 'var(--a2)'], ['fav', 'favoritas', 'var(--a3)']].map(([k, l, c]) =>
        h('div', { class: 'stat' }, h('b', { style: { color: c } }, String(Lists.count(k))), h('span', null, l))));
    const left = h('div', { style: { width: '330px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' } }, member, stats,
      h('button', { class: 'btn', f: true, onclick: async () => {
        const v = await UI.prompt({ title: 'Nombre en la tarjeta de socio', value: Settings.get('memberName'), layout: 'text' });
        if (v && v.trim()) { Settings.set('memberName', v.trim().slice(0, 24)); nameEl.textContent = Settings.get('memberName'); }
      } }, 'Cambiar nombre'),
      h('button', { class: 'btn', f: true, onclick: () => UI.phonePanel('Escaneá el QR para descargar o restaurar el respaldo de tu lista desde el celular.') }, 'Respaldo desde el celular'));

    const tabs = h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } });
    const listBox = h('div', { class: 'sy', style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 8px 30px 6px' } });
    const right = h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' } }, tabs, listBox);

    const draw = () => {
      clear(tabs);
      for (const [k, l] of TABS) tabs.appendChild(h('button', { class: 'tab' + (params.tab === k ? ' on' : ''), f: true, 'data-autofocus': params.tab === k ? '' : null, onclick: () => { params.tab = k; draw(); Nav.focus($$('.tab', tabs)[TABS.findIndex(t => t[0] === k)]); } }, l + ' (' + Lists.count(k) + ')'));
      tabs.appendChild(h('span', { class: 'vt muted', style: { marginLeft: 'auto', fontSize: '19px' } }, 'recientes primero'));
      clear(listBox);
      const items = Lists.list(params.tab);
      if (!items.length) {
        const msg = { pend: 'Agregá títulos con «+ Mi lista» desde la ficha.', seen: 'Marcá como vista o puntuá desde la ficha.', fav: 'Marcá tus favoritas desde la ficha.' }[params.tab];
        listBox.appendChild(emptyEl('Estante vacío', msg));
        return;
      }
      for (const it of items) {
        const when = it.flags[params.tab] ? new Date(it.flags[params.tab]) : null;
        const sub = [it.year, it.type === 'tv' ? 'Serie' : 'Película', it.runtime ? runtimeTxt(it.runtime) : '', params.tab === 'seen' && when ? 'vista el ' + String(when.getDate()).padStart(2, '0') + '/' + String(when.getMonth() + 1).padStart(2, '0') : ''].filter(Boolean).join(' · ');
        listBox.appendChild(h('button', { class: 'lrow', f: true, 'data-k': it.type + ':' + it.id, onclick: () => App.go('detail', { type: it.type, id: it.id }) },
          h('div', { class: 'thumb', vars: { '--c': vhsColor(it.id) } }, it.poster ? h('img', { src: API.img(it.poster, 'w154'), alt: '' }) : null),
          h('div', { style: { flex: 1, minWidth: 0, textAlign: 'left' } }, h('div', { class: 'tt' }, it.title), h('div', { class: 'muted', style: { fontSize: '18px' } }, sub)),
          h('div', { class: 'note' }, it.note ? '«' + it.note + '»' : ''),
          h('div', { class: 'stars' }, it.stars ? '★'.repeat(it.stars) + '☆'.repeat(5 - it.stars) : '')));
      }
    };
    draw();
    return { el: h('div', { class: 'mylist' }, left, right) };
  }
};

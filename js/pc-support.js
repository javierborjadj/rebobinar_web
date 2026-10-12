(function () {
  console.log("Rebobinar Web: Soporte para Teclado de PC, Ctrl+V y Mouse activado.");

  function encontrarBotonesTeclado() {
    const candidatos = Array.from(document.querySelectorAll('button, [tabindex], div, span'));
    const mapa = {};
    for (const el of candidatos) {
      if (el.children.length === 0 && el.offsetParent !== null) {
        const txt = (el.textContent || '').trim().toUpperCase();
        if (/^[0-9A-ZÑ]$/.test(txt) || ['BORRAR', 'LIMPIAR', 'LISTO', 'ESPACIO', 'OK', 'BUSCAR'].includes(txt)) {
          if (!mapa[txt]) mapa[txt] = el;
        }
      }
    }
    return mapa;
  }

  function accionarElemento(el) {
    if (!el) return false;
    el.click();
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    return true;
  }

  // Soporte para pegar con Ctrl + V directo en cualquier popup o pantalla
  window.addEventListener('paste', async (e) => {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const texto = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (!texto) return;

    const mapa = encontrarBotonesTeclado();
    if (Object.keys(mapa).length > 5) {
      e.preventDefault();
      e.stopPropagation();
      for (const char of texto) {
        const c = char.toUpperCase();
        if (mapa[c]) {
          accionarElemento(mapa[c]);
          await new Promise(r => setTimeout(r, 15));
        } else if (c === ' ' && mapa['ESPACIO']) {
          accionarElemento(mapa['ESPACIO']);
          await new Promise(r => setTimeout(r, 15));
        }
      }
    }
  }, true);

  // Soporte para escribir con el teclado físico de la PC en cualquier teclado en pantalla
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const mapa = encontrarBotonesTeclado();
    if (Object.keys(mapa).length < 5) return;

    const k = e.key.toUpperCase();
    if (/^[0-9A-ZÑ]$/.test(k) && mapa[k]) {
      e.preventDefault();
      e.stopPropagation();
      accionarElemento(mapa[k]);
    } else if (e.key === 'Backspace' && mapa['BORRAR']) {
      e.preventDefault();
      e.stopPropagation();
      accionarElemento(mapa['BORRAR']);
    } else if (e.key === 'Delete' && mapa['LIMPIAR']) {
      e.preventDefault();
      e.stopPropagation();
      accionarElemento(mapa['LIMPIAR']);
    } else if (e.key === ' ' && mapa['ESPACIO']) {
      e.preventDefault();
      e.stopPropagation();
      accionarElemento(mapa['ESPACIO']);
    }
  }, true);

  // Hacer que si el usuario hace clic en la caja verde de texto (pantalla del teclado), pueda pegar o escribir directo
  document.addEventListener('click', (e) => {
    const mapa = encontrarBotonesTeclado();
    if (Object.keys(mapa).length > 5) {
      const target = e.target;
      const txt = (target.textContent || '').trim().toUpperCase();
      // Si hace clic en el visor del código/texto (no en un botón suelto)
      if (!mapa[txt] && target.children.length <= 2) {
        const pegado = prompt("Pegá acá tu texto o clave de API con Ctrl+V y dale Aceptar:");
        if (pegado !== null && pegado.trim() !== "") {
          if (mapa['LIMPIAR']) accionarElemento(mapa['LIMPIAR']);
          (async () => {
            for (const char of pegado.trim()) {
              const c = char.toUpperCase();
              if (mapa[c]) {
                accionarElemento(mapa[c]);
                await new Promise(r => setTimeout(r, 15));
              } else if (c === ' ' && mapa['ESPACIO']) {
                accionarElemento(mapa['ESPACIO']);
                await new Promise(r => setTimeout(r, 15));
              }
            }
          })();
        }
      }
    }
  });
})();

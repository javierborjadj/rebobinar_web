(function () {
  console.log("Rebobinar Web: Modo Inputs Web Nativos activado.");

  // Vigilar cuando aparece la pantalla de Setup, Ajustes o el Popup de teclado de TV
  const observer = new MutationObserver(() => {
    convertirTecladoTVenInputWeb();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function convertirTecladoTVenInputWeb() {
    // Buscar todas las teclas del teclado virtual (0-9, A-F, BORRAR, LIMPIAR, LISTO)
    const elementos = Array.from(document.querySelectorAll('button, [tabindex], div, span'));
    const botonesTeclado = {};

    for (const el of elementos) {
      if (el.children.length === 0 && el.offsetParent !== null) {
        const txt = (el.textContent || '').trim().toUpperCase();
        if (/^[0-9A-ZÑ]$/.test(txt) || ['BORRAR', 'LIMPIAR', 'LISTO', 'OK', 'ESPACIO'].includes(txt)) {
          if (!botonesTeclado[txt]) botonesTeclado[txt] = el;
        }
      }
    }

    // Si detectamos el teclado de TV en pantalla y todavía no le pusimos un <input> real
    if (botonesTeclado['0'] && botonesTeclado['A'] && botonesTeclado['LISTO']) {
      const btnCero = botonesTeclado['0'];
      const filaTeclas = btnCero.parentElement;
      const contenedorModal = filaTeclas ? filaTeclas.parentElement : null;

      if (contenedorModal && !contenedorModal.querySelector('.input-web-directo')) {
        // Ocultar los botones de letras/números de TV para que no estorben
        Array.from(contenedorModal.children).forEach(hijo => {
          const textoHijo = (hijo.textContent || '').toUpperCase();
          if (textoHijo.includes('0') && textoHijo.includes('1') && textoHijo.includes('2')) {
            hijo.style.display = 'none';
          }
          if (textoHijo.includes('A') && textoHijo.includes('B') && textoHijo.includes('BORRAR')) {
            hijo.style.display = 'none';
          }
        });

        // Crear un campo <input> real de página web donde se pueda escribir o pegar directo
        const inputWeb = document.createElement('input');
        inputWeb.type = 'text';
        inputWeb.className = 'input-web-directo';
        inputWeb.placeholder = 'Pegá acá tu clave con Ctrl+V o clic derecho -> Pegar...';
        inputWeb.style.cssText = 'width: 100%; box-sizing: border-box; padding: 14px; margin: 12px 0; background: #001a0f; color: #00ff88; border: 2px solid #00ff88; border-radius: 6px; font-family: monospace; font-size: 18px; outline: none;';

        // Insertarlo arriba del botón LISTO
        contenedorModal.insertBefore(inputWeb, filaTeclas);
        setTimeout(() => inputWeb.focus(), 50);

        // Sincronizar lo que escribas o pegues con la app original al instante
        inputWeb.addEventListener('input', async () => {
          const valor = inputWeb.value.trim();
          if (botonesTeclado['LIMPIAR']) botonesTeclado['LIMPIAR'].click();
          for (const char of valor) {
            const c = char.toUpperCase();
            if (botonesTeclado[c]) {
              botonesTeclado[c].click();
            } else if (c === ' ' && botonesTeclado['ESPACIO']) {
              botonesTeclado['ESPACIO'].click();
            }
          }
        });

        // Si apretás Enter en el input, pulsa LISTO automáticamente
        inputWeb.addEventListener('keydown', (e) => {
          e.stopPropagation(); // Evita que la app de TV bloquee las teclas de tu PC
          if (e.key === 'Enter' && botonesTeclado['LISTO']) {
            botonesTeclado['LISTO'].click();
          }
        });
      }
    }
  }
})();

(function () {
  console.log("Rebobinar Web: Input directo sincronizado.");

  const observer = new MutationObserver(() => {
    iniciarInputDirecto();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  function buscarBotonEnPantalla(textoBuscado) {
    const els = document.querySelectorAll('button, [tabindex], div, span');
    for (const el of els) {
      if (el.children.length === 0) {
        const t = (el.textContent || '').trim().toUpperCase();
        if (t === textoBuscado) return el;
      }
    }
    return null;
  }

  function iniciarInputDirecto() {
    const btnCero = buscarBotonEnPantalla('0');
    const btnListo = buscarBotonEnPantalla('LISTO');
    if (!btnCero || !btnListo) return;

    const filaTeclas = btnCero.parentElement;
    const modal = filaTeclas ? filaTeclas.parentElement : null;
    if (!modal || modal.querySelector('.rebobinar-web-box')) return;

    // Crear caja contenedora web
    const box = document.createElement('div');
    box.className = 'rebobinar-web-box';
    box.style.cssText = 'margin: 12px 0; padding: 12px; background: #141026; border: 2px solid #ff2a85; border-radius: 8px;';

    const label = document.createElement('div');
    label.style.cssText = 'color: #ffd000; font-family: sans-serif; font-size: 13px; margin-bottom: 8px; font-weight: bold;';
    label.textContent = 'MODO WEB: Pegá acá tu Clave de API (32 caracteres) y hacé clic en CARGAR:';

    const filaInput = document.createElement('div');
    filaInput.style.cssText = 'display: flex; gap: 8px;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Pegá acá con Ctrl+V...';
    input.style.cssText = 'flex: 1; padding: 10px; background: #001a0f; color: #00ff88; border: 1px solid #00ff88; border-radius: 4px; font-family: monospace; font-size: 16px;';

    const btnCargar = document.createElement('button');
    btnCargar.textContent = 'CARGAR Y GUARDAR';
    btnCargar.style.cssText = 'padding: 10px 16px; background: #ffd000; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;';

    const estado = document.createElement('div');
    estado.style.cssText = 'color: #ccc; font-family: sans-serif; font-size: 12px; margin-top: 6px;';

    input.addEventListener('keydown', (e) => e.stopPropagation());

    input.addEventListener('input', () => {
      const limpio = input.value.trim();
      if (limpio.length > 40 || limpio.startsWith('eyJ')) {
        estado.style.color = '#ff4444';
        estado.textContent = '⚠️ Ese parece el Token largo. Copiá la "Clave de la API" (son 32 letras/números).';
      } else {
        estado.style.color = '#00ff88';
        estado.textContent = `Longitud: ${limpio.length} / 32 caracteres.`;
      }
    });

    btnCargar.addEventListener('click', async () => {
      const valor = input.value.trim();
      if (!valor) return;

      btnCargar.disabled = true;
      estado.style.color = '#ffd000';
      estado.textContent = 'Cargando caracteres en la aplicación...';

      const btnLimpiar = buscarBotonEnPantalla('LIMPIAR');
      if (btnLimpiar) {
        btnLimpiar.click();
        await new Promise(r => setTimeout(r, 80));
      }

      for (let i = 0; i < valor.length; i++) {
        const char = valor[i].toUpperCase();
        // Buscamos el botón fresco en cada paso por si la app redibuja el DOM
        const btnLetra = buscarBotonEnPantalla(char === ' ' ? 'ESPACIO' : char);
        if (btnLetra) {
          btnLetra.click();
          await new Promise(r => setTimeout(r, 45));
        }
      }

      estado.style.color = '#00ff88';
      estado.textContent = '¡Listo! Guardando...';
      await new Promise(r => setTimeout(r, 150));

      const btnFin = buscarBotonEnPantalla('LISTO');
      if (btnFin) btnFin.click();
      btnCargar.disabled = false;
    });

    filaInput.appendChild(input);
    filaInput.appendChild(btnCargar);
    box.appendChild(label);
    box.appendChild(filaInput);
    box.appendChild(estado);

    modal.insertBefore(box, filaTeclas);
    setTimeout(() => input.focus(), 50);
  }
})();

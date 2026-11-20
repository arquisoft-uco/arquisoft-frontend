import { useEffect, type RefObject } from 'react';

const VARIABLE_ALTO_PIE = '--alto-pie-panel';

export function useAltoPiePanel(pie: RefObject<HTMLElement | null>, activo: boolean) {
  useEffect(() => {
    const elemento = pie.current;
    if (!activo || !elemento || typeof ResizeObserver === 'undefined') return;
    const estilo = document.body.style;
    const anterior = estilo.getPropertyValue(VARIABLE_ALTO_PIE);
    const publicar = () => estilo.setProperty(VARIABLE_ALTO_PIE, `${elemento.offsetHeight}px`);
    publicar();
    const observador = new ResizeObserver(publicar);
    observador.observe(elemento);
    return () => {
      observador.disconnect();
      if (anterior) estilo.setProperty(VARIABLE_ALTO_PIE, anterior);
      else estilo.removeProperty(VARIABLE_ALTO_PIE);
    };
  }, [pie, activo]);
}

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useClicFuera(
  activo: boolean,
  elementos: RefObject<HTMLElement | null>[],
  alSalir: () => void,
): void {
  const elementosRef = useRef(elementos);
  const alSalirRef = useRef(alSalir);

  useEffect(() => {
    elementosRef.current = elementos;
    alSalirRef.current = alSalir;
  });

  useEffect(() => {
    if (!activo) return;

    function alPulsar(evento: PointerEvent) {
      const destino = evento.target;
      if (!(destino instanceof Node)) return;
      const dentro = elementosRef.current.some((elemento) => elemento.current?.contains(destino));
      if (!dentro) alSalirRef.current();
    }

    document.addEventListener('pointerdown', alPulsar);
    return () => document.removeEventListener('pointerdown', alPulsar);
  }, [activo]);
}

import { useRef, useState } from 'react';
import type { FaseSubida } from '../models/FaseSubida';

export function useAvanceSubida() {
  const [fase, setFase] = useState<FaseSubida | null>(null);
  const [porcentaje, setPorcentaje] = useState(0);
  const ultimaFase = useRef<FaseSubida | null>(null);

  function avanzarA(nueva: FaseSubida) {
    ultimaFase.current = nueva;
    setFase(nueva);
    if (nueva === 'subiendo') setPorcentaje(0);
  }

  function reiniciar() {
    setFase(null);
    setPorcentaje(0);
  }

  return {
    fase,
    porcentaje,
    avanzarA,
    actualizarPorcentaje: setPorcentaje,
    reiniciar,
    faseDelError: () => ultimaFase.current,
  };
}

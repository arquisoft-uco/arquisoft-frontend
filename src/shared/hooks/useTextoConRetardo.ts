import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export function useTextoConRetardo(valor: string, onCambiar: (valor: string) => void) {
  const ultimoEmitido = useRef(valor);
  const [borrador, setBorrador] = useState(valor);
  const retardado = useDebouncedValue(borrador);

  useEffect(() => {
    if (valor === ultimoEmitido.current) return;
    ultimoEmitido.current = valor;
    setBorrador(valor);
  }, [valor]);

  useEffect(() => {
    if (retardado !== borrador || retardado === ultimoEmitido.current) return;
    ultimoEmitido.current = retardado;
    onCambiar(retardado);
  }, [retardado, borrador, onCambiar]);

  function borrar() {
    setBorrador('');
    ultimoEmitido.current = '';
    onCambiar('');
  }

  return { borrador, setBorrador, borrar };
}

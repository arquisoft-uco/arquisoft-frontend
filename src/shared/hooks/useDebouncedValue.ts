import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(valor: T, retardoMs = 300): T {
  const [valorConRetardo, setValorConRetardo] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorConRetardo(valor), retardoMs);
    return () => clearTimeout(temporizador);
  }, [valor, retardoMs]);

  return valorConRetardo;
}

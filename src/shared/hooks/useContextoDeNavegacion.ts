import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import type { ZodType, ZodTypeDef } from 'zod';
import { useAmbitoDeSesion } from '../../hooks/useAuth';
import { contextoTemporal } from '../utils/contexto-temporal';

type Esquema<T> = ZodType<T, ZodTypeDef, unknown>;

interface OpcionesContextoDeNavegacion<T> {
  tipo: string;
  id: string;
  esquemaEstado: Esquema<T>;
  coincide?: (valor: T) => boolean;
  ttlMs?: number;
}

interface ResultadoContextoDeNavegacion<T> {
  contexto: T | null;
  actualizar: (cambiar: (previo: T) => T) => void;
}

type Fuente = 'state' | 'snapshot' | 'ninguna';

export function useContextoDeNavegacion<T>({
  tipo,
  id,
  esquemaEstado,
  coincide,
  ttlMs,
}: OpcionesContextoDeNavegacion<T>): ResultadoContextoDeNavegacion<T> {
  const location = useLocation();
  const ambito = useAmbitoDeSesion();

  const [inicial] = useState<{ valor: T | null; fuente: Fuente }>(() => {
    const delState = esquemaEstado.safeParse(location.state);
    if (delState.success && (!coincide || coincide(delState.data))) {
      return { valor: delState.data, fuente: 'state' };
    }
    const delSnapshot = contextoTemporal.leer<T>(
      { tipo, id },
      { esquema: esquemaEstado, ambito, ttlMs },
    );
    if (delSnapshot !== null && (!coincide || coincide(delSnapshot))) {
      return { valor: delSnapshot, fuente: 'snapshot' };
    }
    return { valor: null, fuente: 'ninguna' };
  });

  const [contexto, setContexto] = useState<T | null>(inicial.valor);
  const vigente = useRef<T | null>(inicial.valor);

  useEffect(() => {
    if (inicial.fuente === 'state' && vigente.current !== null) {
      contextoTemporal.guardar({ tipo, id }, vigente.current, { esquema: esquemaEstado, ambito });
    }
  }, [inicial.fuente, tipo, id, esquemaEstado, ambito]);

  const actualizar = useCallback(
    (cambiar: (previo: T) => T) => {
      if (vigente.current === null) return;
      const siguiente = cambiar(vigente.current);
      vigente.current = siguiente;
      setContexto(siguiente);
      contextoTemporal.guardar({ tipo, id }, siguiente, { esquema: esquemaEstado, ambito });
    },
    [tipo, id, esquemaEstado, ambito],
  );

  return { contexto, actualizar };
}

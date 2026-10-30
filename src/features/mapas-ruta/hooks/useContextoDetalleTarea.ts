import { useState } from 'react';
import { useLocation } from 'react-router';
import type { NavegacionDetalleTarea } from '../models/NavegacionDetalleTarea';

function leerNavegacion(state: unknown): NavegacionDetalleTarea {
  if (typeof state === 'object' && state !== null && 'search' in state) {
    const { search } = state;
    if (typeof search === 'string') return { search };
  }
  return { search: '' };
}

export function useContextoDetalleTarea(): NavegacionDetalleTarea {
  const location = useLocation();
  const [navegacion] = useState(() => leerNavegacion(location.state));

  return navegacion;
}

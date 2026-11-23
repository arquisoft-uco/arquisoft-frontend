import { useContextoDeNavegacion } from '../../../shared/hooks/useContextoDeNavegacion';
import type { NavegacionDetalleTarea } from '../models/NavegacionDetalleTarea';
import { esquemaContextoDetalleTarea } from '../utils/contexto-detalle-tarea';

export function useContextoDetalleTarea(id: string): NavegacionDetalleTarea {
  const { contexto } = useContextoDeNavegacion({
    tipo: 'mapas-ruta',
    id,
    esquemaEstado: esquemaContextoDetalleTarea,
  });

  return { search: contexto?.search ?? '' };
}

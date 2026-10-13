import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { proyectosGradoService } from '../services/proyectosGradoService';

export const MIS_PROYECTOS_GRADO_QUERY_KEY = [
  'proyectos-grado',
  'estudiante',
  'mis-proyectos',
] as const;

const PARAM_PROYECTO = 'proyecto';

export function useMisProyectosGrado() {
  const query = useQuery({
    queryKey: MIS_PROYECTOS_GRADO_QUERY_KEY,
    queryFn: proyectosGradoService.getMisProyectos,
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const proyectos = query.data ?? [];
  const idEnUrl = searchParams.get(PARAM_PROYECTO);
  const proyecto = proyectos.find((p) => p.id === idEnUrl) ?? proyectos[0] ?? null;

  function seleccionarProyecto(id: string) {
    setSearchParams(
      (prev) => {
        const siguiente = new URLSearchParams(prev);
        siguiente.set(PARAM_PROYECTO, id);
        return siguiente;
      },
      { replace: true },
    );
  }

  return {
    proyecto,
    proyectos,
    seleccionarProyecto,
    cargado: query.isSuccess,
    sinProyecto: query.isSuccess && proyectos.length === 0,
    hayError: query.isError,
    reintentar: query.refetch,
  };
}

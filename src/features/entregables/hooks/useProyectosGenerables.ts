import { useProyectosAsesor } from './useProyectosAsesor';
import { useProyectosConEntregableVigente } from './useProyectosConEntregableVigente';

export function useProyectosGenerables() {
  const proyectosQuery = useProyectosAsesor();
  const vigentesQuery = useProyectosConEntregableVigente();

  const enCurso = proyectosQuery.data ?? [];
  const conEntregableVigente = new Set(vigentesQuery.data ?? []);
  const proyectos = enCurso.filter((p) => !conEntregableVigente.has(p.id));

  function refetch(): void {
    void proyectosQuery.refetch();
    void vigentesQuery.refetch();
  }

  return {
    proyectos,
    totalEnCurso: enCurso.length,
    isLoading: proyectosQuery.isLoading || vigentesQuery.isLoading,
    isError: proyectosQuery.isError || vigentesQuery.isError,
    refetch,
  };
}

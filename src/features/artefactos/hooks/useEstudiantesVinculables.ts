import { useEstudiantesArtefacto } from './useEstudiantesArtefacto';
import { useEstudiantesProyectoCatalogo } from './useEstudiantesProyectoCatalogo';

export function useEstudiantesVinculables(proyectoGradoId: string, artefactoId: string) {
  const catalogo = useEstudiantesProyectoCatalogo(proyectoGradoId);
  const vinculados = useEstudiantesArtefacto(artefactoId);

  const idsVinculados = new Set((vinculados.data ?? []).map((e) => e.estudianteId));

  return {
    estudiantes: catalogo.estudiantes.filter((e) => !idsVinculados.has(e.estudianteId)),
    isLoading: catalogo.isLoading || vinculados.isLoading,
    isError: catalogo.isError || vinculados.isError,
    error: catalogo.error ?? vinculados.error,
    refetch: () => {
      void catalogo.refetch();
      void vinculados.refetch();
    },
  };
}

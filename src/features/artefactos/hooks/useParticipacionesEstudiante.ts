import { useQuery } from '@tanstack/react-query';
import { useMisProyectosGrado } from '../../../shared/hooks/useMisProyectosGrado';
import { banderasCierreProyecto } from '../../../shared/utils/estado-proyecto';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { agruparPorProyecto } from '../utils/agrupar-participaciones';

export function useParticipacionesEstudiante() {
  const query = useQuery({
    queryKey: ['artefactos', 'estudiante', 'participaciones'],
    queryFn: () => artefactosService.getParticipacionesEstudiante(),
  });
  const { proyectos: misProyectos } = useMisProyectosGrado();

  const participaciones: ParticipacionArtefacto[] = query.data ?? [];
  const cierrePorProyecto = new Map(
    misProyectos.map((p) => [p.id, banderasCierreProyecto(p.estado.id)]),
  );
  const proyectos = agruparPorProyecto(participaciones, cierrePorProyecto);
  const totalArtefactos = participaciones.length;

  return { ...query, participaciones, proyectos, totalArtefactos };
}

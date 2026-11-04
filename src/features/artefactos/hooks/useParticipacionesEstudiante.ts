import { useQuery } from '@tanstack/react-query';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { agruparPorProyecto } from '../utils/agrupar-participaciones';

export function useParticipacionesEstudiante() {
  const query = useQuery({
    queryKey: ['artefactos', 'estudiante', 'participaciones'],
    queryFn: () => artefactosService.getParticipacionesEstudiante(),
  });

  const participaciones: ParticipacionArtefacto[] = query.data ?? [];
  const proyectos = agruparPorProyecto(participaciones);
  const totalArtefactos = participaciones.length;

  return { ...query, participaciones, proyectos, totalArtefactos };
}

import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';

export interface ProyectoConParticipaciones {
  proyectoGrado: string;
  nombreProyecto: string;
  participaciones: ParticipacionArtefacto[];
}

export function agruparPorProyecto(
  participaciones: ParticipacionArtefacto[],
): ProyectoConParticipaciones[] {
  const grupos = new Map<string, ProyectoConParticipaciones>();

  for (const participacion of participaciones) {
    const grupo = grupos.get(participacion.proyectoGrado);
    if (grupo) {
      grupo.participaciones.push(participacion);
    } else {
      grupos.set(participacion.proyectoGrado, {
        proyectoGrado: participacion.proyectoGrado,
        nombreProyecto: participacion.nombreProyecto,
        participaciones: [participacion],
      });
    }
  }

  return [...grupos.values()];
}

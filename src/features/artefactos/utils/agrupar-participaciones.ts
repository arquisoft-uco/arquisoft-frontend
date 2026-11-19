import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';

export interface ProyectoConParticipaciones {
  proyectoGrado: string;
  nombreProyecto: string;
  participaciones: ParticipacionArtefacto[];
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
}

export type EstadoCierreProyecto = Pick<
  ProyectoConParticipaciones,
  'proyectoFinalizado' | 'proyectoCancelado'
>;

const PROYECTO_ABIERTO: EstadoCierreProyecto = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

export function agruparPorProyecto(
  participaciones: ParticipacionArtefacto[],
  cierrePorProyecto: ReadonlyMap<string, EstadoCierreProyecto> = new Map(),
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
        ...(cierrePorProyecto.get(participacion.proyectoGrado) ?? PROYECTO_ABIERTO),
      });
    }
  }

  return [...grupos.values()];
}

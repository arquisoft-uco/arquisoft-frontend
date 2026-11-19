import { z } from 'zod';
import { LIMITES, opcionRequerida, textoRequerido } from '../../../shared/validation';

export const informacionTareaSchema = z.object({
  descripcion: textoRequerido(LIMITES.TAREA_DESCRIPCION_MAX),
  asesor: opcionRequerida(),
});

export type InformacionTareaValues = z.infer<typeof informacionTareaSchema>;

export const ETIQUETAS_INFORMACION_TAREA: Record<keyof InformacionTareaValues, string> = {
  descripcion: 'Descripción',
  asesor: 'Asesor',
};

export const CAMPOS_INFORMACION_TAREA = Object.keys(
  ETIQUETAS_INFORMACION_TAREA,
) as (keyof InformacionTareaValues)[];

export function comoCampoInformacionTarea(campo: string): keyof InformacionTareaValues | undefined {
  return CAMPOS_INFORMACION_TAREA.find((c) => c === campo);
}

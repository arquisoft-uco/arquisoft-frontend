import { z } from 'zod';
import { opcionRequerida, uuidValido } from '../../../shared/validation';
import {
  CODIGOS_ESTUDIANTES_COMUNES,
  estudiantesArtefactoSchema,
} from './estudiantes-artefacto-schema';

export const asignarArtefactoSchema = z.object({
  proyectoGrado: opcionRequerida().pipe(uuidValido()),
  versionRepositorioArtefacto: opcionRequerida().pipe(uuidValido()),
  estudiantes: estudiantesArtefactoSchema,
});

export type AsignarArtefactoValues = z.infer<typeof asignarArtefactoSchema>;

export const ETIQUETAS_ASIGNAR_ARTEFACTO: Record<keyof AsignarArtefactoValues, string> = {
  proyectoGrado: 'Proyecto de grado',
  versionRepositorioArtefacto: 'Versión del repositorio',
  estudiantes: 'Estudiantes',
};

const CAMPO_POR_CODIGO: Record<string, keyof AsignarArtefactoValues> = {
  ARTEFACTOS_PROYECTO_GRADO_NO_ENCONTRADO: 'proyectoGrado',
  ARTEFACTOS_ASESOR_PROYECTO_GRADO_NO_ASIGNADO: 'proyectoGrado',
  ARTEFACTOS_VERSION_REPOSITORIO_ARTEFACTO_VERSION_NO_ENCONTRADA: 'versionRepositorioArtefacto',
  ARTEFACTOS_ARTEFACTO_REPOSITORIO_YA_ASIGNADO: 'versionRepositorioArtefacto',
  ...Object.fromEntries(CODIGOS_ESTUDIANTES_COMUNES.map((c) => [c, 'estudiantes' as const])),
  ESTUDIANTE_ARTEFACTO_ESTUDIANTES_SUPERAN_PROYECTO: 'estudiantes',
};

export const CODIGOS_ASIGNAR_ARTEFACTO = Object.keys(CAMPO_POR_CODIGO);

export function campoDeCodigoAsignarArtefacto(
  code: string,
): keyof AsignarArtefactoValues | undefined {
  return CAMPO_POR_CODIGO[code];
}

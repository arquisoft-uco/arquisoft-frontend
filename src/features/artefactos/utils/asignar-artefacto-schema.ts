import { z } from 'zod';
import { listaNoVaciaSinDuplicados, opcionRequerida, uuidValido } from '../../../shared/validation';

export const asignarArtefactoSchema = z.object({
  proyectoGrado: opcionRequerida().pipe(uuidValido()),
  versionRepositorioArtefacto: opcionRequerida().pipe(uuidValido()),
  estudiantes: listaNoVaciaSinDuplicados(uuidValido(), (id) => id),
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
  ESTUDIANTE_ARTEFACTO_ESTUDIANTES_REQUERIDOS: 'estudiantes',
  ESTUDIANTE_ARTEFACTO_ESTUDIANTES_DUPLICADOS: 'estudiantes',
  ARTEFACTOS_ESTUDIANTES_NO_ENCONTRADOS: 'estudiantes',
  ARTEFACTOS_ESTUDIANTE_NO_VIGENTE: 'estudiantes',
  ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_PROYECTO_GRADO: 'estudiantes',
  ESTUDIANTE_ARTEFACTO_ESTUDIANTES_SUPERAN_PROYECTO: 'estudiantes',
};

export const CODIGOS_ASIGNAR_ARTEFACTO = Object.keys(CAMPO_POR_CODIGO);

export function campoDeCodigoAsignarArtefacto(
  code: string,
): keyof AsignarArtefactoValues | undefined {
  return CAMPO_POR_CODIGO[code];
}

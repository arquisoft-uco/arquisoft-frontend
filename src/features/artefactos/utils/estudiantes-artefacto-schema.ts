import { z } from 'zod';
import { listaNoVaciaSinDuplicados, uuidValido } from '../../../shared/validation';

export const estudiantesArtefactoSchema = listaNoVaciaSinDuplicados(uuidValido(), (id) => id);

export const vincularEstudiantesSchema = z.object({
  estudiantes: estudiantesArtefactoSchema,
});

export type VincularEstudiantesValues = z.infer<typeof vincularEstudiantesSchema>;

export const ETIQUETAS_VINCULAR_ESTUDIANTES: Record<keyof VincularEstudiantesValues, string> = {
  estudiantes: 'Estudiantes',
};

export const CODIGOS_ESTUDIANTES_COMUNES = [
  'ESTUDIANTE_ARTEFACTO_ESTUDIANTES_REQUERIDOS',
  'ESTUDIANTE_ARTEFACTO_ESTUDIANTES_DUPLICADOS',
  'ARTEFACTOS_ESTUDIANTES_NO_ENCONTRADOS',
  'ARTEFACTOS_ESTUDIANTE_NO_VIGENTE',
  'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_PROYECTO_GRADO',
];

export const ESTUDIANTE_YA_VINCULADO = 'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_YA_VINCULADO';

export const CODIGOS_VINCULAR_ESTUDIANTES = [
  ...CODIGOS_ESTUDIANTES_COMUNES,
  ESTUDIANTE_YA_VINCULADO,
];

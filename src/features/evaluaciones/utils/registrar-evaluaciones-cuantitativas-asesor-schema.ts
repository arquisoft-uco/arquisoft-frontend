import { z } from 'zod';
import { listaNoVaciaSinDuplicados, uuidValido } from '../../../shared/validation';
import { puntajeValido } from './puntaje-valido';

export const registrarEvaluacionesCuantitativasAsesorSchema = z.object({
  evaluaciones: listaNoVaciaSinDuplicados(
    z.object({
      itemId: uuidValido(),
      puntaje: puntajeValido,
    }),
    (par) => par.itemId,
  ),
});

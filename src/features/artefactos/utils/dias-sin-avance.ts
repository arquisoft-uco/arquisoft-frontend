import { enteroEntre, LIMITES } from '../../../shared/validation';

export const DIAS_SIN_AVANCE_POR_DEFECTO = 15;

const validadorDias = enteroEntre(
  LIMITES.ARTEFACTO_DIAS_SIN_AVANCE_MIN,
  LIMITES.ARTEFACTO_DIAS_SIN_AVANCE_MAX,
);

export function validarDiasSinAvance(texto: string): { dias: number | null; error?: string } {
  const resultado = validadorDias.safeParse(texto);
  if (!resultado.success) return { dias: null, error: resultado.error.issues[0].message };
  return { dias: Number(texto.trim()) };
}

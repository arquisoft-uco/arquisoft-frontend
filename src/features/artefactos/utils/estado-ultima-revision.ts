import type { VarianteBadge } from '../../../shared/components/ui/Badge';
import { varianteEstadoRevisionAsesor } from '../../../shared/utils/estado-variante';
import type { EstadoRevisionAsesor } from '../models/artefactos';

export function varianteEstadoUltimaRevision(
  estados: EstadoRevisionAsesor[],
  nombre: string,
): VarianteBadge {
  const estado = estados.find((e) => e.nombre === nombre);
  return estado ? varianteEstadoRevisionAsesor(estado.id) : 'neutro';
}

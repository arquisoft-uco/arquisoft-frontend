import Badge from '../../../shared/components/ui/Badge';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import { varianteEstadoUltimaRevision } from '../utils/estado-ultima-revision';

interface Props {
  estado?: string;
  estados: EstadoRevisionAsesor[];
}

export default function InsigniaEstadoUltimaRevision({ estado, estados }: Props) {
  if (!estado) return <Badge variante="neutro">Sin revisión</Badge>;
  return <Badge variante={varianteEstadoUltimaRevision(estados, estado)}>{estado}</Badge>;
}

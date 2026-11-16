import Badge from '../../../shared/components/ui/Badge';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import InsigniaEstadoRevision from './InsigniaEstadoRevision';

interface Props {
  ultima: VersionArtefacto | null | undefined;
  omitido: boolean;
}

export default function EstadoUltimaRevision({ ultima, omitido }: Props) {
  if (omitido || ultima === undefined) return null;
  if (ultima === null) return <Badge variante="neutro">Sin versiones</Badge>;
  return <InsigniaEstadoRevision version={ultima} />;
}

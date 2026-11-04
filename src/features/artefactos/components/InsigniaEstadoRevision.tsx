import Badge from '../../../shared/components/ui/Badge';
import { varianteEstadoRevisionAsesor } from '../../../shared/utils/estado-variante';
import type { VersionArtefacto } from '../models/VersionArtefacto';

interface Props {
  version: VersionArtefacto;
}

export default function InsigniaEstadoRevision({ version }: Props) {
  if (version.estadoRevision === null) return <Badge variante="neutro">Sin revisión</Badge>;
  return (
    <Badge variante={varianteEstadoRevisionAsesor(version.estadoRevision)}>
      {version.nombreEstadoRevision}
    </Badge>
  );
}

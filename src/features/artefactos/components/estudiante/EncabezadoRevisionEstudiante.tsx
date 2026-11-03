import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoRevisionAsesor } from '../../../../shared/utils/estado-variante';
import { formatearFechaOpcional } from '../../../../shared/utils/formato-version';
import type { RevisionGestionable } from '../../models/RevisionGestionable';

interface Props {
  revision: RevisionGestionable;
}

export default function EncabezadoRevisionEstudiante({ revision }: Props) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div>
        <p className="font-medium text-on-surface">{revision.nombreDocumento}</p>
        <p className="text-[13px] text-on-surface-secondary">
          Versión {revision.versionDocumento} del documento · {revision.nombreProyecto}
        </p>
      </div>
      <p className="text-on-surface-secondary">
        Versión {revision.version} revisada · {formatearFechaOpcional(revision.fechaCreacion)}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-on-surface-secondary">
        <span>Estado de la revisión</span>
        <Badge variante={varianteEstadoRevisionAsesor(revision.estadoId)}>
          {revision.estadoNombre}
        </Badge>
      </div>
    </div>
  );
}

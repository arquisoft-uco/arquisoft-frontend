import Notice from '../../../../shared/components/ui/Notice';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import InsigniaEstadoRevision from '../InsigniaEstadoRevision';

interface Props {
  version: VersionArtefacto;
  aviso: string | null;
}

export default function EncabezadoRevision({ version, aviso }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-secondary">
        <span>Estado de la revisión</span>
        <InsigniaEstadoRevision version={version} />
      </div>
      {aviso && <Notice variante="info">{aviso}</Notice>}
    </div>
  );
}

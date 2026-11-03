import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { formatearFechaCreacion } from '../../../../shared/utils/formato-version';
import PieRevision from '../PieRevision';
import AccionesRevisionEstudiante from './AccionesRevisionEstudiante';

interface Props {
  artefacto: ArtefactoParaVersion;
  ultima: VersionArtefacto | null | undefined;
  isLoading: boolean;
  isError: boolean;
  onReintentar: () => void;
  puedeSubir: boolean;
  motivoSubida: string | null | undefined;
  onSubir: () => void;
  onCerrar: () => void;
}

function Aviso({ ultima }: { ultima: VersionArtefacto | null }) {
  if (ultima === null) {
    return (
      <Notice variante="info" titulo="Aún no has subido versiones">
        <span className="block">
          Sube la primera versión de este artefacto para que tu asesor la revise.
        </span>
      </Notice>
    );
  }
  return (
    <Notice variante="info" titulo="Aún no tiene revisión">
      <span className="block">
        La versión {ultima.version} se subió el {formatearFechaCreacion(ultima.fechaCreacion)}.
        Cuando tu asesor registre la revisión podrás gestionarla aquí. Las revisiones de versiones
        anteriores están en «Versiones y revisiones».
      </span>
    </Notice>
  );
}

export default function SinRevisionArtefactoPanel({
  artefacto,
  ultima,
  isLoading,
  isError,
  onReintentar,
  puedeSubir,
  motivoSubida,
  onSubir,
  onCerrar,
}: Props) {
  return (
    <SidePanel
      titulo="Gestionar revisión"
      descripcion={`«${artefacto.nombreDocumento}» · ${artefacto.nombreProyecto}`}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <PieRevision onCerrar={solicitarCierre}>
          {!isLoading && !isError && (
            <AccionesRevisionEstudiante
              puedeSubir={puedeSubir}
              motivoSubida={motivoSubida}
              onSubir={onSubir}
            />
          )}
        </PieRevision>
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm">
          <p className="font-medium text-on-surface">{artefacto.nombreDocumento}</p>
          <p className="text-[13px] text-on-surface-secondary">
            Versión {artefacto.versionDocumento} del documento · {artefacto.nombreProyecto}
          </p>
        </div>
        {isError ? (
          <ErrorState
            titulo="No pudimos cargar la última versión"
            descripcion="Inténtalo nuevamente."
            onReintentar={onReintentar}
          />
        ) : isLoading || ultima === undefined ? (
          <Skeleton variante="lineas" etiqueta="Cargando la última versión…" />
        ) : (
          <Aviso ultima={ultima} />
        )}
      </div>
    </SidePanel>
  );
}

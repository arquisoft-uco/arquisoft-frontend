import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Notice from '../../../shared/components/ui/Notice';
import SidePanel from '../../../shared/components/ui/SidePanel';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { useVersionArtefacto } from '../hooks/useVersionArtefacto';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import DetalleVersionArtefactoContenido from './DetalleVersionArtefactoContenido';

interface Props {
  version: VersionArtefacto;
  onCerrar: () => void;
}

export default function DetalleVersionArtefactoPanel({ version, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useVersionArtefacto(version.id);

  function contenido() {
    if (isError) {
      if (hasApiErrorCode(error, 'VERSION_ARTEFACTO_NO_ENCONTRADA')) {
        return <Notice variante="advertencia">Esta versión ya no está disponible.</Notice>;
      }
      if (hasApiErrorCode(error, 'VERSION_ARTEFACTO_ACCESO_DENEGADO')) {
        return <Notice variante="advertencia">No tienes acceso a esta versión.</Notice>;
      }
      return (
        <ErrorState
          titulo="No pudimos cargar la información de la versión"
          descripcion="Inténtalo nuevamente."
          detalle={getApiErrorMessage(error, 'No se pudo cargar la información de la versión.')}
          onReintentar={refetch}
        />
      );
    }
    if (isLoading || !data) {
      return <Skeleton variante="lineas" etiqueta="Cargando información de la versión…" />;
    }
    return <DetalleVersionArtefactoContenido version={data} />;
  }

  return (
    <SidePanel
      titulo="Información de la versión"
      descripcion={`${version.nombreDocumento} · Versión ${version.version}`}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <div className="sticky bottom-0 z-10 border-t border-border bg-surface p-4 sm:px-6">
          <div className="actions-row">
            <Button variante="secundario" onClick={solicitarCierre}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    >
      {contenido()}
    </SidePanel>
  );
}

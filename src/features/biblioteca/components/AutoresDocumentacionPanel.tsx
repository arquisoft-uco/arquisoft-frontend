import { Users } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import ListaPersonas from '../../../shared/components/ui/ListaPersonas';
import SidePanel from '../../../shared/components/ui/SidePanel';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import { useAutoresDocumentacion } from '../hooks/useAutoresDocumentacion';
import type { Documentacion } from '../models/Documentacion';

const TITULO = 'Autores de la documentación';

interface Props {
  documentacion: Documentacion;
  onCerrar: () => void;
}

export default function AutoresDocumentacionPanel({ documentacion, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useAutoresDocumentacion(documentacion.id);

  function contenido() {
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los autores"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      );
    }

    if (isLoading || !data) {
      return <Skeleton variante="lineas" etiqueta="Cargando autores…" />;
    }

    if (data.length === 0) {
      return <EmptyState icono={Users} titulo="Esta documentación no tiene autores registrados" />;
    }

    return <ListaPersonas personas={data} etiqueta={TITULO} />;
  }

  return (
    <SidePanel
      titulo={TITULO}
      descripcion={`Versión ${documentacion.entregableProyectoGrado.versionEntregable} · publicada ${formatearFechaCreacion(documentacion.fechaPublicacion)}`}
      onCerrar={onCerrar}
    >
      {contenido()}
    </SidePanel>
  );
}

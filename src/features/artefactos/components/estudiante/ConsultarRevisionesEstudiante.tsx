import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRevisionesEstudiante } from '../../hooks/useRevisionesEstudiante';
import { desRevision } from '../../utils/revision-gestionable';
import FiltrosRevisionesEstudiante from './FiltrosRevisionesEstudiante';
import GestionarRevisionEstudiantePanel from './GestionarRevisionEstudiantePanel';
import RevisionesEstudianteTable from './RevisionesEstudianteTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const DESCRIPCION_VACIO =
  'Cuando tu asesor envíe una revisión de uno de tus artefactos, la verás aquí.';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'revisión' : 'revisiones'}`;
}

export default function ConsultarRevisionesEstudiante() {
  const listado = useRevisionesEstudiante();
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const revisiones = data?.content ?? [];
  const [revisionAbiertaId, setRevisionAbiertaId] = useState<string | null>(null);

  const revisionAbierta = revisiones.find((r) => r.id === revisionAbiertaId) ?? null;

  return (
    <div className={RAIZ}>
      <FiltrosRevisionesEstudiante listado={listado} />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las revisiones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <RevisionesEstudianteTable
            revisiones={revisiones}
            descripcionVacio={DESCRIPCION_VACIO}
            cargando={isLoading}
            hayFiltros={listado.hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onGestionar={(revision) => setRevisionAbiertaId(revision.id)}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={revisiones.length}
          etiquetaPlural="revisiones"
          onPageChange={listado.goToPage}
        />
      )}

      {revisionAbierta && (
        <GestionarRevisionEstudiantePanel
          revision={desRevision(revisionAbierta)}
          onCerrar={() => setRevisionAbiertaId(null)}
        />
      )}
    </div>
  );
}

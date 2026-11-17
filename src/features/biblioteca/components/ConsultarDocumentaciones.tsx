import { useState } from 'react';
import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import FilterBar from '../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useConfirmarCambioEstadoDocumentacion } from '../hooks/useConfirmarCambioEstadoDocumentacion';
import { useDescargarDocumentacion } from '../hooks/useDescargarDocumentacion';
import { useDocumentaciones } from '../hooks/useDocumentaciones';
import { useEstadosDocumentacion } from '../hooks/useEstadosDocumentacion';
import type { Documentacion } from '../models/Documentacion';
import AutoresDocumentacionPanel from './AutoresDocumentacionPanel';
import ConfirmarCambioEstadoDocumentacion from './ConfirmarCambioEstadoDocumentacion';
import DocumentacionesTable from './DocumentacionesTable';
import ResumenTotal from './ResumenTotal';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  puedeFiltrarPorEstado: boolean;
  puedeVerAutores: boolean;
  puedeCambiarEstado: boolean;
}

export default function ConsultarDocumentaciones({
  puedeFiltrarPorEstado,
  puedeVerAutores,
  puedeCambiarEstado,
}: Props) {
  const [verAutoresDe, setVerAutoresDe] = useState<Documentacion | null>(null);
  const listado = useDocumentaciones(puedeFiltrarPorEstado);
  const { data: estados } = useEstadosDocumentacion(puedeFiltrarPorEstado);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const documentaciones = data?.content ?? [];
  const hayFiltros = listado.estadoIds.length > 0;
  const descarga = useDescargarDocumentacion();
  const cambioEstado = useConfirmarCambioEstadoDocumentacion(listado, documentaciones.length);
  const recargandoSinFilas = isPlaceholderData && documentaciones.length === 0 && !hayFiltros;
  const opciones = estados?.map((estado) => ({ id: estado.id, etiqueta: estado.nombre }));

  return (
    <div className={RAIZ}>
      {puedeFiltrarPorEstado && opciones && (
        <FilterBar
          chips={{
            etiqueta: 'Estado',
            opciones,
            seleccionados: listado.estadoIds,
            onAlternar: listado.toggleEstado,
            onTodos: listado.limpiarEstados,
          }}
          aplicados={[]}
          onLimpiar={listado.limpiarFiltros}
        />
      )}

      <ResumenTotal total={data?.totalElements} singular="documentación" plural="documentaciones" />

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las documentaciones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <DocumentacionesTable
            documentaciones={documentaciones}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: 'fechaPublicacion', direccion: listado.ordenDireccion }}
            onOrdenar={(_campo, direccion) => listado.setOrden(direccion)}
            onLimpiarFiltros={listado.limpiarFiltros}
            onVerAutores={puedeVerAutores ? setVerAutoresDe : undefined}
            onCambiarEstado={puedeCambiarEstado ? cambioEstado.pedirCambio : undefined}
            onDescargar={descarga.descargar}
            descargando={descarga.descargando}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={documentaciones.length}
          etiquetaPlural="documentaciones"
          onPageChange={listado.goToPage}
        />
      )}

      {cambioEstado.cambio && (
        <ConfirmarCambioEstadoDocumentacion
          documentacion={cambioEstado.cambio.documentacion}
          destino={cambioEstado.cambio.destino}
          cargando={cambioEstado.cargando}
          onConfirmar={cambioEstado.confirmar}
          onCancelar={cambioEstado.cancelar}
        />
      )}

      {verAutoresDe && (
        <AutoresDocumentacionPanel
          documentacion={verAutoresDe}
          onCerrar={() => setVerAutoresDe(null)}
        />
      )}
    </div>
  );
}

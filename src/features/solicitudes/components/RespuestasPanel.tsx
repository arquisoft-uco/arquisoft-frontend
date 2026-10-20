import type { ComponentType, ReactNode } from 'react';
import PaginadorListado from '../../../shared/components/PaginadorListado';
import ErrorState from '../../../shared/components/ui/ErrorState';
import type { Page } from '../../../shared/models/api-response';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { FiltrosRespuestas } from '../hooks/useFiltrosRespuestas';
import type { OrdenCampoRespuesta, OrdenDireccionRespuesta } from '../models/ParametrosRespuestas';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import RespuestasFiltros from './RespuestasFiltros';
import ResumenListado from './ResumenListado';

const RAIZ = 'flex flex-col gap-4';

interface Consulta {
  data?: Page<RespuestaSolicitud>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  isPlaceholderData: boolean;
  refetch: () => unknown;
  pageSize: number;
}

export interface TablaRespuestasProps {
  respuestas: RespuestaSolicitud[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: { clave: string; direccion: OrdenDireccionRespuesta };
  onOrdenar: (campo: OrdenCampoRespuesta, direccion: OrdenDireccionRespuesta) => void;
  onLimpiarFiltros: () => void;
  acciones?: (respuesta: RespuestaSolicitud) => ReactNode;
}

interface Props {
  consulta: Consulta;
  filtros: FiltrosRespuestas;
  Tabla: ComponentType<TablaRespuestasProps>;
  acciones?: (respuesta: RespuestaSolicitud) => ReactNode;
}

export default function RespuestasPanel({ consulta, filtros, Tabla, acciones }: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, pageSize } =
    consulta;
  const respuestas = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <RespuestasFiltros filtros={filtros} />

      <ResumenListado total={data?.totalElements} singular="respuesta" plural="respuestas" />

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las respuestas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <Tabla
            acciones={acciones}
            respuestas={respuestas}
            cargando={
              isLoading || (isPlaceholderData && respuestas.length === 0 && !filtros.hayFiltros)
            }
            hayFiltros={filtros.hayFiltros}
            orden={{ clave: filtros.ordenCampo, direccion: filtros.ordenDireccion }}
            onOrdenar={filtros.setOrden}
            onLimpiarFiltros={filtros.limpiarFiltros}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={filtros.page}
          pageSize={pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={respuestas.length}
          etiquetaPlural="respuestas"
          onPageChange={filtros.goToPage}
        />
      )}
    </div>
  );
}

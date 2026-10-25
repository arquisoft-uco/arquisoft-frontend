import type { ReactNode } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { ListadoJuradosEvaluacionData } from '../../hooks/useJuradosEvaluacion';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';
import JuradosEvaluacionTable from './JuradosEvaluacionTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'jurado' : 'jurados'}`;
}

interface Props {
  listado: ListadoJuradosEvaluacionData;
  onVolver: () => void;
  acciones?: (jurado: EvaluacionJurado) => ReactNode;
  encabezadoAcciones?: string;
}

export default function ListadoJuradosEvaluacion({
  listado,
  onVolver,
  acciones,
  encabezadoAcciones,
}: Props) {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const jurados = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '';
  const recargandoSinFilas = isPlaceholderData && jurados.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar jurados',
          placeholder: 'Buscar por nombre del jurado',
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <div className="flex flex-col items-center gap-3">
            <ErrorState
              titulo="No se pudieron cargar los jurados"
              descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
              onReintentar={refetch}
            />
            <Button variante="secundario" onClick={onVolver}>
              Volver a evaluaciones
            </Button>
          </div>
        ) : (
          <JuradosEvaluacionTable
            jurados={jurados}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: 'jurado', direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            acciones={acciones}
            encabezadoAcciones={encabezadoAcciones}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={jurados.length}
          etiquetaPlural="jurados"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}

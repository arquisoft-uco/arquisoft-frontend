import { FileText } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useFichasAsesor } from '../../hooks/useFichasAsesor';
import type { FichaPerfil } from '../../models/FichaPerfil';
import type { ResumenFicha } from '../../models/ResumenFicha';
import { EstadoYFechaTarjeta, TituloFicha } from '../FichaCeldas';
import { columnasEstado } from '../columnasFicha';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'ficha' : 'fichas'}`;
}

function resumenDe(ficha: FichaPerfil): ResumenFicha {
  return {
    id: ficha.id,
    titulo: ficha.tituloProyecto,
    estadoId: ficha.estado.id,
    estadoNombre: ficha.estado.nombre,
    fechaActualizacion: ficha.estado.fechaActualizacion,
  };
}

export default function ConsultarFichasAsesor() {
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch, ...paginacion } =
    useFichasAsesor();
  const fichas = data?.content ?? [];

  const columnas: ColumnaTabla<FichaPerfil>[] = [
    {
      id: 'ficha',
      encabezado: 'Ficha',
      celda: (ficha) => <TituloFicha titulo={ficha.tituloProyecto} abrir={resumenDe(ficha)} />,
    },
    ...columnasEstado<FichaPerfil>((ficha) => ({
      estadoId: ficha.estado.id,
      nombre: ficha.estado.nombre,
      fechaActualizacion: ficha.estado.fechaActualizacion,
    })),
  ];

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las fichas"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <DataTable
            etiqueta="Fichas de perfil que asesoras"
            columnas={columnas}
            filas={fichas}
            idDeFila={(ficha) => ficha.id}
            cargando={isLoading || (isPlaceholderData && fichas.length === 0)}
            vacio={
              <EmptyState
                icono={FileText}
                titulo="Aún no tienes fichas asignadas"
                descripcion="Cuando el coordinador te asigne una, aparecerá aquí."
              />
            }
            tarjeta={(ficha) => (
              <>
                <TituloFicha titulo={ficha.tituloProyecto} abrir={resumenDe(ficha)} />
                <EstadoYFechaTarjeta
                  estadoId={ficha.estado.id}
                  nombre={ficha.estado.nombre}
                  iso={ficha.estado.fechaActualizacion}
                />
              </>
            )}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={paginacion.page}
          pageSize={paginacion.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={fichas.length}
          etiquetaPlural="fichas"
          onPageChange={paginacion.goToPage}
        />
      )}
    </div>
  );
}

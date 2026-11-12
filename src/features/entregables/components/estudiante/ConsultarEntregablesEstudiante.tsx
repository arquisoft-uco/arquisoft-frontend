import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useDescargarPaqueteEntregable } from '../../hooks/useDescargarPaqueteEntregable';
import { useEntregablesEstudiante } from '../../hooks/useEntregablesEstudiante';
import { OPCIONES_ESTADO_PROYECTO, textoAlcanceEstadoProyecto } from '../../utils/estado-proyecto';
import type { EstadoProyectoListado } from '../../utils/estado-proyecto';
import Segmented from '../Segmented';
import EntregablesEstudianteTable from './EntregablesEstudianteTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(estadoProyecto: EstadoProyectoListado, total?: number): string {
  if (total === undefined) return '';
  const entregables = `${total} ${total === 1 ? 'entregable' : 'entregables'}`;
  return `${entregables} · ${textoAlcanceEstadoProyecto(estadoProyecto)}`;
}

interface Props {
  proyectoGradoId: string;
}

export default function ConsultarEntregablesEstudiante({ proyectoGradoId }: Props) {
  const listado = useEntregablesEstudiante(proyectoGradoId);
  const { descargar, descargando } = useDescargarPaqueteEntregable();
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const entregables = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <Segmented
        opciones={OPCIONES_ESTADO_PROYECTO}
        valor={listado.estadoProyecto}
        onCambiar={listado.setEstadoProyecto}
        etiqueta="Proyectos de grado"
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(listado.estadoProyecto, data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los entregables"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EntregablesEstudianteTable
            entregables={entregables}
            cargando={isLoading}
            estadoProyecto={listado.estadoProyecto}
            onDescargarPaquete={descargar}
            descargando={descargando}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={entregables.length}
          etiquetaPlural="entregables"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}

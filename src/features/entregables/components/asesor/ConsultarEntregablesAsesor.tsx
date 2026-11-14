import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useDescargarPaqueteEntregable } from '../../hooks/useDescargarPaqueteEntregable';
import { useEntregablesAsesor } from '../../hooks/useEntregablesAsesor';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import { OPCIONES_ESTADO_PROYECTO, textoAlcanceEstadoProyecto } from '../../utils/estado-proyecto';
import type { EstadoProyectoListado } from '../../utils/estado-proyecto';
import Segmented from '../Segmented';
import ArtefactosEntregablePanel from './ArtefactosEntregablePanel';
import CambiarEstadoEntregablePanel from './CambiarEstadoEntregablePanel';
import EntregablesAsesorTable from './EntregablesAsesorTable';
import HistorialEstadosEntregablePanel from './HistorialEstadosEntregablePanel';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(estadoProyecto: EstadoProyectoListado, total?: number): string {
  if (total === undefined) return '';
  const entregables = `${total} ${total === 1 ? 'entregable' : 'entregables'}`;
  return `${entregables} · ${textoAlcanceEstadoProyecto(estadoProyecto)}`;
}

export default function ConsultarEntregablesAsesor() {
  const listado = useEntregablesAsesor();
  const { data: estados } = useEstadosEntregable();
  const { descargar, descargando } = useDescargarPaqueteEntregable();
  const [enEdicion, setEnEdicion] = useState<{
    entregable: EntregableProyectoGrado;
    destinoInicial?: string;
  } | null>(null);
  const [enArtefactos, setEnArtefactos] = useState<EntregableProyectoGrado | null>(null);
  const [enHistorial, setEnHistorial] = useState<EntregableProyectoGrado | null>(null);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const entregables = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '' || listado.estadoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && entregables.length === 0 && !hayFiltros;
  const opciones = estados?.map((estado) => ({ id: estado.id, etiqueta: estado.nombre }));

  return (
    <div className={RAIZ}>
      <Segmented
        opciones={OPCIONES_ESTADO_PROYECTO}
        valor={listado.estadoProyecto}
        onCambiar={listado.setEstadoProyecto}
        etiqueta="Proyectos de grado"
      />

      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar proyectos',
          placeholder: 'Buscar por nombre del proyecto',
        }}
        chips={
          opciones && {
            etiqueta: 'Estado',
            opciones,
            seleccionados: listado.estadoIds,
            onAlternar: listado.toggleEstado,
            onTodos: listado.limpiarEstados,
          }
        }
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
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
          <EntregablesAsesorTable
            entregables={entregables}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            estadoProyecto={listado.estadoProyecto}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onCambiarEstado={(entregable, destinoInicial) =>
              setEnEdicion({ entregable, destinoInicial })
            }
            onVerArtefactos={setEnArtefactos}
            onVerHistorial={setEnHistorial}
            onDescargarPaquete={descargar}
            descargando={descargando}
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

      {enEdicion && (
        <CambiarEstadoEntregablePanel
          entregable={enEdicion.entregable}
          destinoInicial={enEdicion.destinoInicial}
          onCerrar={() => setEnEdicion(null)}
        />
      )}

      {enArtefactos && (
        <ArtefactosEntregablePanel
          entregable={enArtefactos}
          onCerrar={() => setEnArtefactos(null)}
        />
      )}

      {enHistorial && (
        <HistorialEstadosEntregablePanel
          entregable={enHistorial}
          onCerrar={() => setEnHistorial(null)}
        />
      )}
    </div>
  );
}

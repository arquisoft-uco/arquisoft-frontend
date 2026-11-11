import FilterBar from '../../../shared/components/ui/FilterBar';
import type { OpcionFiltro } from '../../../shared/components/ui/FilterBar';
import type { ListadoVersionesArtefacto } from '../hooks/useListadoVersionesArtefacto';
import { OPCIONES_ESTADO_PROYECTO } from '../utils/estado-proyecto';

interface Props {
  listado: ListadoVersionesArtefacto;
  opcionesEstado?: OpcionFiltro[];
  etiquetaFecha?: string;
}

export default function FiltrosVersionesArtefacto({
  listado,
  opcionesEstado,
  etiquetaFecha = 'Fecha de creación',
}: Props) {
  const nombreArtefacto = listado.data?.content[0]?.nombreDocumento ?? 'seleccionado';
  const etiquetaEstadoProyecto = OPCIONES_ESTADO_PROYECTO.find(
    (opcion) => opcion.id === listado.estadoProyecto,
  )?.etiqueta;
  const aplicados = [
    ...(listado.artefacto
      ? [
          {
            id: 'artefacto',
            etiqueta: `Artefacto: ${nombreArtefacto}`,
            onQuitar: listado.quitarArtefacto,
          },
        ]
      : []),
    ...(listado.estadoProyecto
      ? [
          {
            id: 'estadoProyecto',
            etiqueta: `Proyecto: ${etiquetaEstadoProyecto}`,
            onQuitar: () => listado.setEstadoProyecto(''),
          },
        ]
      : []),
  ];

  return (
    <FilterBar
      busqueda={{
        valor: listado.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar artefactos',
        placeholder: 'Buscar por documento o proyecto',
      }}
      chips={
        opcionesEstado
          ? {
              etiqueta: 'Estado',
              opciones: opcionesEstado,
              seleccionados: listado.estadoIds,
              onAlternar: listado.toggleEstado,
              onTodos: listado.limpiarEstados,
            }
          : undefined
      }
      fechas={{
        etiqueta: etiquetaFecha,
        desde: listado.desde,
        hasta: listado.hasta,
        onCambiarDesde: listado.setDesde,
        onCambiarHasta: listado.setHasta,
      }}
      popover={
        listado.admiteEstadoProyecto
          ? {
              secciones: [
                {
                  id: 'estadoProyecto',
                  etiqueta: 'Estado del proyecto',
                  opciones: OPCIONES_ESTADO_PROYECTO,
                  valor: listado.estadoProyecto ?? '',
                  onCambiar: listado.setEstadoProyecto,
                },
              ],
            }
          : undefined
      }
      aplicados={aplicados}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}

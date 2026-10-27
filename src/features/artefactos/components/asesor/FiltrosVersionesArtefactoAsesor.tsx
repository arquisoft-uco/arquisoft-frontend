import FilterBar from '../../../../shared/components/ui/FilterBar';
import Notice from '../../../../shared/components/ui/Notice';
import type { useArtefactosAsesor } from '../../hooks/useArtefactosAsesor';
import type { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import { formatearFechaFiltro } from '../../utils/filtros-versiones-artefacto';

interface Props {
  listado: ReturnType<typeof useVersionesArtefactoAsesor>;
  catalogo: ReturnType<typeof useArtefactosAsesor>;
}

export default function FiltrosVersionesArtefactoAsesor({ listado, catalogo }: Props) {
  const catalogoNoDisponible = catalogo.isError || catalogo.isLoading;
  const aplicados = [
    ...(listado.artefacto
      ? [
          {
            id: 'artefacto',
            etiqueta: `Artefacto: ${catalogo.nombreDe(listado.artefacto) ?? (catalogo.isLoading ? 'cargando…' : 'sin nombre')}`,
            onQuitar: () => listado.setArtefacto(''),
          },
        ]
      : []),
    ...(listado.desde
      ? [
          {
            id: 'desde',
            etiqueta: `Desde: ${formatearFechaFiltro(listado.desde)}`,
            onQuitar: () => listado.setDesde(''),
          },
        ]
      : []),
    ...(listado.hasta
      ? [
          {
            id: 'hasta',
            etiqueta: `Hasta: ${formatearFechaFiltro(listado.hasta)}`,
            onQuitar: () => listado.setHasta(''),
          },
        ]
      : []),
  ];

  return (
    <FilterBar
      popover={{
        secciones: [
          {
            tipo: 'seleccion',
            id: 'artefacto',
            etiqueta: 'Artefacto',
            opciones: catalogo.opciones,
            valor: listado.artefacto,
            onCambiar: listado.setArtefacto,
            textoVacio: 'No hay artefactos que coincidan',
            placeholder: 'Buscar artefacto',
            deshabilitada: catalogoNoDisponible,
            aviso: catalogoNoDisponible && (
              <Notice variante={catalogo.isError ? 'advertencia' : 'info'}>
                {catalogo.isError
                  ? 'No se pudo cargar la lista de artefactos. Los demás filtros siguen disponibles.'
                  : 'Cargando la lista de artefactos…'}
              </Notice>
            ),
          },
          {
            tipo: 'fechas',
            id: 'fecha-creacion',
            etiqueta: 'Fecha de creación',
            desde: listado.desde,
            hasta: listado.hasta,
            onCambiarDesde: listado.setDesde,
            onCambiarHasta: listado.setHasta,
          },
        ],
      }}
      aplicados={aplicados}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}

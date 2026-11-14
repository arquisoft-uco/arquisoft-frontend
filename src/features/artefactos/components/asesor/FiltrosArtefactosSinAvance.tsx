import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { OpcionFiltro, SeccionFiltro } from '../../../../shared/components/ui/FilterBar';
import type { useArtefactosSinAvanceAsesor } from '../../hooks/useArtefactosSinAvanceAsesor';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import { OPCIONES_ESTADO_PROYECTO } from '../../utils/estado-proyecto';
import UmbralDiasSinAvance from './UmbralDiasSinAvance';

const OPCIONES_ORDEN: OpcionFiltro[] = [
  { id: 'fechaUltimaVersion:ASC', etiqueta: 'Última versión (más antigua primero)' },
  { id: 'fechaUltimaVersion:DESC', etiqueta: 'Última versión (más reciente primero)' },
  { id: 'nombreProyecto:ASC', etiqueta: 'Proyecto (A-Z)' },
  { id: 'nombreProyecto:DESC', etiqueta: 'Proyecto (Z-A)' },
  { id: 'nombreDocumento:ASC', etiqueta: 'Documento (A-Z)' },
  { id: 'nombreDocumento:DESC', etiqueta: 'Documento (Z-A)' },
  { id: 'versionDocumento:ASC', etiqueta: 'Versión (menor a mayor)' },
  { id: 'versionDocumento:DESC', etiqueta: 'Versión (mayor a menor)' },
  { id: 'nombreRepositorio:ASC', etiqueta: 'Repositorio (A-Z)' },
  { id: 'nombreRepositorio:DESC', etiqueta: 'Repositorio (Z-A)' },
  { id: 'estadoUltimaRevision:ASC', etiqueta: 'Estado de revisión (A-Z)' },
  { id: 'estadoUltimaRevision:DESC', etiqueta: 'Estado de revisión (Z-A)' },
];

interface Props {
  listado: ReturnType<typeof useArtefactosSinAvanceAsesor>;
  estados: EstadoRevisionAsesor[] | undefined;
}

export default function FiltrosArtefactosSinAvance({ listado, estados }: Props) {
  const { filtros } = listado;

  const opcionesEstado: OpcionFiltro[] = [
    { id: '', etiqueta: 'Todos' },
    ...(estados ?? []).map((estado) => ({ id: estado.nombre, etiqueta: estado.nombre })),
  ];

  const secciones: SeccionFiltro[] = [
    {
      id: 'estado',
      etiqueta: 'Estado de la última revisión',
      opciones: opcionesEstado,
      valor: filtros.estado,
      onCambiar: listado.setEstado,
      deshabilitada: !estados,
    },
    {
      id: 'estadoProyecto',
      etiqueta: 'Estado del proyecto',
      opciones: OPCIONES_ESTADO_PROYECTO,
      valor: filtros.estadoProyecto,
      onCambiar: listado.setEstadoProyecto,
    },
  ];

  const etiquetaEstadoProyecto = OPCIONES_ESTADO_PROYECTO.find(
    (opcion) => opcion.id === filtros.estadoProyecto,
  )?.etiqueta;
  const aplicados = [
    ...(filtros.estado
      ? [
          {
            id: 'estado',
            etiqueta: `Estado: ${filtros.estado}`,
            onQuitar: () => listado.setEstado(''),
          },
        ]
      : []),
    ...(filtros.estadoProyecto
      ? [
          {
            id: 'estadoProyecto',
            etiqueta: `Proyecto: ${etiquetaEstadoProyecto}`,
            onQuitar: () => listado.setEstadoProyecto(''),
          },
        ]
      : []),
  ];

  function cambiarOrden(id: string) {
    const [campo, direccion] = id.split(':');
    if (direccion === 'ASC' || direccion === 'DESC') listado.setOrden(campo, direccion);
  }

  return (
    <div className="flex flex-col gap-4">
      <UmbralDiasSinAvance
        valor={listado.diasTexto}
        error={listado.errorDias}
        onCambiar={listado.setDias}
      />
      <FilterBar
        busqueda={{
          valor: filtros.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar artefactos',
          placeholder: 'Buscar por proyecto o documento',
        }}
        popover={{ secciones }}
        orden={{
          etiqueta: 'Ordenar por',
          opciones: OPCIONES_ORDEN,
          valor: listado.orden,
          onCambiar: cambiarOrden,
        }}
        aplicados={aplicados}
        onLimpiar={listado.limpiarFiltros}
        totalResultados={listado.dias === null ? undefined : listado.data?.totalElements}
      />
    </div>
  );
}

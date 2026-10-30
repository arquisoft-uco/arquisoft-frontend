import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { OpcionFiltro, SeccionFiltro } from '../../../../shared/components/ui/FilterBar';
import type { useArtefactosEstudiante } from '../../hooks/useArtefactosEstudiante';

interface FiltroAplicado {
  id: string;
  etiqueta: string;
  onQuitar: () => void;
}

const OPCIONES_ORDEN: OpcionFiltro[] = [
  { id: 'nombreProyecto:ASC', etiqueta: 'Proyecto (A-Z)' },
  { id: 'nombreProyecto:DESC', etiqueta: 'Proyecto (Z-A)' },
  { id: 'nombreDocumento:ASC', etiqueta: 'Documento (A-Z)' },
  { id: 'nombreDocumento:DESC', etiqueta: 'Documento (Z-A)' },
  { id: 'versionDocumento:ASC', etiqueta: 'Versión (menor a mayor)' },
  { id: 'versionDocumento:DESC', etiqueta: 'Versión (mayor a menor)' },
  { id: 'nombreRepositorio:ASC', etiqueta: 'Repositorio (A-Z)' },
  { id: 'nombreRepositorio:DESC', etiqueta: 'Repositorio (Z-A)' },
  { id: 'nombreAsesor:ASC', etiqueta: 'Asesor (A-Z)' },
  { id: 'nombreAsesor:DESC', etiqueta: 'Asesor (Z-A)' },
];

interface Props {
  listado: ReturnType<typeof useArtefactosEstudiante>;
}

export default function FiltrosArtefactosEstudiante({ listado }: Props) {
  const { filtros } = listado;

  const campos = [
    {
      id: 'proyecto',
      etiqueta: 'Proyecto',
      aplicado: 'Proyecto',
      valor: filtros.proyecto,
      onCambiar: listado.setProyecto,
    },
    {
      id: 'documento',
      etiqueta: 'Documento',
      aplicado: 'Documento',
      valor: filtros.documento,
      onCambiar: listado.setDocumento,
    },
    {
      id: 'repositorio',
      etiqueta: 'Repositorio',
      aplicado: 'Repositorio',
      valor: filtros.repositorio,
      onCambiar: listado.setRepositorio,
    },
    {
      id: 'asesor',
      etiqueta: 'Asesor',
      aplicado: 'Asesor',
      valor: filtros.asesor,
      onCambiar: listado.setAsesor,
    },
    {
      id: 'version',
      etiqueta: 'Versión del documento',
      aplicado: 'Versión',
      valor: filtros.version,
      onCambiar: listado.setVersion,
    },
  ];

  const secciones: SeccionFiltro[] = campos.map(({ id, etiqueta, valor, onCambiar }) => ({
    id,
    etiqueta,
    valor,
    onCambiar,
    tipo: 'texto',
  }));

  const aplicados: FiltroAplicado[] = campos
    .filter((campo) => campo.valor.trim() !== '')
    .map((campo) => ({
      id: campo.id,
      etiqueta: `${campo.aplicado}: ${campo.valor.trim()}`,
      onQuitar: () => campo.onCambiar(''),
    }));

  function cambiarOrden(id: string) {
    const [campo, direccion] = id.split(':');
    if (direccion === 'ASC' || direccion === 'DESC') listado.setOrden(campo, direccion);
  }

  return (
    <FilterBar
      busqueda={{
        valor: filtros.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar artefactos',
        placeholder: 'Buscar por documento, proyecto, repositorio o asesor',
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
      totalResultados={listado.data?.totalElements}
    />
  );
}

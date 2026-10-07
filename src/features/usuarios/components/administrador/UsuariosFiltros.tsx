import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { OpcionFiltro, SeccionFiltro } from '../../../../shared/components/ui/FilterBar';
import type { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import type { OrdenCampo, OrdenDireccion, useUsuarios } from '../../hooks/useUsuarios';
import { nombreEstadoUsuario } from '../../utils/estados-usuario';
import { ROLES_FILTRABLES } from '../../utils/roles-usuario';

interface OpcionOrden extends OpcionFiltro {
  campo: OrdenCampo;
  direccion: OrdenDireccion;
}

interface FiltroAplicado {
  id: string;
  etiqueta: string;
  onQuitar: () => void;
}

const TODOS: OpcionFiltro = { id: '', etiqueta: 'Todos' };

const OPCIONES_ROL: OpcionFiltro[] = ROLES_FILTRABLES.map(({ rol, etiqueta }) => ({
  id: rol,
  etiqueta,
}));

const OPCIONES_VIGENCIA: OpcionFiltro[] = [
  TODOS,
  { id: 'vigente', etiqueta: 'Vigentes' },
  { id: 'baja', etiqueta: 'Dados de baja' },
];

const OPCIONES_ORDEN: OpcionOrden[] = [
  { id: 'nombre:ASC', etiqueta: 'Nombre (A-Z)', campo: 'nombre', direccion: 'ASC' },
  { id: 'nombre:DESC', etiqueta: 'Nombre (Z-A)', campo: 'nombre', direccion: 'DESC' },
  {
    id: 'identificador:ASC',
    etiqueta: 'Identificador (ascendente)',
    campo: 'identificador',
    direccion: 'ASC',
  },
  {
    id: 'identificador:DESC',
    etiqueta: 'Identificador (descendente)',
    campo: 'identificador',
    direccion: 'DESC',
  },
];

function valorVigencia(vigente?: boolean): string {
  if (vigente === undefined) return '';
  return vigente ? 'vigente' : 'baja';
}

interface Props {
  listado: ReturnType<typeof useUsuarios>;
  estados: ReturnType<typeof useEstadosUsuario>;
}

export default function UsuariosFiltros({ listado, estados }: Props) {
  const { estado, vigente, setEstado, setVigente, setOrden } = listado;

  function alternarRol(id: string) {
    const filtrable = ROLES_FILTRABLES.find(({ rol }) => rol === id);
    if (filtrable) listado.toggleRol(filtrable.rol);
  }

  function cambiarOrden(id: string) {
    const opcion = OPCIONES_ORDEN.find((candidata) => candidata.id === id);
    if (opcion) setOrden(opcion.campo, opcion.direccion);
  }

  const seccionEstado: SeccionFiltro = {
    id: 'estado',
    etiqueta: 'Estado',
    opciones: [TODOS, ...(estados.data ?? []).map(({ id, nombre }) => ({ id, etiqueta: nombre }))],
    valor: estado ?? '',
    onCambiar: (id) => setEstado(id === '' ? undefined : id),
    deshabilitada: estados.isLoading || estados.isError,
    aviso: estados.isError ? <AvisoNoDisponible recurso="estados de usuario" /> : undefined,
  };

  const seccionVigencia: SeccionFiltro = {
    id: 'vigencia',
    etiqueta: 'Vigencia',
    opciones: OPCIONES_VIGENCIA,
    valor: valorVigencia(vigente),
    onCambiar: (id) => setVigente(id === '' ? undefined : id === 'vigente'),
  };

  const aplicados: FiltroAplicado[] = [];
  if (estado !== undefined) {
    aplicados.push({
      id: 'estado',
      etiqueta: `Estado: ${nombreEstadoUsuario(estados.data, estado)}`,
      onQuitar: () => setEstado(undefined),
    });
  }
  if (vigente !== undefined) {
    aplicados.push({
      id: 'vigencia',
      etiqueta: `Vigencia: ${vigente ? 'Vigentes' : 'Dados de baja'}`,
      onQuitar: () => setVigente(undefined),
    });
  }

  return (
    <FilterBar
      busqueda={{
        valor: listado.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar usuarios',
        placeholder: 'Buscar por nombre, correo o identificador',
      }}
      chips={{
        etiqueta: 'Filtrar por rol',
        opciones: OPCIONES_ROL,
        seleccionados: listado.rolesSeleccionados,
        onAlternar: alternarRol,
        onTodos: listado.limpiarRoles,
      }}
      popover={{ secciones: [seccionEstado, seccionVigencia] }}
      orden={{
        etiqueta: 'Ordenar por',
        opciones: OPCIONES_ORDEN,
        valor: `${listado.ordenCampo}:${listado.ordenDireccion}`,
        onCambiar: cambiarOrden,
      }}
      aplicados={aplicados}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}

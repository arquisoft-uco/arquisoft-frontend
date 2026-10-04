import { Pencil, Plus, SearchX, Trash2, Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { OrdenCampo, OrdenDireccion } from '../../hooks/useUsuarios';
import type { EstadoUsuario } from '../../models/EstadoUsuario';
import type { PestanaUsuario } from '../../models/PestanaUsuario';
import type { Usuario } from '../../models/Usuario';
import { IdentidadUsuario, InsigniaEstadoUsuario, InsigniasRol } from './UsuarioCeldas';

const INSIGNIAS_TARJETA = 'flex flex-wrap items-center gap-1.5';
const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';
const DATO_SECUNDARIO = 'text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampo {
  return clave === 'nombre' || clave === 'identificador';
}

interface Props {
  usuarios: Usuario[];
  estados?: EstadoUsuario[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampo, direccion: OrdenDireccion) => void;
  onEditar: (usuario: Usuario, pestana: PestanaUsuario) => void;
  onDarDeBaja: (usuario: Usuario) => void;
  onLimpiarFiltros: () => void;
  onRegistrar: () => void;
}

export default function UsuariosListado({
  usuarios,
  estados,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onEditar,
  onDarDeBaja,
  onLimpiarFiltros,
  onRegistrar,
}: Props) {
  const editarDatos = (usuario: Usuario) => onEditar(usuario, 'datos');

  const columnas: ColumnaTabla<Usuario>[] = [
    {
      id: 'usuario',
      encabezado: 'Usuario',
      clave: 'nombre',
      ordenable: true,
      celda: (usuario) => <IdentidadUsuario usuario={usuario} onEditar={editarDatos} />,
    },
    {
      id: 'identificador',
      encabezado: 'Identificador',
      ordenable: true,
      celda: (usuario) => usuario.identificador,
    },
    {
      id: 'contacto',
      encabezado: 'Contacto',
      celda: (usuario) => <span className={DATO_SECUNDARIO}>{usuario.contacto}</span>,
    },
    { id: 'roles', encabezado: 'Roles', celda: (usuario) => <InsigniasRol usuario={usuario} /> },
    {
      id: 'estado',
      encabezado: 'Estado',
      celda: (usuario) => <InsigniaEstadoUsuario usuario={usuario} estados={estados} />,
    },
  ];

  function ordenar(clave: string, direccion: OrdenDireccion) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  function acciones(usuario: Usuario) {
    return (
      <RowMenu
        etiqueta={`Acciones de ${usuario.nombre}`}
        acciones={[
          { etiqueta: 'Editar', icono: Pencil, onSeleccionar: () => editarDatos(usuario) },
          {
            etiqueta: 'Cambiar roles',
            icono: Users,
            onSeleccionar: () => onEditar(usuario, 'roles'),
          },
          {
            etiqueta: 'Dar de baja…',
            icono: Trash2,
            peligro: true,
            deshabilitada: !usuario.vigente,
            onSeleccionar: () => onDarDeBaja(usuario),
          },
        ]}
      />
    );
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay usuarios que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={Users}
      titulo="Aún no hay usuarios"
      descripcion="Registra el primero para empezar."
      accion={
        <Button variante="secundario" icono={Plus} onClick={onRegistrar}>
          Registrar usuario
        </Button>
      }
    />
  );

  return (
    <DataTable
      etiqueta="Usuarios"
      columnas={columnas}
      filas={usuarios}
      idDeFila={(usuario) => usuario.id}
      orden={orden}
      onOrdenar={ordenar}
      acciones={acciones}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(usuario) => (
        <>
          <IdentidadUsuario usuario={usuario} onEditar={editarDatos} />
          <div className={INSIGNIAS_TARJETA}>
            <InsigniasRol usuario={usuario} />
            <InsigniaEstadoUsuario usuario={usuario} estados={estados} />
          </div>
          <p className={DATO_TARJETA}>{`${usuario.identificador} · ${usuario.contacto}`}</p>
        </>
      )}
    />
  );
}

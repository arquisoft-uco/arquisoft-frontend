import { useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarUsuario } from '../../hooks/useEliminarUsuario';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import { useUsuarios } from '../../hooks/useUsuarios';
import type { Usuario } from '../../models/Usuario';
import ModificarUsuarioForm from './ModificarUsuarioForm';
import UsuariosFiltros from './UsuariosFiltros';
import UsuariosListado from './UsuariosListado';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'usuario' : 'usuarios'}`;
}

interface Props {
  onRegistrar: () => void;
}

export default function ConsultarUsuarios({ onRegistrar }: Props) {
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);
  const [usuarioADarDeBaja, setUsuarioADarDeBaja] = useState<Usuario | null>(null);
  const listado = useUsuarios();
  const estados = useEstadosUsuario();
  const eliminar = useEliminarUsuario();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const usuarios = data?.content ?? [];
  const hayFiltros =
    listado.texto.trim() !== '' ||
    listado.rolesSeleccionados.length > 0 ||
    listado.estado !== undefined ||
    listado.vigente !== undefined;
  const recargandoSinFilas = isPlaceholderData && usuarios.length === 0 && !hayFiltros;

  function confirmarBaja() {
    if (!usuarioADarDeBaja) return;
    const { id, nombre } = usuarioADarDeBaja;
    eliminar.mutate(id, {
      onSuccess: () => toast.success('Usuario dado de baja', `${nombre} ya no está vigente.`),
      onError: (err) =>
        toast.error(
          'No se pudo dar de baja al usuario',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        ),
      onSettled: () => setUsuarioADarDeBaja(null),
    });
  }

  function cancelarBaja() {
    if (!eliminar.isPending) setUsuarioADarDeBaja(null);
  }

  return (
    <div className={RAIZ}>
      {usuarioEnEdicion && (
        <ModificarUsuarioForm
          usuario={usuarioEnEdicion}
          onCerrar={() => setUsuarioEnEdicion(null)}
        />
      )}

      <UsuariosFiltros listado={listado} estados={estados} />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los usuarios"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <UsuariosListado
            usuarios={usuarios}
            estados={estados.data}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onEditar={setUsuarioEnEdicion}
            onDarDeBaja={setUsuarioADarDeBaja}
            onLimpiarFiltros={listado.limpiarFiltros}
            onRegistrar={onRegistrar}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={usuarios.length}
          etiquetaPlural="usuarios"
          onPageChange={listado.goToPage}
        />
      )}

      {usuarioADarDeBaja && (
        <ConfirmDialog
          variante="peligro"
          titulo={`¿Dar de baja a ${usuarioADarDeBaja.nombre}?`}
          descripcion={`Se desactivará el acceso de ${usuarioADarDeBaja.nombre} y dejará de estar vigente. Solo se puede dar de baja a quien ya no tiene roles vigentes.`}
          labelConfirmar="Dar de baja"
          cargando={eliminar.isPending}
          onConfirmar={confirmarBaja}
          onCancelar={cancelarBaja}
        />
      )}
    </div>
  );
}

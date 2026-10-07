import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import { useUsuarios } from '../../hooks/useUsuarios';
import type { PestanaUsuario } from '../../models/PestanaUsuario';
import type { Usuario } from '../../models/Usuario';
import DarDeBajaUsuarioDialog from './DarDeBajaUsuarioDialog';
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
  onEditar: (usuario: Usuario, pestana: PestanaUsuario) => void;
}

export default function ConsultarUsuarios({ onRegistrar, onEditar }: Props) {
  const [usuarioADarDeBaja, setUsuarioADarDeBaja] = useState<Usuario | null>(null);
  const listado = useUsuarios();
  const estados = useEstadosUsuario();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const usuarios = data?.content ?? [];
  const hayFiltros =
    listado.texto.trim() !== '' ||
    listado.rolesSeleccionados.length > 0 ||
    listado.estado !== undefined ||
    listado.vigente !== undefined;
  const recargandoSinFilas = isPlaceholderData && usuarios.length === 0 && !hayFiltros;

  return (
    <div className={RAIZ}>
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
            onEditar={onEditar}
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
        <DarDeBajaUsuarioDialog
          usuario={usuarioADarDeBaja}
          onCerrar={() => setUsuarioADarDeBaja(null)}
        />
      )}
    </div>
  );
}

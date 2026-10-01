import { useAdministradores } from '../../hooks/useAdministradores';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import ConfirmarRemoverRolDialog from './ConfirmarRemoverRolDialog';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarAdministradores() {
  const remover = useRemoverRol();
  const consulta = useAdministradores();

  return (
    <>
      <ConsultarUsuariosRol
        titulo="Administradores"
        idTitulo="administradores-titulo"
        etiquetaSingular="administrador"
        etiquetaPlural="administradores"
        consulta={consulta}
        onRemover={(administrador) =>
          remover.solicitar({
            usuarioId: administrador.id,
            nombre: administrador.nombre,
            rol: Rol.Administrador,
          })
        }
      />

      {remover.objetivo && (
        <ConfirmarRemoverRolDialog
          rol={remover.objetivo.rol}
          nombreUsuario={remover.objetivo.nombre}
          cargando={remover.isPending}
          onConfirmar={() => remover.confirmar()}
          onCancelar={remover.cancelar}
        />
      )}
    </>
  );
}

import { useAsesores } from '../../hooks/useAsesores';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import ConfirmarRemoverRolDialog from './ConfirmarRemoverRolDialog';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarAsesores() {
  const remover = useRemoverRol();
  const consulta = useAsesores();

  return (
    <>
      <ConsultarUsuariosRol
        titulo="Asesores"
        idTitulo="asesores-titulo"
        etiquetaSingular="asesor"
        etiquetaPlural="asesores"
        consulta={consulta}
        onRemover={(asesor) =>
          remover.solicitar({
            usuarioId: asesor.id,
            nombre: asesor.nombre,
            rol: Rol.Asesor,
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

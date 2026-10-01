import { useAsesoresFicha } from '../../hooks/useAsesoresFicha';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import ConfirmarRemoverRolDialog from './ConfirmarRemoverRolDialog';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarAsesoresFicha() {
  const remover = useRemoverRol();
  const consulta = useAsesoresFicha();

  return (
    <>
      <ConsultarUsuariosRol
        titulo="Asesores de ficha"
        idTitulo="asesores-ficha-titulo"
        etiquetaSingular="asesor de ficha"
        etiquetaPlural="asesores de ficha"
        consulta={consulta}
        onRemover={(asesor) =>
          remover.solicitar({
            usuarioId: asesor.id,
            nombre: asesor.nombre,
            rol: Rol.AsesorFicha,
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

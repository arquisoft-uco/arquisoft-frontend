import { useCoordinadores } from '../../hooks/useCoordinadores';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import ConfirmarRemoverRolDialog from './ConfirmarRemoverRolDialog';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarCoordinadores() {
  const remover = useRemoverRol();
  const consulta = useCoordinadores();

  return (
    <>
      <ConsultarUsuariosRol
        titulo="Coordinadores"
        idTitulo="coordinadores-titulo"
        etiquetaSingular="coordinador"
        etiquetaPlural="coordinadores"
        consulta={consulta}
        onRemover={(coordinador) =>
          remover.solicitar({
            usuarioId: coordinador.id,
            nombre: coordinador.nombre,
            rol: Rol.Coordinador,
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

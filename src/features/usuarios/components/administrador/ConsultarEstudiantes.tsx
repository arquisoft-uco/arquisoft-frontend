import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import ConfirmarRemoverRolDialog from './ConfirmarRemoverRolDialog';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarEstudiantes() {
  const remover = useRemoverRol();
  const consulta = useEstudiantes();

  return (
    <>
      <ConsultarUsuariosRol
        titulo="Estudiantes"
        idTitulo="estudiantes-titulo"
        etiquetaSingular="estudiante"
        etiquetaPlural="estudiantes"
        consulta={consulta}
        onRemover={(estudiante) =>
          remover.solicitar({
            usuarioId: estudiante.id,
            nombre: estudiante.nombre,
            rol: Rol.Estudiante,
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

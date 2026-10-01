import { useRepresentantesComite } from '../../hooks/useRepresentantesComite';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import ConfirmarRemoverRolDialog from './ConfirmarRemoverRolDialog';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarRepresentantesComite() {
  const remover = useRemoverRol();
  const consulta = useRepresentantesComite();

  return (
    <>
      <ConsultarUsuariosRol
        titulo="Representantes del comité"
        idTitulo="representantes-comite-titulo"
        etiquetaSingular="representante del comité"
        etiquetaPlural="representantes del comité"
        consulta={consulta}
        onRemover={(representante) =>
          remover.solicitar({
            usuarioId: representante.id,
            nombre: representante.nombre,
            rol: Rol.RepresentanteComiteCurriculum,
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

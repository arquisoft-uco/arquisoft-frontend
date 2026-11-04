import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useRemoverEstudianteArtefacto } from '../../hooks/useRemoverEstudianteArtefacto';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import { mensajeErrorQuitarEstudiante } from '../../utils/errores-estudiantes-artefacto';

interface Props {
  artefactoId: string;
  estudiante: EstudianteArtefacto;
  onCerrar: () => void;
}

export default function RemoverEstudianteArtefactoDialog({
  artefactoId,
  estudiante,
  onCerrar,
}: Props) {
  const quitar = useRemoverEstudianteArtefacto();

  function confirmarQuitar() {
    quitar.mutate(
      { artefactoId, estudianteId: estudiante.estudianteId },
      {
        onSuccess: () => {
          toast.success('Estudiante quitado', `${estudiante.nombre} fue quitado del artefacto.`);
          onCerrar();
        },
        onError: (err) => {
          toast.error('No se pudo quitar al estudiante', mensajeErrorQuitarEstudiante(err));
          onCerrar();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      titulo="¿Quitar estudiante?"
      descripcion={`${estudiante.nombre} será quitado de este artefacto.`}
      consecuencias={[
        'Dejará de ver y entregar este artefacto.',
        'Se le enviará un aviso por correo.',
      ]}
      labelConfirmar="Quitar"
      variante="peligro"
      cargando={quitar.isPending}
      onConfirmar={confirmarQuitar}
      onCancelar={onCerrar}
    />
  );
}

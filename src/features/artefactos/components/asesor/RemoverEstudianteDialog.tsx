import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRemoverEstudiante } from '../../hooks/useRemoverEstudiante';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';

const CONSECUENCIAS = [
  'El estudiante recibirá un correo.',
  'Dejará de tener acceso al artefacto.',
  'Podrás vincularlo de nuevo cuando quieras.',
  'Si es el último, el artefacto queda sin estudiantes.',
];

interface Props {
  artefacto: ArtefactoAsesor;
  estudiante: EstudianteArtefacto;
  onCerrar: () => void;
}

export default function RemoverEstudianteDialog({ artefacto, estudiante, onCerrar }: Props) {
  const { mutate, isPending } = useRemoverEstudiante();

  function handleConfirmar() {
    mutate(
      { artefactoId: artefacto.id, estudianteId: estudiante.estudianteId },
      {
        onSuccess: () => {
          toast.success(
            'Estudiante quitado',
            `${estudiante.nombre} ya no está vinculado a «${artefacto.nombreDocumento}».`,
          );
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo quitar al estudiante',
            getApiErrorMessage(err, 'Inténtalo nuevamente.'),
          );
          onCerrar();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Quitar estudiante?"
      descripcion={`Vas a quitar a ${estudiante.nombre} (${estudiante.identificador}) del artefacto «${artefacto.nombreDocumento}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Quitar estudiante"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}

import type { UseFormReturn } from 'react-hook-form';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Field from '../../../../shared/components/ui/Field';
import { LIMITES } from '../../../../shared/validation';

interface Props {
  titulo: string;
  formulario: UseFormReturn<{ motivo: string }>;
  onContinuar: () => void;
  onCerrar: () => void;
}

export default function MotivoCancelacionDialog({
  titulo,
  formulario,
  onContinuar,
  onCerrar,
}: Props) {
  const { register, watch, formState } = formulario;
  const max = LIMITES.MOTIVO_CANCELACION_PROYECTO_GRADO_MAX;

  return (
    <ConfirmDialog
      titulo="Cancelar proyecto de grado"
      descripcion={`Vas a cancelar el proyecto «${titulo}». Cuéntanos por qué.`}
      aviso="Cancelar un proyecto no se puede revertir."
      labelConfirmar="Cancelar proyecto"
      labelCancelar="Volver"
      onConfirmar={onContinuar}
      onCancelar={onCerrar}
    >
      <Field
        etiqueta="Motivo de la cancelación"
        error={formState.errors.motivo?.message}
        contador={{ actual: (watch('motivo') ?? '').length, max }}
      >
        {(control) => (
          <textarea
            {...control}
            {...register('motivo')}
            rows={4}
            maxLength={max}
            className="field-input"
          />
        )}
      </Field>
    </ConfirmDialog>
  );
}

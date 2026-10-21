import FormActions from '../../../../shared/components/ui/FormActions';
import type { PestanaUsuario } from '../../models/PestanaUsuario';

const NOTAS: Record<Exclude<PestanaUsuario, 'datos'>, string> = {
  roles: 'Sin botón de guardar: cada interruptor actúa al instante.',
  acceso: 'Cada acción de esta pestaña pide confirmación.',
};

interface Props {
  pestana: PestanaUsuario;
  formId: string;
  enviando: boolean;
  sucio: boolean;
  onCancelar: () => void;
}

export default function PieEditarUsuario({ pestana, formId, enviando, sucio, onCancelar }: Props) {
  if (pestana !== 'datos') {
    return <FormActions nota={NOTAS[pestana]} sucio={sucio} onCancelar={onCancelar} />;
  }

  return (
    <FormActions
      formId={formId}
      accion="Guardar cambios"
      accionEnviando="Guardando…"
      enviando={enviando}
      sucio={sucio}
      sinCambios={!sucio}
      onCancelar={onCancelar}
    />
  );
}

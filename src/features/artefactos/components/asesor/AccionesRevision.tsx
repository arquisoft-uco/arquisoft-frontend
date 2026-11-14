import { CheckCheck, Send, Trash2 } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { ID_NOTA_PIE_REVISION } from '../PieRevision';

interface Props {
  habilitado: boolean;
  mostrarNota: boolean;
  puedeCerrar: boolean;
  hayNotaCierre: boolean;
  onEnviar: () => void;
  onCerrarRevision: () => void;
  onEliminarRevision: () => void;
}

export default function AccionesRevision({
  habilitado,
  mostrarNota,
  puedeCerrar,
  hayNotaCierre,
  onEnviar,
  onCerrarRevision,
  onEliminarRevision,
}: Props) {
  return (
    <>
      <Button variante="peligroContorno" icono={Trash2} onClick={onEliminarRevision}>
        Eliminar revisión
      </Button>
      <Button
        variante="secundario"
        icono={CheckCheck}
        disabled={!puedeCerrar}
        aria-describedby={!puedeCerrar && hayNotaCierre ? ID_NOTA_PIE_REVISION : undefined}
        onClick={onCerrarRevision}
      >
        Dar por completado
      </Button>
      <Button
        icono={Send}
        disabled={!habilitado}
        aria-describedby={!habilitado && mostrarNota ? ID_NOTA_PIE_REVISION : undefined}
        onClick={onEnviar}
      >
        Enviar revisión
      </Button>
    </>
  );
}

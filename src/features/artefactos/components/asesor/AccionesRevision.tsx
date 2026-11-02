import { Send } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { ID_NOTA_PIE_REVISION } from '../PieRevision';

interface Props {
  habilitado: boolean;
  mostrarNota: boolean;
  onEnviar: () => void;
}

export default function AccionesRevision({ habilitado, mostrarNota, onEnviar }: Props) {
  return (
    <Button
      icono={Send}
      disabled={!habilitado}
      aria-describedby={!habilitado && mostrarNota ? ID_NOTA_PIE_REVISION : undefined}
      onClick={onEnviar}
    >
      Enviar revisión
    </Button>
  );
}

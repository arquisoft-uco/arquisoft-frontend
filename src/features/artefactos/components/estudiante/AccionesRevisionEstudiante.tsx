import { CheckCheck, Upload } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { ID_MOTIVO_SUBIDA_PIE, ID_NOTA_PIE_REVISION } from '../PieRevision';

interface Props {
  puedeSubir: boolean;
  puedeResolver?: boolean;
  motivoSubida: string | null | undefined;
  onSubir: () => void;
  onResolver?: () => void;
}

export default function AccionesRevisionEstudiante({
  puedeSubir,
  puedeResolver = false,
  motivoSubida,
  onSubir,
  onResolver,
}: Props) {
  const mostrarMotivo = !puedeSubir && !!motivoSubida;

  return (
    <>
      <Button
        variante="secundario"
        icono={Upload}
        disabled={!puedeSubir}
        aria-describedby={mostrarMotivo ? ID_MOTIVO_SUBIDA_PIE : undefined}
        onClick={onSubir}
      >
        Subir nueva versión
      </Button>
      {onResolver && (
        <Button
          icono={CheckCheck}
          disabled={!puedeResolver}
          aria-describedby={!puedeResolver ? ID_NOTA_PIE_REVISION : undefined}
          onClick={onResolver}
        >
          Marcar como resuelta
        </Button>
      )}
    </>
  );
}

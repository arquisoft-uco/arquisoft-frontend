import { CheckCheck, Upload } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { ID_NOTA_PIE_REVISION } from '../PieRevision';

const ID_MOTIVO_SUBIDA = 'motivo-subida-version';

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
      <div className="flex flex-col gap-1">
        <Button
          variante="secundario"
          icono={Upload}
          disabled={!puedeSubir}
          aria-describedby={mostrarMotivo ? ID_MOTIVO_SUBIDA : undefined}
          onClick={onSubir}
        >
          Subir nueva versión
        </Button>
        {mostrarMotivo && (
          <p id={ID_MOTIVO_SUBIDA} className="text-[13px] text-on-surface-secondary">
            {motivoSubida}
          </p>
        )}
      </div>
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

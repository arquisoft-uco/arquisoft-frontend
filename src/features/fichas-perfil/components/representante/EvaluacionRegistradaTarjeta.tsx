import { ClipboardCheck, MessageSquare } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import { FechaDeEstado } from '../FichaCeldas';

const TARJETA = 'flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-card';
const CABECERA = 'flex flex-wrap items-center gap-3';
const DATO = 'text-sm text-on-surface-secondary';

interface Props {
  titulo: string;
  evaluacion: EvaluacionFichaPerfil;
  onVerObservaciones: () => void;
}

export default function EvaluacionRegistradaTarjeta({
  titulo,
  evaluacion,
  onVerObservaciones,
}: Props) {
  return (
    <div className={TARJETA}>
      <div className={CABECERA}>
        <ClipboardCheck size={20} className="shrink-0 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-on-surface">{titulo}</p>
        <Badge
          variante={
            evaluacion.estadoEvaluacionId
              ? varianteEstadoEvaluacion(evaluacion.estadoEvaluacionId)
              : 'neutro'
          }
        >
          {evaluacion.estadoEvaluacionNombre ?? 'Sin estado'}
        </Badge>
      </div>
      <p className={DATO}>
        Creada el <FechaDeEstado iso={evaluacion.fechaCreacion} />
      </p>
      <div>
        <Button
          variante="secundario"
          tamano="sm"
          icono={MessageSquare}
          onClick={onVerObservaciones}
        >
          Ver observaciones
        </Button>
      </div>
    </div>
  );
}

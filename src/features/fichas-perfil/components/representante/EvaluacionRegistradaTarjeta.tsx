import type { ReactNode } from 'react';
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
  acciones?: ReactNode;
  aviso?: string;
}

export default function EvaluacionRegistradaTarjeta({
  titulo,
  evaluacion,
  onVerObservaciones,
  acciones,
  aviso,
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
      {aviso && <p className={DATO}>{aviso}</p>}
      <div className="flex flex-wrap gap-2">
        <Button variante="secundario" icono={MessageSquare} onClick={onVerObservaciones}>
          Ver observaciones
        </Button>
        {acciones}
      </div>
    </div>
  );
}

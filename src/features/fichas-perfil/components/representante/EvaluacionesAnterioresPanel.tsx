import { MessageSquare } from 'lucide-react';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import { FechaDeEstado } from '../FichaCeldas';

const TARJETA = 'flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-card';

interface Props {
  evaluaciones: EvaluacionFichaPerfil[];
  onVerObservaciones: (evaluacion: EvaluacionFichaPerfil) => void;
}

export default function EvaluacionesAnterioresPanel({ evaluaciones, onVerObservaciones }: Props) {
  if (evaluaciones.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-on-surface">Evaluaciones anteriores</h4>
      <ul className="flex flex-col gap-3">
        {evaluaciones.map((evaluacion) => (
          <li key={evaluacion.id} className={TARJETA}>
            <div>
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
            <p className="text-sm text-on-surface-secondary">
              Creada el <FechaDeEstado iso={evaluacion.fechaCreacion} />
            </p>
            <div>
              <Button
                variante="secundario"
                tamano="sm"
                icono={MessageSquare}
                onClick={() => onVerObservaciones(evaluacion)}
              >
                Ver observaciones
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

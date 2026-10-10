import type { ReactNode } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import { varianteEstadoEvaluacion } from '../../../shared/utils/estado-variante';
import type { EvaluacionFichaPerfilEstudiante } from '../models/EvaluacionFichaPerfilEstudiante';
import { FechaDeEstado } from './FichaCeldas';

const TARJETA = 'flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-card';

interface Props {
  evaluacion: EvaluacionFichaPerfilEstudiante;
  children?: ReactNode;
}

export default function TarjetaEvaluacionFicha({ evaluacion, children }: Props) {
  return (
    <li className={TARJETA}>
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
      <p className="text-sm text-on-surface-secondary">
        Evaluada por {evaluacion.representante.nombre}
      </p>
      {children && <div>{children}</div>}
    </li>
  );
}

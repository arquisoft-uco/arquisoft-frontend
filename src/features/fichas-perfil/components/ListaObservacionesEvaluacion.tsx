import { Pencil, Trash2 } from 'lucide-react';
import IconButton from '../../../shared/components/ui/IconButton';
import type { ObservacionEvaluacion } from '../models/ObservacionEvaluacion';

const SEGMENTO =
  'flex items-start gap-3 rounded-xl border border-border bg-surface-secondary p-4 text-sm text-on-surface';

interface Props {
  observaciones: ObservacionEvaluacion[];
  onEditar?: (observacion: ObservacionEvaluacion) => void;
  onEliminar?: (observacion: ObservacionEvaluacion) => void;
}

export default function ListaObservacionesEvaluacion({
  observaciones,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {observaciones.map((observacion) => (
        <li key={observacion.id} className={SEGMENTO}>
          <span className="min-w-0 flex-1 whitespace-pre-line break-words">
            {observacion.observacion}
          </span>
          {(onEditar || onEliminar) && (
            <div className="flex shrink-0 gap-1">
              {onEditar && (
                <IconButton
                  icono={Pencil}
                  etiqueta="Editar observación"
                  onClick={() => onEditar(observacion)}
                />
              )}
              {onEliminar && (
                <IconButton
                  icono={Trash2}
                  tono="peligro"
                  etiqueta="Eliminar observación"
                  onClick={() => onEliminar(observacion)}
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

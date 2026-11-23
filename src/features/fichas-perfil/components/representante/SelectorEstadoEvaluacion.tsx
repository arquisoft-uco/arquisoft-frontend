import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import type { EstadoEvaluacion } from '../../models/fichas-perfil';
import { PREGUNTA_GUIA_POR_ESTADO } from '../../utils/evaluacion-asistente';

interface Props {
  estados: EstadoEvaluacion[];
  valor: string;
  error?: string;
  deshabilitado: boolean;
  onElegir: (id: string) => void;
}

export default function SelectorEstadoEvaluacion({
  estados,
  valor,
  error,
  deshabilitado,
  onElegir,
}: Props) {
  const idError = `${useId()}-error`;

  return (
    <fieldset
      role="radiogroup"
      className="flex min-w-0 flex-col gap-2"
      aria-invalid={!!error}
      aria-describedby={error ? idError : undefined}
    >
      <legend className="field-label">Estado final</legend>
      {estados.map((estado) => (
        <OpcionRadio
          key={estado.id}
          nombre="estadoEvaluacion"
          valor={estado.id}
          titulo={estado.nombre}
          descripcion={PREGUNTA_GUIA_POR_ESTADO[estado.id] ?? estado.descripcion}
          elegida={valor === estado.id}
          deshabilitada={deshabilitado}
          onElegir={onElegir}
        />
      ))}
      {error && (
        <p id={idError} role="alert" className="field-error flex items-start gap-1.5">
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </fieldset>
  );
}

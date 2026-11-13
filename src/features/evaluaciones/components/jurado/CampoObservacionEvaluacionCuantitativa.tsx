import Field from '../../../../shared/components/ui/Field';
import { LIMITES } from '../../../../shared/validation';

interface Props {
  valor: string;
  onCambiar: (texto: string) => void;
  error?: string;
  deshabilitado?: boolean;
}

export default function CampoObservacionEvaluacionCuantitativa({
  valor,
  onCambiar,
  error,
  deshabilitado,
}: Props) {
  return (
    <Field
      etiqueta="Observación"
      opcional
      error={error}
      contador={{ actual: valor.length, max: LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX }}
    >
      {(control) => (
        <textarea
          {...control}
          rows={3}
          maxLength={LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX}
          className="field-input"
          value={valor}
          disabled={deshabilitado}
          onChange={(e) => onCambiar(e.target.value)}
        />
      )}
    </Field>
  );
}

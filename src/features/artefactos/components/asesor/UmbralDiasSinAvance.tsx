import Field from '../../../../shared/components/ui/Field';
import { LIMITES } from '../../../../shared/validation';

const LONGITUD_MAXIMA = String(LIMITES.ARTEFACTO_DIAS_SIN_AVANCE_MAX).length;

interface Props {
  valor: string;
  error?: string;
  onCambiar: (texto: string) => void;
}

export default function UmbralDiasSinAvance({ valor, error, onCambiar }: Props) {
  return (
    <Field
      etiqueta="Días sin avance"
      corto
      ayuda="Artefactos con la última versión de hace más de este número de días"
      error={error}
    >
      {(campo) => (
        <input
          {...campo}
          type="text"
          inputMode="numeric"
          maxLength={LONGITUD_MAXIMA}
          className="field-input"
          value={valor}
          onChange={(evento) => onCambiar(evento.target.value)}
        />
      )}
    </Field>
  );
}

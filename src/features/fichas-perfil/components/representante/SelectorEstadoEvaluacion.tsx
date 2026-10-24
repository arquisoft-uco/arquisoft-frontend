import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../../shared/components/ui/Field';
import type { EstadoEvaluacion } from '../../models/fichas-perfil';

interface Props {
  estados: EstadoEvaluacion[];
  error?: string;
  deshabilitado: boolean;
  registro: UseFormRegisterReturn;
}

export default function SelectorEstadoEvaluacion({
  estados,
  error,
  deshabilitado,
  registro,
}: Props) {
  return (
    <Field etiqueta="Estado" error={error}>
      {(control) => (
        <select {...control} className="field-input" disabled={deshabilitado} {...registro}>
          <option value="">Selecciona un estado...</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

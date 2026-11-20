import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';

interface Props {
  registro: UseFormRegisterReturn;
  min: number;
  max: number;
  error?: string;
}

export default function CampoPesoItemCualitativo({ registro, min, max, error }: Props) {
  return (
    <Field etiqueta="Peso" ayuda={`Entre ${min} y ${max}`} error={error} corto>
      {(control) => (
        <input {...control} type="text" inputMode="numeric" className="field-input" {...registro} />
      )}
    </Field>
  );
}

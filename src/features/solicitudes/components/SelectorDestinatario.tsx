import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import type { EstadoSelectorDestinatario } from '../utils/estado-selector-destinatario';

export type { EstadoSelectorDestinatario };

export interface OpcionSelectorDestinatario {
  clave: string;
  valor: string;
  etiqueta: string;
}

interface Props {
  etiqueta: string;
  estado: EstadoSelectorDestinatario;
  opciones: OpcionSelectorDestinatario[];
  textos: Record<EstadoSelectorDestinatario, string>;
  registro: UseFormRegisterReturn;
  error?: string;
}

export default function SelectorDestinatario({
  etiqueta,
  estado,
  opciones,
  textos,
  registro,
  error,
}: Props) {
  return (
    <Field etiqueta={etiqueta} error={error}>
      {(control) => (
        <select
          className="field-input"
          defaultValue=""
          disabled={estado !== 'listo'}
          {...registro}
          {...control}
        >
          <option value="" disabled hidden>
            {textos[estado]}
          </option>
          {opciones.map((opcion) => (
            <option key={opcion.clave} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

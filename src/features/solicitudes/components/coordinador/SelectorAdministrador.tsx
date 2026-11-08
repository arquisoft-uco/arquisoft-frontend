import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../../shared/components/ui/Field';
import type { AdministradorVigente } from '../../../../shared/models/AdministradorVigente';

export type EstadoSelectorAdministrador = 'cargando' | 'vacio' | 'error' | 'listo';

const TEXTO_PLACEHOLDER: Record<EstadoSelectorAdministrador, string> = {
  cargando: 'Cargando administradores…',
  vacio: 'No hay administradores vigentes',
  error: 'No se pudieron cargar los administradores',
  listo: 'Selecciona un administrador',
};

interface Props {
  etiqueta: string;
  estado: EstadoSelectorAdministrador;
  administradores: AdministradorVigente[];
  registro: UseFormRegisterReturn;
  error?: string;
}

export default function SelectorAdministrador({
  etiqueta,
  estado,
  administradores,
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
            {TEXTO_PLACEHOLDER[estado]}
          </option>
          {administradores.map((administrador) => (
            <option key={administrador.id} value={administrador.id}>
              {administrador.nombre} ({administrador.email})
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

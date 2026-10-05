import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../../shared/components/ui/Field';
import type { TipoItem } from '../../models/fichas-perfil';

interface Props {
  tipos: TipoItem[];
  usados: string[];
  cargando: boolean;
  error?: string;
  registro: UseFormRegisterReturn;
}

export default function SelectorTipoItem({ tipos, usados, cargando, error, registro }: Props) {
  const disponibles = tipos.filter((t) => !usados.includes(t.id));
  const yaAgregados = tipos.filter((t) => usados.includes(t.id));

  return (
    <Field etiqueta="Tipo de ítem" error={error}>
      {(control) => (
        <select className="field-input" aria-busy={cargando} {...registro} {...control}>
          <option value="">{cargando ? 'Cargando tipos…' : 'Selecciona un tipo'}</option>
          {disponibles.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
          {yaAgregados.map((t) => (
            <option key={t.id} value={t.id} disabled>
              {t.nombre} (ya agregado)
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

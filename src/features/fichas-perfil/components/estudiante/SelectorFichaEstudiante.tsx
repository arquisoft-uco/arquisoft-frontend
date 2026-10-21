import Field from '../../../../shared/components/ui/Field';
import type { MiFichaPerfilResponse } from '../../models/MiFichaPerfilResponse';

interface Props {
  fichas: MiFichaPerfilResponse[];
  fichaActivaId: string | null;
  onSeleccionar: (id: string) => void;
}

export default function SelectorFichaEstudiante({ fichas, fichaActivaId, onSeleccionar }: Props) {
  return (
    <div className="max-w-sm">
      <Field etiqueta="Ficha de perfil">
        {(control) => (
          <select
            className="field-input"
            value={fichaActivaId ?? ''}
            onChange={(e) => onSeleccionar(e.target.value)}
            {...control}
          >
            {fichas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.tituloProyecto}
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  );
}

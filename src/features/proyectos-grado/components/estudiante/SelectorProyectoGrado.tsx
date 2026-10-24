import Field from '../../../../shared/components/ui/Field';
import type { ProyectoGrado } from '../../models/ProyectoGrado';

interface Props {
  proyectos: ProyectoGrado[];
  proyectoActivoId: string | null;
  onSeleccionar: (id: string) => void;
}

export default function SelectorProyectoGrado({
  proyectos,
  proyectoActivoId,
  onSeleccionar,
}: Props) {
  return (
    <div className="max-w-sm">
      <Field etiqueta="Proyecto de grado">
        {(control) => (
          <select
            className="field-input"
            value={proyectoActivoId ?? ''}
            onChange={(e) => onSeleccionar(e.target.value)}
            {...control}
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.tituloProyecto}
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  );
}

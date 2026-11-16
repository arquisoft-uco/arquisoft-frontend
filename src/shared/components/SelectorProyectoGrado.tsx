import type { ProyectoGradoEstudiante } from '../models/ProyectoGradoEstudiante';
import { banderasCierreProyecto } from '../utils/estado-proyecto';
import Field from './ui/Field';

interface Props {
  proyectos: ProyectoGradoEstudiante[];
  proyectoActivoId: string | null;
  onSeleccionar: (id: string) => void;
}

function etiquetaOpcion(proyecto: ProyectoGradoEstudiante): string {
  const { proyectoCancelado, proyectoFinalizado } = banderasCierreProyecto(proyecto.estado.id);
  return proyectoCancelado || proyectoFinalizado
    ? `${proyecto.tituloProyecto} · ${proyecto.estado.nombre}`
    : proyecto.tituloProyecto;
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
                {etiquetaOpcion(p)}
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  );
}

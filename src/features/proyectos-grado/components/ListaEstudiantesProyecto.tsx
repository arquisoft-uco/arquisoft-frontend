import Avatar from '../../../shared/components/ui/Avatar';
import type { EstudianteAsesoradoProyectoGrado } from '../models/EstudianteAsesoradoProyectoGrado';

const LISTA = 'flex flex-col gap-3';
const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const NOMBRE = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';

interface Props {
  estudiantes: EstudianteAsesoradoProyectoGrado[];
  etiqueta: string;
  conIdentificador?: boolean;
}

export default function ListaEstudiantesProyecto({
  estudiantes,
  etiqueta,
  conIdentificador = false,
}: Props) {
  return (
    <ul aria-label={etiqueta} className={LISTA}>
      {estudiantes.map((estudiante) => (
        <li key={estudiante.estudianteId} className="min-w-0">
          <div className={IDENTIDAD}>
            <Avatar nombre={estudiante.nombre} />
            <div className={TEXTOS}>
              <span title={estudiante.nombre} className={NOMBRE}>
                {estudiante.nombre}
              </span>
              {conIdentificador && (
                <span title={estudiante.identificador} className={SUBTEXTO}>
                  {estudiante.identificador}
                </span>
              )}
              <span title={estudiante.email} className={SUBTEXTO}>
                {estudiante.email}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

import type { ReactNode } from 'react';
import Avatar from '../../../../shared/components/ui/Avatar';
import Badge from '../../../../shared/components/ui/Badge';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';

const LISTA = 'flex flex-col gap-3';
const FILA = 'flex min-w-0 items-center justify-between gap-3';
const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const NOMBRE = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';
const FILA_NOMBRE = 'flex min-w-0 flex-wrap items-center gap-2';

interface Props {
  estudiantes: EstudianteArtefacto[];
  etiqueta: string;
  acciones?: (estudiante: EstudianteArtefacto) => ReactNode;
}

export default function ListaEstudiantesArtefacto({ estudiantes, etiqueta, acciones }: Props) {
  return (
    <ul aria-label={etiqueta} className={LISTA}>
      {estudiantes.map((estudiante) => (
        <li key={estudiante.id} className={acciones ? FILA : 'min-w-0'}>
          <div className={IDENTIDAD}>
            <Avatar nombre={estudiante.nombre} />
            <div className={TEXTOS}>
              <div className={FILA_NOMBRE}>
                <span title={estudiante.nombre} className={NOMBRE}>
                  {estudiante.nombre}
                </span>
                {!estudiante.vigente && <Badge variante="neutro">No vigente</Badge>}
              </div>
              <span title={estudiante.identificador} className={SUBTEXTO}>
                {estudiante.identificador}
              </span>
              <span title={estudiante.email} className={SUBTEXTO}>
                {estudiante.email}
              </span>
            </div>
          </div>
          {acciones?.(estudiante)}
        </li>
      ))}
    </ul>
  );
}

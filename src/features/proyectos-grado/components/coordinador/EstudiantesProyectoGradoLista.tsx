import { UserMinus } from 'lucide-react';
import Avatar from '../../../../shared/components/ui/Avatar';
import Badge from '../../../../shared/components/ui/Badge';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { EstudianteProyectoGrado } from '../../models/EstudianteProyectoGrado';

const LISTA = 'divide-y divide-border rounded-xl border border-border';
const ITEM = 'flex items-center gap-3 py-2 pl-3 pr-1.5';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const NOMBRE = 'truncate text-sm font-semibold text-on-surface';
const CORREO = 'truncate text-[13px] text-on-surface-secondary';

interface Props {
  estudiantes: EstudianteProyectoGrado[];
  onDestituir?: (estudiante: EstudianteProyectoGrado) => void;
  destituyendo?: boolean;
}

export default function EstudiantesProyectoGradoLista({
  estudiantes,
  onDestituir,
  destituyendo = false,
}: Props) {
  return (
    <ul className={LISTA} aria-label="Estudiantes vinculados">
      {estudiantes.map((estudiante) => (
        <li key={estudiante.id} className={ITEM}>
          <Avatar nombre={estudiante.nombre} />
          <div className={TEXTOS}>
            <span className={NOMBRE}>{estudiante.nombre}</span>
            <span className={CORREO}>{estudiante.email}</span>
          </div>
          {!estudiante.vigente && <Badge variante="peligro">Dado de baja</Badge>}
          {onDestituir && (
            <IconButton
              etiqueta={`Destituir a ${estudiante.nombre}`}
              icono={UserMinus}
              tono="peligro"
              disabled={destituyendo}
              onClick={() => onDestituir(estudiante)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

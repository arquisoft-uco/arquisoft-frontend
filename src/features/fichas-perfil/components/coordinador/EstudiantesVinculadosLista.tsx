import { Trash2 } from 'lucide-react';
import Avatar from '../../../../shared/components/ui/Avatar';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';

const LISTA = 'divide-y divide-border rounded-xl border border-border';
const ITEM = 'flex items-center gap-3 py-2 pl-3 pr-1.5';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const NOMBRE = 'truncate text-sm font-semibold text-on-surface';
const CORREO = 'truncate text-[13px] text-on-surface-secondary';

interface Props {
  estudiantes: EstudianteVinculado[];
  quitando: boolean;
  onQuitar: (estudiante: EstudianteVinculado) => void;
}

export default function EstudiantesVinculadosLista({ estudiantes, quitando, onQuitar }: Props) {
  return (
    <ul className={LISTA} aria-label="Estudiantes vinculados">
      {estudiantes.map((estudiante) => (
        <li key={estudiante.idVinculo} className={ITEM}>
          <Avatar nombre={estudiante.nombre} />
          <div className={TEXTOS}>
            <span className={NOMBRE}>{estudiante.nombre}</span>
            <span className={CORREO}>{estudiante.email}</span>
          </div>
          <IconButton
            etiqueta={`Quitar a ${estudiante.nombre} de la ficha`}
            icono={Trash2}
            tono="peligro"
            disabled={quitando}
            onClick={() => onQuitar(estudiante)}
          />
        </li>
      ))}
    </ul>
  );
}

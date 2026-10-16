import { useId } from 'react';
import type { JuradoVigente } from '../../models/JuradoVigente';

const BASE =
  'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5';
const LIBRE = 'border-border-strong';
const ELEGIDA = 'border-primary bg-primary-muted';
const CASILLA = 'checkbox-control shrink-0 accent-primary';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const NOMBRE = 'truncate text-sm font-semibold text-on-surface';
const CORREO = 'truncate text-[13px] text-on-surface-secondary';

interface Props {
  jurado: JuradoVigente;
  elegido: boolean;
  onAlternar: (jurado: JuradoVigente) => void;
}

export default function OpcionJurado({ jurado, elegido, onAlternar }: Props) {
  const base = useId();
  const idNombre = `${base}-nombre`;
  const idCorreo = `${base}-correo`;

  return (
    <label className={[BASE, elegido ? ELEGIDA : LIBRE].join(' ')}>
      <input
        type="checkbox"
        checked={elegido}
        onChange={() => onAlternar(jurado)}
        aria-labelledby={idNombre}
        aria-describedby={idCorreo}
        className={CASILLA}
      />
      <span className={TEXTOS}>
        <span id={idNombre} className={NOMBRE}>
          {jurado.nombre}
        </span>
        <span id={idCorreo} className={CORREO}>
          {jurado.email}
        </span>
      </span>
    </label>
  );
}

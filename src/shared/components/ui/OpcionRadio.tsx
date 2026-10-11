import { useId } from 'react';

const BASE = 'flex min-h-14 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5';
const HABILITADA = 'cursor-pointer';
const DESHABILITADA = 'cursor-not-allowed opacity-60';
const LIBRE = 'border-border-strong';
const ELEGIDA = 'border-primary bg-primary-muted';
const RADIO = 'checkbox-control shrink-0 accent-primary';
const TEXTOS = 'flex min-w-0 flex-1 flex-col';
const NOMBRE = 'text-sm font-semibold text-on-surface';
const DESCRIPCION = 'text-[13px] text-on-surface-secondary';

interface Props {
  nombre: string;
  valor: string;
  titulo: string;
  descripcion: string;
  elegida: boolean;
  deshabilitada?: boolean;
  onElegir: (valor: string) => void;
}

export default function OpcionRadio({
  nombre,
  valor,
  titulo,
  descripcion,
  elegida,
  deshabilitada = false,
  onElegir,
}: Props) {
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idDescripcion = `${base}-descripcion`;
  const clases = [BASE, deshabilitada ? DESHABILITADA : HABILITADA, elegida ? ELEGIDA : LIBRE].join(
    ' ',
  );

  return (
    <label className={clases}>
      <input
        type="radio"
        name={nombre}
        value={valor}
        checked={elegida}
        disabled={deshabilitada}
        onChange={() => onElegir(valor)}
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        className={RADIO}
      />
      <span className={TEXTOS}>
        <span id={idTitulo} className={NOMBRE}>
          {titulo}
        </span>
        <span id={idDescripcion} className={DESCRIPCION}>
          {descripcion}
        </span>
      </span>
    </label>
  );
}

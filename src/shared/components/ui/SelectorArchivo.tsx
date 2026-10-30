import { formatearTamano } from '../../utils/formato-version';
import type { ControlDeCampo } from './Field';

const RAIZ = 'flex min-w-0 flex-col gap-2';
const RESUMEN = 'truncate text-[13px] text-on-surface-secondary';

interface Props {
  control: ControlDeCampo;
  archivo: File | null;
  onElegir: (archivo: File | null) => void;
  acepta: string;
  deshabilitado: boolean;
}

export default function SelectorArchivo({
  control,
  archivo,
  onElegir,
  acepta,
  deshabilitado,
}: Props) {
  return (
    <div className={RAIZ}>
      <input
        {...control}
        type="file"
        accept={acepta}
        disabled={deshabilitado}
        className="field-input"
        onChange={(evento) => onElegir(evento.target.files?.[0] ?? null)}
      />
      {archivo && (
        <p className={RESUMEN}>
          {archivo.name} · {formatearTamano(archivo.size)}
        </p>
      )}
    </div>
  );
}

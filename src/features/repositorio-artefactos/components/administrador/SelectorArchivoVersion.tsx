import type { ControlDeCampo } from '../../../../shared/components/ui/Field';
import { formatearTamano } from '../../../../shared/utils/formato-version';
import { ACEPTA_VERSION } from '../../utils/tipos-archivo-version';

const RAIZ = 'flex min-w-0 flex-col gap-2';
const RESUMEN = 'truncate text-[13px] text-on-surface-secondary';

interface Props {
  control: ControlDeCampo;
  archivo: File | null;
  onElegir: (archivo: File | null) => void;
  deshabilitado: boolean;
}

export default function SelectorArchivoVersion({
  control,
  archivo,
  onElegir,
  deshabilitado,
}: Props) {
  return (
    <div className={RAIZ}>
      <input
        {...control}
        type="file"
        accept={ACEPTA_VERSION}
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

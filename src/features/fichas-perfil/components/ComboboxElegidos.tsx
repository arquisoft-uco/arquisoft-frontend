import { X } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import IconButton from '../../../shared/components/ui/IconButton';
import type { OpcionCombobox } from '../../../shared/hooks/useCombobox';

const FILA =
  'flex items-center gap-3 rounded-lg border border-border-input bg-surface py-2 pl-3 pr-2';
const TEXTOS = 'flex min-w-0 flex-1 flex-col text-sm';

function Textos({ opcion }: { opcion: OpcionCombobox }) {
  return (
    <span className={TEXTOS}>
      <span className="truncate font-medium text-on-surface">{opcion.etiqueta}</span>
      {opcion.descripcion && (
        <span className="truncate text-xs text-on-surface-secondary">{opcion.descripcion}</span>
      )}
    </span>
  );
}

interface TarjetaProps {
  id?: string;
  opcion: OpcionCombobox;
  deshabilitado?: boolean;
  onCambiar: () => void;
  'aria-describedby'?: string;
}

export function TarjetaElegida({ id, opcion, deshabilitado, onCambiar, ...aria }: TarjetaProps) {
  return (
    <div className={FILA}>
      <Textos opcion={opcion} />
      <Button
        id={id}
        variante="secundario"
        tamano="sm"
        disabled={deshabilitado}
        onClick={onCambiar}
        aria-describedby={aria['aria-describedby']}
      >
        Cambiar
      </Button>
    </div>
  );
}

interface Props {
  etiqueta: string;
  elegidos: OpcionCombobox[];
  max?: number;
  onQuitar: (id: string) => void;
}

export default function ComboboxElegidos({ etiqueta, elegidos, max, onQuitar }: Props) {
  if (elegidos.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ul aria-label={etiqueta} className="flex flex-col gap-2">
        {elegidos.map((opcion) => (
          <li key={opcion.id} className={FILA}>
            <Textos opcion={opcion} />
            <IconButton
              etiqueta={`Quitar a ${opcion.etiqueta}`}
              icono={X}
              onClick={() => onQuitar(opcion.id)}
            />
          </li>
        ))}
      </ul>
      {max !== undefined && (
        <p className="text-xs text-on-surface-secondary">{`${elegidos.length} de ${max}`}</p>
      )}
    </div>
  );
}

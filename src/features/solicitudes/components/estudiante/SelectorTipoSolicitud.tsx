import { GraduationCap, Users, type LucideIcon } from 'lucide-react';
import Field from '../../../../shared/components/ui/Field';

export type TipoSolicitudUi = 'coordinador' | 'asesor';

const TIPOS_SOLICITUD_LOCALES: {
  value: TipoSolicitudUi;
  label: string;
  icono: LucideIcon;
}[] = [
  { value: 'coordinador', label: 'Novedad al coordinador', icono: Users },
  { value: 'asesor', label: 'Novedad al asesor', icono: GraduationCap },
];

const ICONO_DEL_TIPO =
  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary';

interface Props {
  valor: TipoSolicitudUi;
  onCambiar: (tipo: TipoSolicitudUi) => void;
}

export default function SelectorTipoSolicitud({ valor, onCambiar }: Props) {
  const IconoElegido = TIPOS_SOLICITUD_LOCALES.find((t) => t.value === valor)?.icono;

  return (
    <Field etiqueta="Tipo de solicitud">
      {(control) => (
        <div className="relative w-fit max-w-full self-start">
          {IconoElegido && <IconoElegido className={ICONO_DEL_TIPO} aria-hidden />}
          <select
            className="field-input field-input--icono font-medium"
            value={valor}
            onChange={(e) => {
              const elegido = TIPOS_SOLICITUD_LOCALES.find((t) => t.value === e.target.value);
              if (elegido) onCambiar(elegido.value);
            }}
            {...control}
          >
            {TIPOS_SOLICITUD_LOCALES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </Field>
  );
}

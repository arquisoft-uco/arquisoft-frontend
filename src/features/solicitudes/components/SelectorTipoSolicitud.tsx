import { CalendarClock, GraduationCap, UserCog, Users, type LucideIcon } from 'lucide-react';
import Field from '../../../shared/components/ui/Field';

export type TipoSolicitudUi = 'coordinador' | 'asesor';
export type TipoSolicitudEnviableUi = TipoSolicitudUi | 'cambio-asesor';
export type TipoSolicitudNuevaUi = TipoSolicitudEnviableUi | 'ampliacion-plazo';
export type TipoSolicitudEnviadaUi = TipoSolicitudNuevaUi;
export type TipoSolicitudRecibidaUi = 'novedad' | 'cambio-asesor';

interface OpcionTipo<T extends string> {
  value: T;
  label: string;
  icono: LucideIcon;
}

export const TIPOS_SOLICITUD: OpcionTipo<TipoSolicitudUi>[] = [
  { value: 'coordinador', label: 'Novedad al coordinador', icono: Users },
  { value: 'asesor', label: 'Novedad al asesor', icono: GraduationCap },
];

export const TIPOS_SOLICITUD_ENVIABLE: OpcionTipo<TipoSolicitudEnviableUi>[] = [
  ...TIPOS_SOLICITUD,
  { value: 'cambio-asesor', label: 'Cambio de asesor', icono: UserCog },
];

export const TIPOS_SOLICITUD_NUEVA: OpcionTipo<TipoSolicitudNuevaUi>[] = [
  ...TIPOS_SOLICITUD_ENVIABLE,
  { value: 'ampliacion-plazo', label: 'Ampliación de plazo', icono: CalendarClock },
];

export const TIPOS_SOLICITUD_ENVIADA = TIPOS_SOLICITUD_NUEVA;

export const TIPOS_SOLICITUD_RECIBIDA: OpcionTipo<TipoSolicitudRecibidaUi>[] = [
  { value: 'novedad', label: 'Novedad', icono: Users },
  { value: 'cambio-asesor', label: 'Cambio de asesor', icono: UserCog },
];

const ICONO_DEL_TIPO =
  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary';

interface Props<T extends string> {
  valor: T;
  onCambiar: (tipo: T) => void;
  opciones: OpcionTipo<T>[];
}

export default function SelectorTipoSolicitud<T extends string>({
  valor,
  onCambiar,
  opciones,
}: Props<T>) {
  const IconoElegido = opciones.find((t) => t.value === valor)?.icono;

  return (
    <Field etiqueta="Tipo de solicitud">
      {(control) => (
        <div className="relative w-fit max-w-full self-start">
          {IconoElegido && <IconoElegido className={ICONO_DEL_TIPO} aria-hidden />}
          <select
            className="field-input field-input--icono font-medium"
            value={valor}
            onChange={(e) => {
              const elegido = opciones.find((t) => t.value === e.target.value);
              if (elegido) onCambiar(elegido.value);
            }}
            {...control}
          >
            {opciones.map((t) => (
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

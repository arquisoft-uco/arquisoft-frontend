import { useState } from 'react';
import { GraduationCap, Users, type LucideIcon } from 'lucide-react';
import Field from '../../../../shared/components/ui/Field';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';

type TipoSolicitudUi = 'coordinador' | 'asesor';

const TIPOS_SOLICITUD_LOCALES: { value: TipoSolicitudUi; label: string; icono: LucideIcon }[] = [
  { value: 'coordinador', label: 'Novedad al coordinador', icono: Users },
  { value: 'asesor', label: 'Novedad al asesor', icono: GraduationCap },
];

const FORM_POR_TIPO: Record<TipoSolicitudUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
};

const RAIZ = 'flex flex-col gap-4';
const ICONO_DEL_TIPO =
  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-secondary';

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];
  const IconoElegido = TIPOS_SOLICITUD_LOCALES.find((t) => t.value === tipo)?.icono;

  return (
    <div className={RAIZ}>
      <Field etiqueta="Tipo de solicitud">
        {(control) => (
          <div className="relative w-fit max-w-full self-start">
            {IconoElegido && <IconoElegido className={ICONO_DEL_TIPO} aria-hidden />}
            <select
              className="field-input field-input--icono font-medium"
              value={tipo}
              onChange={(e) => {
                const elegido = TIPOS_SOLICITUD_LOCALES.find((t) => t.value === e.target.value);
                if (elegido) setTipo(elegido.value);
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

      <FormularioElegido />
    </div>
  );
}

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

function esTipoSolicitudUi(valor: string): valor is TipoSolicitudUi {
  return valor in FORM_POR_TIPO;
}

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];
  const IconoElegido = TIPOS_SOLICITUD_LOCALES.find((t) => t.value === tipo)?.icono;

  return (
    <div className={RAIZ}>
      <Field etiqueta="Tipo de solicitud">
        {(control) => (
          <div className="relative w-fit max-w-full self-start">
            {IconoElegido && (
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary">
                <IconoElegido size={18} aria-hidden />
              </span>
            )}
            <select
              className="field-input field-input--icono font-medium"
              value={tipo}
              onChange={(e) => {
                if (esTipoSolicitudUi(e.target.value)) setTipo(e.target.value);
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

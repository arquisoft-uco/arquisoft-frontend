import { useState } from 'react';
import { ChevronDown, GraduationCap, Users } from 'lucide-react';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';

type TipoSolicitudUi = 'coordinador' | 'asesor';

const TIPOS: { value: TipoSolicitudUi; label: string; icono: React.ReactNode }[] = [
  { value: 'coordinador', label: 'Novedad al coordinador', icono: <Users size={18} aria-hidden /> },
  { value: 'asesor', label: 'Novedad al asesor', icono: <GraduationCap size={18} aria-hidden /> },
];

const FORM_POR_TIPO: Record<TipoSolicitudUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
};

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];
  const iconoElegido = TIPOS.find((t) => t.value === tipo)?.icono;

  function handleCambiarTipo(e: React.ChangeEvent<HTMLSelectElement>) {
    setTipo(e.target.value as TipoSolicitudUi);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="tipo-solicitud" className="field-label">
          Tipo de solicitud
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary">
            {iconoElegido}
          </span>
          <select
            id="tipo-solicitud"
            className="field-input cursor-pointer appearance-none pl-10! pr-10! font-medium"
            value={tipo}
            onChange={handleCambiarTipo}
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-secondary"
          />
        </div>
      </div>

      <FormularioElegido />
    </div>
  );
}

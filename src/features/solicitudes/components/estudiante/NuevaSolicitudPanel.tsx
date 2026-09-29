import { useState } from 'react';
import NovedadAsesorForm from './NovedadAsesorForm';
import NovedadCoordinadorForm from './NovedadCoordinadorForm';

type TipoSolicitudUi = 'coordinador' | 'asesor';

const TIPOS: { value: TipoSolicitudUi; label: string }[] = [
  { value: 'coordinador', label: 'Novedad al coordinador' },
  { value: 'asesor', label: 'Novedad al asesor' },
];

const FORM_POR_TIPO: Record<TipoSolicitudUi, React.ComponentType> = {
  coordinador: NovedadCoordinadorForm,
  asesor: NovedadAsesorForm,
};

export default function NuevaSolicitudPanel() {
  const [tipo, setTipo] = useState<TipoSolicitudUi>('coordinador');

  const FormularioElegido = FORM_POR_TIPO[tipo];

  function handleCambiarTipo(e: React.ChangeEvent<HTMLSelectElement>) {
    setTipo(e.target.value as TipoSolicitudUi);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="tipo-solicitud" className="field-label">
          Tipo de solicitud
        </label>
        <select
          id="tipo-solicitud"
          className="field-input"
          value={tipo}
          onChange={handleCambiarTipo}
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <FormularioElegido />
    </div>
  );
}

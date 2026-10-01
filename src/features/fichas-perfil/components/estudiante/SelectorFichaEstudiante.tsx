import type { MiFichaPerfilResponse } from '../../models/MiFichaPerfilResponse';

interface Props {
  fichas: MiFichaPerfilResponse[];
  fichaActivaId: string | null;
  onSeleccionar: (id: string) => void;
}

export default function SelectorFichaEstudiante({ fichas, fichaActivaId, onSeleccionar }: Props) {
  return (
    <div>
      <label htmlFor="selector-ficha-estudiante" className="field-label">
        Ficha de perfil
      </label>
      <select
        id="selector-ficha-estudiante"
        className="field-input"
        value={fichaActivaId ?? ''}
        onChange={(e) => onSeleccionar(e.target.value)}
      >
        {fichas.map((f) => (
          <option key={f.id} value={f.id}>
            {f.tituloProyecto}
          </option>
        ))}
      </select>
    </div>
  );
}

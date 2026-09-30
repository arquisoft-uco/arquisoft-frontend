import type { ChangeEvent } from 'react';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';

type OrdenCampo = 'nombre' | 'identificador' | 'email';
type OrdenDireccion = 'ASC' | 'DESC';

const ROLES_FILTRABLES: Rol[] = [
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.Coordinador,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
];

interface OpcionOrden {
  value: string;
  label: string;
  campo?: OrdenCampo;
  direccion?: OrdenDireccion;
}

const OPCIONES_ORDEN: OpcionOrden[] = [
  { value: 'sin-orden', label: 'Sin ordenar' },
  { value: 'nombre:ASC', label: 'Nombre (A-Z)', campo: 'nombre', direccion: 'ASC' },
  { value: 'nombre:DESC', label: 'Nombre (Z-A)', campo: 'nombre', direccion: 'DESC' },
  {
    value: 'identificador:ASC',
    label: 'Identificador (ascendente)',
    campo: 'identificador',
    direccion: 'ASC',
  },
  {
    value: 'identificador:DESC',
    label: 'Identificador (descendente)',
    campo: 'identificador',
    direccion: 'DESC',
  },
  { value: 'email:ASC', label: 'Correo (A-Z)', campo: 'email', direccion: 'ASC' },
  { value: 'email:DESC', label: 'Correo (Z-A)', campo: 'email', direccion: 'DESC' },
];

interface Props {
  rolesSeleccionados: Rol[];
  toggleRol: (rol: Rol) => void;
  estado?: string;
  setEstado: (estado: string | undefined) => void;
  vigente?: boolean;
  setVigente: (vigente: boolean | undefined) => void;
  ordenCampo?: OrdenCampo;
  ordenDireccion: OrdenDireccion;
  setOrden: (campo: OrdenCampo | undefined, direccion?: OrdenDireccion) => void;
}

export default function FiltrosUsuariosPanel({
  rolesSeleccionados,
  toggleRol,
  estado,
  setEstado,
  vigente,
  setVigente,
  ordenCampo,
  ordenDireccion,
  setOrden,
}: Props) {
  const ordenValor = ordenCampo ? `${ordenCampo}:${ordenDireccion}` : 'sin-orden';

  function onCambiarEstado(event: ChangeEvent<HTMLSelectElement>) {
    setEstado(event.target.value === 'todos' ? undefined : event.target.value);
  }

  function onCambiarVigente(event: ChangeEvent<HTMLSelectElement>) {
    const valor = event.target.value;
    setVigente(valor === 'todos' ? undefined : valor === 'vigente');
  }

  function onCambiarOrden(event: ChangeEvent<HTMLSelectElement>) {
    const opcion = OPCIONES_ORDEN.find((candidata) => candidata.value === event.target.value);
    setOrden(opcion?.campo, opcion?.direccion);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-on-surface-secondary">Roles</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {ROLES_FILTRABLES.map((rol) => (
            <label key={rol} className="tap-target gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={rolesSeleccionados.includes(rol)}
                onChange={() => toggleRol(rol)}
                className="checkbox-control rounded border-border text-primary focus:ring-primary"
              />
              {ETIQUETAS_ROL[rol]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="usuarios-filtro-estado" className="field-label">
            Estado
          </label>
          <select
            id="usuarios-filtro-estado"
            className="field-input"
            value={estado ?? 'todos'}
            onChange={onCambiarEstado}
          >
            <option value="todos">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>

        <div>
          <label htmlFor="usuarios-filtro-vigencia" className="field-label">
            Vigencia
          </label>
          <select
            id="usuarios-filtro-vigencia"
            className="field-input"
            value={vigente === undefined ? 'todos' : vigente ? 'vigente' : 'de-baja'}
            onChange={onCambiarVigente}
          >
            <option value="todos">Todos</option>
            <option value="vigente">Vigente</option>
            <option value="de-baja">Dado de baja</option>
          </select>
        </div>

        <div>
          <label htmlFor="usuarios-filtro-orden" className="field-label">
            Ordenar por
          </label>
          <select
            id="usuarios-filtro-orden"
            className="field-input"
            value={ordenValor}
            onChange={onCambiarOrden}
          >
            {OPCIONES_ORDEN.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

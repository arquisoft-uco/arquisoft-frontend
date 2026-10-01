import { useState } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import type { EstadoUsuario } from '../../models/EstadoUsuario';
import { nombreEstadoUsuario } from '../../utils/estados-usuario';

interface Props {
  estadoActual: string;
  estados?: EstadoUsuario[];
  cargando: boolean;
  noDisponible: boolean;
  pendiente: boolean;
  onSolicitar: (estado: EstadoUsuario) => void;
}

export default function EstadoUsuarioFieldset({
  estadoActual,
  estados,
  cargando,
  noDisponible,
  pendiente,
  onSolicitar,
}: Props) {
  const [seleccionado, setSeleccionado] = useState('');

  const opciones = (estados ?? []).filter((estado) => estado.id !== estadoActual);
  const destino = opciones.find((estado) => estado.id === seleccionado);
  const deshabilitado = cargando || noDisponible || pendiente;

  return (
    <fieldset aria-busy={cargando || pendiente}>
      <legend className="mb-1 text-xs font-medium text-on-surface-secondary">Estado</legend>
      <p className="mb-2 text-sm text-on-surface">
        Estado actual: <span className="font-medium">{nombreEstadoUsuario(estados, estadoActual)}</span>
      </p>

      {noDisponible && <AvisoNoDisponible recurso="estados de usuario" />}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="mu-estado" className="field-label">
            Nuevo estado
          </label>
          <select
            id="mu-estado"
            value={seleccionado}
            disabled={deshabilitado}
            onChange={(evento) => setSeleccionado(evento.target.value)}
            className="field-input"
          >
            <option value="">Selecciona un estado</option>
            {opciones.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={deshabilitado || !destino}
          onClick={() => {
            if (destino) onSolicitar(destino);
          }}
          className="rounded-lg border border-border px-4 py-2.5 text-sm text-on-surface transition-colors hover:bg-muted disabled:opacity-50 sm:py-2"
        >
          Cambiar estado
        </button>
      </div>
    </fieldset>
  );
}

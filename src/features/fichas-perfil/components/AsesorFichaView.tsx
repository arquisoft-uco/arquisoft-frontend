import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Page } from '../../../shared/models/api-response';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';
import DetalleFichaAsesor from './asesor-ficha/DetalleFichaAsesor';
import EstadosFichasAsesorPanel from './asesor-ficha/EstadosFichasAsesorPanel';

type Vista = 'fichas' | 'estados';

const VISTAS: { key: Vista; label: string }[] = [
  { key: 'fichas', label: 'Mis fichas' },
  { key: 'estados', label: 'Estados de mis fichas' },
];

export default function AsesorFichaView() {
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfilAsesor | null>(null);
  const [vista, setVista] = useState<Vista>('fichas');
  const queryClient = useQueryClient();

  const handleEstadoCambiado = (nuevoEstado: string) => {
    if (!fichaSeleccionada) return;

    setFichaSeleccionada((prev) => (prev ? { ...prev, estadoActual: nuevoEstado } : prev));

    queryClient.setQueriesData<Page<FichaPerfilAsesor>>(
      { queryKey: ['fichas-perfil', 'asesor'] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((f) =>
            f.id === fichaSeleccionada.id ? { ...f, estadoActual: nuevoEstado } : f,
          ),
        };
      },
    );
  };

  if (fichaSeleccionada) {
    return (
      <DetalleFichaAsesor
        ficha={fichaSeleccionada}
        onVolver={() => setFichaSeleccionada(null)}
        onEstadoCambiado={handleEstadoCambiado}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1" role="tablist">
        {VISTAS.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={vista === v.key}
            type="button"
            onClick={() => setVista(v.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              vista === v.key
                ? 'bg-surface text-on-surface shadow-sm'
                : 'text-on-surface-secondary hover:text-on-surface'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {vista === 'fichas' && <ConsultarFichasAsesor onSeleccionar={setFichaSeleccionada} />}
      {vista === 'estados' && <EstadosFichasAsesorPanel />}
    </div>
  );
}


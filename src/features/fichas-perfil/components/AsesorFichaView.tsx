import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Page } from '../../../shared/models/api-response';
import { useAuthStore } from '../../../auth/authStore';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';
import DetalleFichaAsesor from './asesor-ficha/DetalleFichaAsesor';

export default function AsesorFichaView() {
  const [fichaSeleccionada, setFichaSeleccionada] = useState<FichaPerfilAsesor | null>(null);
  const queryClient = useQueryClient();
  const asesorId = useAuthStore((s) => s.tokenParsed?.sub ?? '');

  const handleEstadoCambiado = (nuevoEstado: string) => {
    if (!fichaSeleccionada) return;

    setFichaSeleccionada((prev) => (prev ? { ...prev, estadoActual: nuevoEstado } : prev));

    queryClient.setQueriesData<Page<FichaPerfilAsesor>>(
      { queryKey: ['fichas-perfil', 'asesor', asesorId] },
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

  return <ConsultarFichasAsesor onSeleccionar={setFichaSeleccionada} />;
}


import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Page } from '../../../shared/models/api-response';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';
import DetalleFichaAsesor from './asesor-ficha/DetalleFichaAsesor';
import EstadosFichasAsesorPanel from './asesor-ficha/EstadosFichasAsesorPanel';

type Vista = 'fichas' | 'estados';

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'fichas', etiqueta: 'Mis fichas' },
  { id: 'estados', etiqueta: 'Estados de mis fichas' },
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
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mis fichas de perfil"
        descripcion="Revisa las fichas que asesoras y el historial de sus estados."
      />
      <Tabs items={VISTAS} valor={vista} onCambiar={setVista} etiqueta="Vistas de mis fichas">
        {vista === 'fichas' && <ConsultarFichasAsesor onSeleccionar={setFichaSeleccionada} />}
        {vista === 'estados' && <EstadosFichasAsesorPanel />}
      </Tabs>
    </div>
  );
}

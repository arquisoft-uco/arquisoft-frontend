import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../../auth/authStore';
import { useMiFichaPerfil } from '../../hooks/useMiFichaPerfil';
import type { MiFichaPerfilResponse } from '../../models/MiFichaPerfilResponse';
import EstadosFichaPanel from '../EstadosFichaPanel';
import HistorialEstadosFichaPanel from './HistorialEstadosFichaPanel';

export default function EstadosMiFichaPanel() {
  const { ficha } = useMiFichaPerfil();
  const queryClient = useQueryClient();
  const estudianteId = useAuthStore((s) => s.tokenParsed?.sub ?? '');

  if (!ficha) return null;

  const handleEstadoCambiado = (nuevoNombre: string) => {
    queryClient.setQueryData(
      ['fichas-perfil', 'estudiante', estudianteId, 'mi-ficha'],
      (prev: MiFichaPerfilResponse) =>
        prev ? { ...prev, estadoActual: { ...prev.estadoActual, nombre: nuevoNombre } } : prev,
    );
  };

  return (
    <div className="space-y-6">
      <HistorialEstadosFichaPanel />
      <EstadosFichaPanel
        fichaPerfilId={ficha.id}
        estadoActual={ficha.estadoActual?.nombre}
        onEstadoCambiado={handleEstadoCambiado}
      />
    </div>
  );
}

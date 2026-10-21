import { useQuery } from '@tanstack/react-query';
import type { Page } from '../../../shared/models/api-response';
import type { EstadoFichaPerfilAsesor } from '../models/EstadoFichaPerfilAsesor';
import type { HistorialEstadoFichaPerfil } from '../models/HistorialEstadoFichaPerfil';
import { fichasPerfilService } from '../services/fichasPerfilService';

// Tope del backend (QueryCriteria.MAX_TAMANIO): cubre el historial completo sin paginar
const TAMANIO_HISTORIAL = 100;

function marcaDeTiempo(fecha: string): number {
  const marca = Date.parse(fecha);
  return Number.isNaN(marca) ? 0 : marca;
}

function aHistorialOrdenado(pagina: Page<EstadoFichaPerfilAsesor>): HistorialEstadoFichaPerfil[] {
  return pagina.content
    .map((estado) => ({
      id: estado.estadoId,
      nombre: estado.estadoNombre,
      fechaActualizacion: estado.fechaActualizacion,
    }))
    .sort((a, b) => marcaDeTiempo(b.fechaActualizacion) - marcaDeTiempo(a.fechaActualizacion));
}

export function useHistorialEstadosFichaAsesor(fichaPerfilId: string) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-estados'],
    queryFn: () =>
      fichasPerfilService.getEstadosFichasAsesor({
        pagina: 0,
        tamanio: TAMANIO_HISTORIAL,
        filtros: { tipo: 'PREDICADO', campo: 'fichaPerfil', operador: 'ES', valor: fichaPerfilId },
      }),
    select: aHistorialOrdenado,
    enabled: !!fichaPerfilId,
  });
}

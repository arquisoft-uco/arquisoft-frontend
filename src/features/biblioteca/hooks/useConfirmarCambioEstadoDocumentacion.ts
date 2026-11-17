import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { Documentacion } from '../models/Documentacion';
import type { DestinoEstadoDocumentacion } from '../utils/transiciones-estado-documentacion';
import { useCambiarEstadoDocumentacion } from './useCambiarEstadoDocumentacion';

const MENSAJES_POR_DESTINO = {
  PUBLICADO: { exito: 'Documentación publicada', error: 'No se pudo publicar la documentación' },
  NO_PUBLICADO: {
    exito: 'Documentación marcada como no publicada',
    error: 'No se pudo marcar como no publicada',
  },
};

interface CambioPendiente {
  documentacion: Documentacion;
  destino: DestinoEstadoDocumentacion;
}

interface Listado {
  estadoIds: string[];
  page: number;
  goToPage: (page: number) => void;
}

export function useConfirmarCambioEstadoDocumentacion(listado: Listado, filasEnPagina: number) {
  const [cambio, setCambio] = useState<CambioPendiente | null>(null);
  const cambiarEstado = useCambiarEstadoDocumentacion();

  function pedirCambio(documentacion: Documentacion, destino: DestinoEstadoDocumentacion) {
    setCambio({ documentacion, destino });
  }

  function cancelar() {
    setCambio(null);
  }

  function confirmar() {
    if (!cambio) return;
    const { documentacion, destino } = cambio;
    const mensajes = MENSAJES_POR_DESTINO[destino];
    cambiarEstado.mutate(
      { documentacionId: documentacion.id, estado: destino },
      {
        onSuccess: () => {
          toast.success(mensajes.exito, documentacion.tituloProyecto ?? undefined);
          setCambio(null);
          const salePorFiltro =
            listado.estadoIds.length > 0 && !listado.estadoIds.includes(destino);
          if (salePorFiltro && filasEnPagina === 1 && listado.page > 0) {
            listado.goToPage(listado.page - 1);
          }
        },
        onError: (err) => {
          toast.error(mensajes.error, getApiErrorMessage(err, 'Inténtalo nuevamente.'));
          setCambio(null);
        },
      },
    );
  }

  return { cambio, pedirCambio, cancelar, confirmar, cargando: cambiarEstado.isPending };
}

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  hasApiErrorCode,
  isApiErrorWithStatus,
} from '../../../shared/utils/api-error';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { Documentacion } from '../models/Documentacion';
import type { EnlaceManualDocumentacion } from '../models/EnlaceManualDocumentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { copiarAlPortapapeles } from '../utils/copiar-al-portapapeles';

const CLAVE_DOCUMENTACIONES = ['biblioteca', 'documentaciones'];
const CODIGO_NO_COMPARTIBLE = 'DOCUMENTACION_NO_COMPARTIBLE';
const MENSAJE_ALMACENAMIENTO =
  'El servicio de archivos no responde. Inténtalo de nuevo en unos minutos';

function mensajeDeError(error: unknown): string {
  if (isApiErrorWithStatus(error, 503)) return MENSAJE_ALMACENAMIENTO;
  return getApiErrorMessage(error, 'Inténtalo nuevamente.');
}

export function useCompartirDocumentacion() {
  const queryClient = useQueryClient();
  const [enlaceManual, setEnlaceManual] = useState<EnlaceManualDocumentacion | null>(null);

  const mutation = useMutation({
    mutationFn: async (documentacion: Documentacion) => {
      const enlace = await bibliotecaService.obtenerEnlaceCompartir(documentacion.id);
      const copiado = await copiarAlPortapapeles(enlace.url);
      return { documentacion, enlace, copiado };
    },
    onSuccess: ({ documentacion, enlace, copiado }) => {
      if (copiado) {
        toast.success(
          'Enlace copiado',
          `El enlace vence el ${formatearFechaCreacion(enlace.expiraEn)}`,
        );
        return;
      }
      setEnlaceManual({ documentacion, enlace });
      toast.info('No se pudo copiar automáticamente', 'Copia el enlace desde la ventana');
    },
    onError: (error) => {
      toast.error('No se pudo compartir la documentación', mensajeDeError(error));
      if (hasApiErrorCode(error, CODIGO_NO_COMPARTIBLE)) {
        queryClient.invalidateQueries({ queryKey: CLAVE_DOCUMENTACIONES });
      }
    },
  });

  function compartir(documentacion: Documentacion): void {
    if (mutation.isPending) return;
    setEnlaceManual(null);
    mutation.mutate(documentacion);
  }

  function cerrarEnlaceManual(): void {
    setEnlaceManual(null);
  }

  return { compartir, compartiendo: mutation.isPending, enlaceManual, cerrarEnlaceManual };
}

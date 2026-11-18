import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  hasApiErrorCode,
  isApiErrorWithStatus,
} from '../../../shared/utils/api-error';
import type { Documentacion } from '../models/Documentacion';
import type { EnlaceCompartidoDocumentacion } from '../models/EnlaceCompartidoDocumentacion';
import { bibliotecaService } from '../services/bibliotecaService';

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
  const [enlaceCompartido, setEnlaceCompartido] = useState<EnlaceCompartidoDocumentacion | null>(
    null,
  );

  const mutation = useMutation({
    mutationFn: async (documentacion: Documentacion) => {
      const enlace = await bibliotecaService.obtenerEnlaceCompartir(documentacion.id);
      return { documentacion, enlace };
    },
    onSuccess: (compartido) => {
      setEnlaceCompartido(compartido);
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
    setEnlaceCompartido(null);
    mutation.mutate(documentacion);
  }

  function cerrarEnlaceCompartido(): void {
    setEnlaceCompartido(null);
  }

  return { compartir, compartiendo: mutation.isPending, enlaceCompartido, cerrarEnlaceCompartido };
}

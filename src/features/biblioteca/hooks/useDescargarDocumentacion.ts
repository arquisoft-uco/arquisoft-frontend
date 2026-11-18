import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  hasApiErrorCode,
  isApiErrorWithStatus,
} from '../../../shared/utils/api-error';
import { iniciarDescarga } from '../../../shared/utils/iniciar-descarga';
import type { Documentacion } from '../models/Documentacion';
import { bibliotecaService } from '../services/bibliotecaService';

const CLAVE_DOCUMENTACIONES = ['biblioteca', 'documentaciones'];
const CODIGO_NO_DESCARGABLE = 'DOCUMENTACION_NO_DESCARGABLE';
const MENSAJE_ALMACENAMIENTO =
  'El servicio de archivos no responde. Inténtalo de nuevo en unos minutos';
const MENSAJES_POR_CODIGO: Record<string, string> = {
  [CODIGO_NO_DESCARGABLE]: 'La documentación ya no está disponible para descargar',
  DOCUMENTACION_ARCHIVO_NO_DISPONIBLE: 'El archivo de esta documentación aún no está disponible',
  DOCUMENTACION_ARCHIVO_AUSENTE:
    'No encontramos el archivo en el almacenamiento. Avisa a la biblioteca',
};

function mensajeDeError(error: unknown): string {
  for (const [codigo, mensaje] of Object.entries(MENSAJES_POR_CODIGO)) {
    if (hasApiErrorCode(error, codigo)) return mensaje;
  }
  if (isApiErrorWithStatus(error, 503)) return MENSAJE_ALMACENAMIENTO;
  return getApiErrorMessage(error, 'Inténtalo nuevamente.');
}

function nombreDe(documentacion: Documentacion): string {
  return (
    documentacion.tituloProyecto ??
    `Documentación, versión ${documentacion.entregableProyectoGrado.versionEntregable}`
  );
}

export function useDescargarDocumentacion() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (documentacion: Documentacion) =>
      bibliotecaService.obtenerEnlaceDescarga(documentacion.id),
    onSuccess: (enlace, documentacion) => {
      iniciarDescarga(enlace.url);
      toast.success('Descarga iniciada', nombreDe(documentacion));
    },
    onError: (error) => {
      toast.error('No se pudo descargar la documentación', mensajeDeError(error));
      if (hasApiErrorCode(error, CODIGO_NO_DESCARGABLE)) {
        queryClient.invalidateQueries({ queryKey: CLAVE_DOCUMENTACIONES });
      }
    },
  });

  function descargar(documentacion: Documentacion): void {
    mutation.mutate(documentacion);
  }

  return { descargar, descargando: mutation.isPending };
}

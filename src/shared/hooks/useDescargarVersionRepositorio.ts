import { useMutation } from '@tanstack/react-query';
import { descargaVersionRepositorioService } from '../services/descargaVersionRepositorioService';
import { getApiErrorMessage } from '../utils/api-error';
import { iniciarDescarga } from '../utils/iniciar-descarga';
import { toast } from './useToast';

interface DescargaVariables {
  versionId: string;
  nombreDocumento: string;
}

export function useDescargarVersionRepositorio() {
  const mutation = useMutation({
    mutationFn: ({ versionId }: DescargaVariables) =>
      descargaVersionRepositorioService.obtenerEnlace(versionId),
    onSuccess: (enlace, { nombreDocumento }) => {
      iniciarDescarga(enlace.url);
      toast.success('Descarga iniciada', nombreDocumento);
    },
    onError: (err) => {
      toast.error(
        'No se pudo descargar el archivo',
        getApiErrorMessage(err, 'No se pudo obtener el archivo. Intenta de nuevo.'),
      );
    },
  });

  function descargar(versionId: string, nombreDocumento: string): void {
    mutation.mutate({ versionId, nombreDocumento });
  }

  return { descargar, descargando: mutation.isPending };
}

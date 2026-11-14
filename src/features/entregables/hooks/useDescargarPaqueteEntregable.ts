import { useMutation } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { iniciarDescarga } from '../../../shared/utils/iniciar-descarga';
import { entregablesService } from '../services/entregablesService';

interface EntregableDescargable {
  id: string;
  versionEntregable: number;
}

export function useDescargarPaqueteEntregable() {
  const mutation = useMutation({
    mutationFn: ({ id }: EntregableDescargable) => entregablesService.obtenerEnlacePaquete(id),
    onSuccess: (enlace, { versionEntregable }) => {
      iniciarDescarga(enlace.url);
      toast.success('Descarga iniciada', `Paquete de la versión ${versionEntregable}`);
    },
    onError: (err) => {
      toast.error(
        'No se pudo descargar el paquete',
        getApiErrorMessage(err, 'Inténtalo de nuevo.'),
      );
    },
  });

  function descargar(entregable: EntregableDescargable): void {
    mutation.mutate(entregable);
  }

  return { descargar, descargando: mutation.isPending };
}

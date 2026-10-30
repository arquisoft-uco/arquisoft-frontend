import apiClient from '../../api/axiosInstance';
import type { DestinoCargaPrefirmada } from '../models/DestinoCargaPrefirmada';

export const cargaPrefirmadaService = {
  cargarArchivo: (
    destino: DestinoCargaPrefirmada,
    archivo: File,
    onProgreso?: (porcentaje: number) => void,
  ): Promise<void> => {
    const formData = new FormData();
    for (const [nombre, valor] of Object.entries(destino.campos)) formData.append(nombre, valor);
    formData.append('file', archivo);
    return apiClient
      .post<void>(destino.url, formData, {
        _sinCredenciales: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: ({ loaded, total }) => {
          if (total) onProgreso?.(Math.round((loaded / total) * 100));
        },
      })
      .then(() => undefined);
  },
};

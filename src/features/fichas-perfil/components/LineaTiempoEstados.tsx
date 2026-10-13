import LineaTiempo from '../../../shared/components/ui/LineaTiempo';
import { varianteEstadoFicha } from '../../../shared/utils/estado-variante';
import type { HistorialEstadoFichaPerfil } from '../models/HistorialEstadoFichaPerfil';

interface Props {
  historial: HistorialEstadoFichaPerfil[];
}

export default function LineaTiempoEstados({ historial }: Props) {
  const pasos = historial.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    variante: varianteEstadoFicha(e.id),
    fecha: e.fechaActualizacion,
  }));

  return <LineaTiempo etiqueta="Historial de estados de la ficha" pasos={pasos} />;
}

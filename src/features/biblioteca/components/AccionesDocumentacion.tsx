import { Eye, EyeOff, Users } from 'lucide-react';
import RowMenu from '../../../shared/components/ui/RowMenu';
import type { Documentacion } from '../models/Documentacion';
import {
  destinosPermitidos,
  type DestinoEstadoDocumentacion,
} from '../utils/transiciones-estado-documentacion';

const ACCION_POR_DESTINO = {
  PUBLICADO: { etiqueta: 'Publicar', icono: Eye },
  NO_PUBLICADO: { etiqueta: 'Marcar como no publicada', icono: EyeOff },
};

interface Props {
  documentacion: Documentacion;
  onVerAutores?: (documentacion: Documentacion) => void;
  onCambiarEstado?: (documentacion: Documentacion, destino: DestinoEstadoDocumentacion) => void;
}

export default function AccionesDocumentacion({
  documentacion,
  onVerAutores,
  onCambiarEstado,
}: Props) {
  const acciones = [];
  if (onVerAutores) {
    acciones.push({
      etiqueta: 'Ver autores',
      icono: Users,
      onSeleccionar: () => onVerAutores(documentacion),
    });
  }
  if (onCambiarEstado) {
    for (const destino of destinosPermitidos(documentacion.estadoDocumentacion.id)) {
      acciones.push({
        ...ACCION_POR_DESTINO[destino],
        onSeleccionar: () => onCambiarEstado(documentacion, destino),
      });
    }
  }
  if (acciones.length === 0) return null;

  return (
    <RowMenu
      etiqueta={`Acciones de la documentación, versión ${documentacion.entregableProyectoGrado.versionEntregable}`}
      acciones={acciones}
    />
  );
}

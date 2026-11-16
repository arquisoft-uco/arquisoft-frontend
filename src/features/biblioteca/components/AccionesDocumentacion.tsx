import { Users } from 'lucide-react';
import RowMenu from '../../../shared/components/ui/RowMenu';
import type { Documentacion } from '../models/Documentacion';

interface Props {
  documentacion: Documentacion;
  onVerAutores: (documentacion: Documentacion) => void;
}

export default function AccionesDocumentacion({ documentacion, onVerAutores }: Props) {
  return (
    <RowMenu
      etiqueta={`Acciones de la documentación, versión ${documentacion.entregableProyectoGrado.versionEntregable}`}
      acciones={[
        {
          etiqueta: 'Ver autores',
          icono: Users,
          onSeleccionar: () => onVerAutores(documentacion),
        },
      ]}
    />
  );
}

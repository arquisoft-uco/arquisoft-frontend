import { BookPlus } from 'lucide-react';
import RowMenu from '../../../shared/components/ui/RowMenu';
import type { EntregableDisponible } from '../models/EntregableDisponible';

interface Props {
  entregable: EntregableDisponible;
  onRegistrar: (entregable: EntregableDisponible) => void;
}

export default function AccionesEntregableDisponible({ entregable, onRegistrar }: Props) {
  return (
    <RowMenu
      etiqueta={`Acciones del entregable, versión ${entregable.versionEntregable}`}
      acciones={[
        {
          etiqueta: 'Registrar documentación',
          icono: BookPlus,
          onSeleccionar: () => onRegistrar(entregable),
        },
      ]}
    />
  );
}

import { EyeOff, RotateCcw, UserRoundPen, Users } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';

interface Props {
  artefacto: ArtefactoAsesor;
  onCambiarAsesor: (artefacto: ArtefactoAsesor) => void;
  onGestionarEstudiantes: (artefacto: ArtefactoAsesor) => void;
  onOmitir: (artefacto: ArtefactoAsesor) => void;
  onReactivar: (artefacto: ArtefactoAsesor) => void;
}

export default function ArtefactoAsesorRowMenu({
  artefacto,
  onCambiarAsesor,
  onGestionarEstudiantes,
  onOmitir,
  onReactivar,
}: Props) {
  const { omitido } = artefacto;
  const acciones = [
    {
      etiqueta: 'Cambiar asesor',
      icono: UserRoundPen,
      onSeleccionar: () => onCambiarAsesor(artefacto),
    },
    {
      etiqueta: omitido ? 'Ver estudiantes' : 'Gestionar estudiantes',
      icono: Users,
      onSeleccionar: () => onGestionarEstudiantes(artefacto),
    },
    {
      etiqueta: omitido ? 'Reactivar artefacto' : 'Omitir artefacto',
      icono: omitido ? RotateCcw : EyeOff,
      onSeleccionar: () => (omitido ? onReactivar(artefacto) : onOmitir(artefacto)),
    },
  ];
  return <RowMenu etiqueta={`Acciones de ${artefacto.nombreDocumento}`} acciones={acciones} />;
}

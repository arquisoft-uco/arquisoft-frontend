import { EyeOff, GitCompareArrows, RotateCcw, UserRoundPen, Users } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';

interface Props {
  artefacto: ArtefactoAsesor;
  onCambiarAsesor: (artefacto: ArtefactoAsesor) => void;
  onCambiarVersionRepositorio: (artefacto: ArtefactoAsesor) => void;
  onGestionarEstudiantes: (artefacto: ArtefactoAsesor) => void;
  onOmitir: (artefacto: ArtefactoAsesor) => void;
  onReactivar: (artefacto: ArtefactoAsesor) => void;
}

export default function ArtefactoAsesorRowMenu({
  artefacto,
  onCambiarAsesor,
  onCambiarVersionRepositorio,
  onGestionarEstudiantes,
  onOmitir,
  onReactivar,
}: Props) {
  const { omitido } = artefacto;
  const acciones = [
    ...(omitido
      ? []
      : [
          {
            etiqueta: 'Cambiar asesor',
            icono: UserRoundPen,
            onSeleccionar: () => onCambiarAsesor(artefacto),
          },
          {
            etiqueta: 'Cambiar versión del repositorio',
            icono: GitCompareArrows,
            onSeleccionar: () => onCambiarVersionRepositorio(artefacto),
          },
        ]),
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

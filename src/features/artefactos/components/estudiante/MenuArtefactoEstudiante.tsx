import { MessageSquare, Upload } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';

type AlElegir = (participacion: ParticipacionArtefacto) => void;

interface Props {
  participacion: ParticipacionArtefacto;
  puedeSubir: boolean;
  onGestionarRevision: AlElegir;
  onSubirVersion: AlElegir;
}

export default function MenuArtefactoEstudiante({
  participacion,
  puedeSubir,
  onGestionarRevision,
  onSubirVersion,
}: Props) {
  if (participacion.omitido) return null;

  const acciones: AccionMenu[] = [
    {
      etiqueta: 'Gestionar revisión',
      icono: MessageSquare,
      onSeleccionar: () => onGestionarRevision(participacion),
    },
  ];
  if (puedeSubir) {
    acciones.push({
      etiqueta: 'Subir nueva versión',
      icono: Upload,
      onSeleccionar: () => onSubirVersion(participacion),
    });
  }

  return <RowMenu etiqueta={`Acciones de ${participacion.nombreDocumento}`} acciones={acciones} />;
}

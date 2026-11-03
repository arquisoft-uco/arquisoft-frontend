import { MessageSquare, Upload } from 'lucide-react';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
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
  const { descargar, descargando } = useDescargarVersionRepositorio();

  const acciones: AccionMenu[] = [
    accionDescargar({
      onSeleccionar: () =>
        descargar(participacion.versionRepositorioArtefacto, participacion.nombreDocumento),
      deshabilitada: descargando,
    }),
  ];
  if (!participacion.omitido) {
    acciones.push({
      etiqueta: 'Gestionar revisión',
      icono: MessageSquare,
      onSeleccionar: () => onGestionarRevision(participacion),
    });
  }
  if (!participacion.omitido && puedeSubir) {
    acciones.push({
      etiqueta: 'Subir nueva versión',
      icono: Upload,
      onSeleccionar: () => onSubirVersion(participacion),
    });
  }

  return <RowMenu etiqueta={`Acciones de ${participacion.nombreDocumento}`} acciones={acciones} />;
}

import {
  ClipboardList,
  ClipboardPlus,
  EyeOff,
  GitCompareArrows,
  RotateCcw,
  UserRoundPen,
  Users,
} from 'lucide-react';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { AccionRevisionAsesor } from '../../utils/accion-revision-asesor';
import { estaCerrado } from '../../utils/estado-proyecto';

type AlElegir = (artefacto: ArtefactoAsesor) => void;

export interface AccionesArtefactoAsesor {
  revisionDe: (artefacto: ArtefactoAsesor) => AccionRevisionAsesor | null;
  onRevision: (accion: AccionRevisionAsesor) => void;
  onCambiarAsesor: AlElegir;
  onCambiarVersionRepositorio: AlElegir;
  onGestionarEstudiantes: AlElegir;
  onOmitir: AlElegir;
  onReactivar: AlElegir;
}

interface Props extends AccionesArtefactoAsesor {
  artefacto: ArtefactoAsesor;
}

function accionRevision(
  revision: AccionRevisionAsesor | null,
  onRevision: (accion: AccionRevisionAsesor) => void,
): AccionMenu[] {
  if (!revision) return [];
  const registrar = revision.tipo === 'registrar';
  return [
    {
      etiqueta: registrar ? 'Registrar revisión' : 'Gestionar revisión',
      icono: registrar ? ClipboardPlus : ClipboardList,
      onSeleccionar: () => onRevision(revision),
    },
  ];
}

export default function ArtefactoAsesorRowMenu({
  artefacto,
  revisionDe,
  onRevision,
  onCambiarAsesor,
  onCambiarVersionRepositorio,
  onGestionarEstudiantes,
  onOmitir,
  onReactivar,
}: Props) {
  const { omitido } = artefacto;
  const proyectoCerrado = estaCerrado(artefacto);
  const soloLectura = omitido || proyectoCerrado;
  const { descargar, descargando } = useDescargarVersionRepositorio();
  const acciones = [
    ...accionRevision(revisionDe(artefacto), onRevision),
    ...(soloLectura
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
    accionDescargar({
      onSeleccionar: () =>
        descargar(artefacto.versionRepositorioArtefacto, artefacto.nombreDocumento),
      deshabilitada: descargando,
    }),
    {
      etiqueta: soloLectura ? 'Ver estudiantes' : 'Gestionar estudiantes',
      icono: Users,
      onSeleccionar: () => onGestionarEstudiantes(artefacto),
    },
    ...(proyectoCerrado
      ? []
      : [
          {
            etiqueta: omitido ? 'Reactivar artefacto' : 'Omitir artefacto',
            icono: omitido ? RotateCcw : EyeOff,
            onSeleccionar: () => (omitido ? onReactivar(artefacto) : onOmitir(artefacto)),
          },
        ]),
  ];
  return <RowMenu etiqueta={`Acciones de ${artefacto.nombreDocumento}`} acciones={acciones} />;
}

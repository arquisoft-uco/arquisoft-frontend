import { EyeOff, GitCompareArrows, RotateCcw, UserRoundPen, Users } from 'lucide-react';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { estaCerrado } from '../../utils/estado-proyecto';

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
  const proyectoCerrado = estaCerrado(artefacto);
  const soloLectura = omitido || proyectoCerrado;
  const { descargar, descargando } = useDescargarVersionRepositorio();
  const acciones = [
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

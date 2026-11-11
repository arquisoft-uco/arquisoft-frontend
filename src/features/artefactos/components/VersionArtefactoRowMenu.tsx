import { Info } from 'lucide-react';
import { accionDescargar } from '../../../shared/components/accionDescargar';
import RowMenu from '../../../shared/components/ui/RowMenu';
import type { AccionMenu } from '../../../shared/components/ui/RowMenu';
import { useDescargarVersionRepositorio } from '../../../shared/hooks/useDescargarVersionRepositorio';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { estaCerrado } from '../utils/estado-proyecto';

interface Props {
  version: VersionArtefacto;
  onVerInformacion: (version: VersionArtefacto) => void;
  accionesAdicionales?: (version: VersionArtefacto) => AccionMenu[];
}

export default function VersionArtefactoRowMenu({
  version,
  onVerInformacion,
  accionesAdicionales,
}: Props) {
  const { descargar, descargando } = useDescargarVersionRepositorio('artefacto');
  const proyectoCerrado = estaCerrado(version);

  return (
    <RowMenu
      etiqueta={`Acciones de la versión ${version.version} de ${version.nombreDocumento}`}
      acciones={[
        {
          etiqueta: 'Ver información',
          icono: Info,
          onSeleccionar: () => onVerInformacion(version),
        },
        ...(proyectoCerrado
          ? []
          : [
              accionDescargar({
                onSeleccionar: () => descargar(version.id, version.nombreDocumento),
                deshabilitada: descargando,
              }),
            ]),
        ...(accionesAdicionales?.(version) ?? []),
      ]}
    />
  );
}

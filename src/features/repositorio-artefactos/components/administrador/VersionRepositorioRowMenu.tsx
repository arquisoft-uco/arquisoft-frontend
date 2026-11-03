import RowMenu from '../../../../shared/components/ui/RowMenu';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';

interface Props {
  version: VersionRepositorioArtefacto;
}

export default function VersionRepositorioRowMenu({ version }: Props) {
  const { descargar, descargando } = useDescargarVersionRepositorio();

  const acciones = [
    accionDescargar({
      onSeleccionar: () => descargar(version.id, version.nombreDocumento),
      deshabilitada: descargando,
    }),
  ];

  return (
    <RowMenu
      etiqueta={`Acciones de ${version.nombreDocumento} versión ${version.numeroVersion}`}
      acciones={acciones}
    />
  );
}

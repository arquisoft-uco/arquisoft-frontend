import RowMenu from '../../../../shared/components/ui/RowMenu';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';

interface Props {
  artefacto: ArtefactoEstudiante;
}

export default function MenuDescargarArtefacto({ artefacto }: Props) {
  const { descargar, descargando } = useDescargarVersionRepositorio();

  return (
    <RowMenu
      etiqueta={`Acciones de ${artefacto.nombreDocumento}`}
      acciones={[
        accionDescargar({
          onSeleccionar: () =>
            descargar(artefacto.versionRepositorioArtefacto, artefacto.nombreDocumento),
          deshabilitada: descargando,
        }),
      ]}
    />
  );
}

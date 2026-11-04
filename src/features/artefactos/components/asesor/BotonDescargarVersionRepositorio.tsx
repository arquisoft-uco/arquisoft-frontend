import { Download } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import type { VersionRepositorioAsesor } from '../../models/VersionRepositorioAsesor';

interface Props {
  version: VersionRepositorioAsesor;
}

export default function BotonDescargarVersionRepositorio({ version }: Props) {
  const { descargar, descargando } = useDescargarVersionRepositorio();

  return (
    <IconButton
      icono={Download}
      etiqueta={`Descargar ${version.nombreDocumento} versión ${version.numeroVersion}`}
      disabled={descargando}
      onClick={() => descargar(version.id, version.nombreDocumento)}
    />
  );
}

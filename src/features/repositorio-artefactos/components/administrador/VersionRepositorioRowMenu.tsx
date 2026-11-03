import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import EliminarVersionRepositorioDialog from './EliminarVersionRepositorioDialog';

interface Props {
  version: VersionRepositorioArtefacto;
  repositorioId: string;
  puedeEliminar: boolean;
}

export default function VersionRepositorioRowMenu({
  version,
  repositorioId,
  puedeEliminar,
}: Props) {
  const { descargar, descargando } = useDescargarVersionRepositorio();
  const [eliminando, setEliminando] = useState(false);

  const acciones = [
    accionDescargar({
      onSeleccionar: () => descargar(version.id, version.nombreDocumento),
      deshabilitada: descargando,
    }),
    ...(puedeEliminar
      ? [
          {
            etiqueta: 'Eliminar',
            icono: Trash2,
            peligro: true,
            onSeleccionar: () => setEliminando(true),
          },
        ]
      : []),
  ];

  return (
    <>
      <RowMenu
        etiqueta={`Acciones de ${version.nombreDocumento} versión ${version.numeroVersion}`}
        acciones={acciones}
      />
      {eliminando && (
        <EliminarVersionRepositorioDialog
          version={version}
          repositorioId={repositorioId}
          onCerrar={() => setEliminando(false)}
        />
      )}
    </>
  );
}

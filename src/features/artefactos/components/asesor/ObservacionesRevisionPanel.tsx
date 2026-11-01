import { useState } from 'react';
import { MessageSquarePlus, Send, Trash2 } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import IconButton from '../../../../shared/components/ui/IconButton';
import Notice from '../../../../shared/components/ui/Notice';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import { usePuedeGestionarObservaciones } from '../../hooks/usePuedeGestionarObservaciones';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { estadoPermiteGestionarObservaciones } from '../../utils/revision-version';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';
import AgregarObservacionPanel from './AgregarObservacionPanel';
import EliminarObservacionDialog from './EliminarObservacionDialog';
import EnviarRevisionDialog from './EnviarRevisionDialog';

const LONGITUD_ETIQUETA = 40;
const AVISO_NO_PENDIENTE =
  'Esta revisión ya no está pendiente: sus observaciones no se pueden cambiar.';
const AVISO_OMITIDO = 'Este artefacto está omitido y no admite cambios.';

function resumir(texto: string) {
  return texto.length > LONGITUD_ETIQUETA ? `${texto.slice(0, LONGITUD_ETIQUETA)}…` : texto;
}

interface Props {
  revisionAsesorId: string;
  version: VersionArtefacto;
  editable: boolean;
  onCerrar: () => void;
}

export default function ObservacionesRevisionPanel({
  revisionAsesorId,
  version,
  editable,
  onCerrar,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useObservacionesRevision(revisionAsesorId);
  const { omitidos } = usePuedeGestionarObservaciones();
  const [agregando, setAgregando] = useState(false);
  const [aEliminar, setAEliminar] = useState<ObservacionRevision | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (agregando) {
    return (
      <AgregarObservacionPanel
        revisionAsesorId={revisionAsesorId}
        version={version}
        onVolver={() => setAgregando(false)}
        onSalir={onCerrar}
      />
    );
  }

  let textoAviso: string | null = null;
  if (!editable) {
    if (!estadoPermiteGestionarObservaciones(version)) textoAviso = AVISO_NO_PENDIENTE;
    else if (omitidos?.has(version.artefacto)) textoAviso = AVISO_OMITIDO;
  }

  return (
    <>
      <ObservacionesRevisionPanelBase
        descripcion={`«${version.nombreDocumento}» · Versión ${version.version}`}
        descripcionVacia={
          editable
            ? 'Agrega la primera observación de esta revisión.'
            : 'Aún no hay observaciones registradas en esta revisión.'
        }
        observaciones={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReintentar={() => void refetch()}
        onCerrar={onCerrar}
        aviso={textoAviso && <Notice variante="info">{textoAviso}</Notice>}
        barra={
          editable && (
            <div className="actions-row">
              <Button icono={MessageSquarePlus} onClick={() => setAgregando(true)}>
                Agregar observación
              </Button>
              <Button variante="secundario" icono={Send} onClick={() => setEnviando(true)}>
                Enviar revisión
              </Button>
            </div>
          )
        }
        acciones={
          editable
            ? (observacion) => (
                <IconButton
                  tono="peligro"
                  icono={Trash2}
                  etiqueta={`Eliminar observación: ${resumir(observacion.descripcion)}`}
                  onClick={() => setAEliminar(observacion)}
                />
              )
            : undefined
        }
      />
      {aEliminar && (
        <EliminarObservacionDialog observacion={aEliminar} onCerrar={() => setAEliminar(null)} />
      )}
      {enviando && (
        <EnviarRevisionDialog
          version={version}
          revisionAsesorId={revisionAsesorId}
          onCerrar={() => setEnviando(false)}
          onSalir={onCerrar}
        />
      )}
    </>
  );
}

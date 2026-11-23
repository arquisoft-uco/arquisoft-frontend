import {
  gestionarRevisionRegistrada,
  type AccionRevisionAsesor,
} from '../../utils/accion-revision-asesor';
import GestionarRevisionPanel from './GestionarRevisionPanel';
import RegistrarRevisionDialog from './RegistrarRevisionDialog';

interface Props {
  accion: AccionRevisionAsesor;
  onCambiar: (accion: AccionRevisionAsesor | null) => void;
}

export default function RevisionAsesorDialogo({ accion, onCambiar }: Props) {
  if (accion.tipo === 'registrar') {
    const { version } = accion;
    return (
      <RegistrarRevisionDialog
        version={version}
        onCerrar={() => onCambiar(null)}
        onRegistrada={(id) => onCambiar(gestionarRevisionRegistrada(version, id))}
      />
    );
  }
  return (
    <GestionarRevisionPanel
      revisionAsesorId={accion.revisionAsesorId}
      version={accion.version}
      onCerrar={() => onCambiar(null)}
    />
  );
}

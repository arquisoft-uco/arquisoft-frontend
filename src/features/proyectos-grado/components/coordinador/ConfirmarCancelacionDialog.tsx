import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { FRASE_CONFIRMACION_CANCELACION } from '../../utils/frase-confirmacion';
import CampoFraseConfirmacion from '../CampoFraseConfirmacion';

const CONSECUENCIAS = [
  'Se borran los archivos de los artefactos del proyecto.',
  'Los artefactos y los entregables dejan de admitir cambios.',
  'El proyecto queda de solo lectura.',
  'Se avisa por correo a los estudiantes y al asesor.',
];

interface Props {
  titulo: string;
  frase: string;
  onCambiarFrase: (frase: string) => void;
  fraseCoincide: boolean;
  cancelando: boolean;
  onConfirmar: () => void;
  onVolver: () => void;
}

export default function ConfirmarCancelacionDialog({
  titulo,
  frase,
  onCambiarFrase,
  fraseCoincide,
  cancelando,
  onConfirmar,
  onVolver,
}: Props) {
  return (
    <ConfirmDialog
      titulo="Confirma la cancelación"
      descripcion={`Estás por cancelar el proyecto «${titulo}».`}
      aviso="Esta acción no se puede revertir."
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Cancelar proyecto de grado"
      labelCancelar="Volver"
      cargando={cancelando}
      confirmarDeshabilitado={!fraseCoincide}
      onConfirmar={onConfirmar}
      onCancelar={onVolver}
    >
      <CampoFraseConfirmacion
        frase={FRASE_CONFIRMACION_CANCELACION}
        valor={frase}
        onCambiar={onCambiarFrase}
      />
    </ConfirmDialog>
  );
}

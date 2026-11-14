import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { FRASE_CONFIRMACION_FINALIZACION } from '../../utils/frase-confirmacion';
import CampoFraseConfirmacion from '../CampoFraseConfirmacion';

const CONSECUENCIAS = [
  'Se borran los archivos de las versiones de los artefactos; se conservan los registros y el historial.',
  'Los artefactos y los entregables dejan de admitir cambios.',
  'El proyecto queda de solo lectura.',
  'Se avisa por correo a los estudiantes.',
];

interface Props {
  titulo: string;
  frase: string;
  onCambiarFrase: (frase: string) => void;
  fraseCoincide: boolean;
  finalizando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarFinalizacionDialog({
  titulo,
  frase,
  onCambiarFrase,
  fraseCoincide,
  finalizando,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <ConfirmDialog
      titulo="Finalizar el proyecto de grado"
      descripcion={`Estás por finalizar el proyecto «${titulo}».`}
      aviso="Esta acción no se puede revertir."
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Finalizar proyecto"
      labelCancelar="Cancelar"
      cargando={finalizando}
      confirmarDeshabilitado={!fraseCoincide}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      <CampoFraseConfirmacion
        frase={FRASE_CONFIRMACION_FINALIZACION}
        valor={frase}
        onCambiar={onCambiarFrase}
      />
    </ConfirmDialog>
  );
}

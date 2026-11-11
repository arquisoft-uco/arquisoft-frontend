import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Field from '../../../../shared/components/ui/Field';
import { FRASE_CONFIRMACION_CANCELACION } from '../../utils/frase-cancelacion';

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
      <Field etiqueta={`Escribe «${FRASE_CONFIRMACION_CANCELACION}» para continuar`}>
        {(control) => (
          <input
            {...control}
            type="text"
            value={frase}
            onChange={(e) => onCambiarFrase(e.target.value)}
            autoComplete="off"
            className="field-input"
          />
        )}
      </Field>
    </ConfirmDialog>
  );
}

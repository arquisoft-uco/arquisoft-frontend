import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { ETIQUETAS_ROL, type Rol } from '../../../../shared/models/rol';

interface Props {
  rol: Rol;
  nombreUsuario: string;
  cargando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarRemoverRolDialog({
  rol,
  nombreUsuario,
  cargando,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <ConfirmDialog
      variante="peligro"
      titulo="Eliminar rol"
      descripcion={`¿Está seguro de eliminar el rol ${ETIQUETAS_ROL[rol]} para el usuario ${nombreUsuario}?`}
      labelConfirmar="Eliminar"
      cargando={cargando}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />
  );
}

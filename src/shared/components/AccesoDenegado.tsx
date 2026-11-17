import { useRolesDisponibles } from '../../hooks/useAuth';
import ErrorState from './ui/ErrorState';

interface Props {
  onReintentar?: () => void;
}

export default function AccesoDenegado({ onReintentar }: Props) {
  const variosRoles = useRolesDisponibles().length > 1;
  const descripcion = variosRoles
    ? 'Tu rol actual no tiene permiso para ver esta sección. Elige otra opción del menú o cambia de rol desde el encabezado.'
    : 'Tu rol actual no tiene permiso para ver esta sección. Elige otra opción del menú para seguir navegando.';

  return (
    <ErrorState titulo="Acceso denegado" descripcion={descripcion} onReintentar={onReintentar} />
  );
}

import { Navigate } from 'react-router';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import NuevaFichaContenido from './components/coordinador/NuevaFichaContenido';

const ROLES = [Rol.Coordinador];

export default function NuevaFichaPerfil() {
  const puedeRegistrar = useHasRole(ROLES);

  if (!puedeRegistrar) return <Navigate to="/forbidden" replace />;

  return <NuevaFichaContenido />;
}

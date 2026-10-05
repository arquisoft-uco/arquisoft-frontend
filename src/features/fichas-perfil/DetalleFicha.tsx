import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import { Rol } from '../../shared/models/rol';
import { useRolActivo } from '../../hooks/useAuth';
import AsesorFichaDetalleView from './components/AsesorFichaDetalleView';
import RepresentanteDetalleView from './components/RepresentanteDetalleView';

const VIEW_POR_ROL: Record<string, ComponentType> = {
  [Rol.AsesorFicha]: AsesorFichaDetalleView,
  [Rol.RepresentanteComiteCurriculum]: RepresentanteDetalleView,
};

export default function DetalleFicha() {
  const rol = useRolActivo();

  if (!rol) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rol];
  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}

import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import CoordinadorDetalleView from './components/CoordinadorDetalleView';

const VIEW_POR_ROL: Record<string, ComponentType> = {
  [Rol.Coordinador]: CoordinadorDetalleView,
};

export default function DetalleProyectoGrado() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}

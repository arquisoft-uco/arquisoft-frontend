import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import AdministradorView from './components/AdministradorView';
import BasicaView from './components/BasicaView';
import EstudianteView from './components/EstudianteView';
import RepresentanteView from './components/RepresentanteView';

const VIEW_POR_ROL: Record<string, ComponentType> = {
  [Rol.Estudiante]: EstudianteView,
  [Rol.RepresentanteComiteCurriculum]: RepresentanteView,
  [Rol.Administrador]: AdministradorView,
};

export default function Dashboard() {
  const rolActivo = useRolActivo();

  if (rolActivo === null) return <Navigate to="/seleccionar-rol" replace />;

  const Vista = VIEW_POR_ROL[rolActivo] ?? BasicaView;
  return <Vista />;
}

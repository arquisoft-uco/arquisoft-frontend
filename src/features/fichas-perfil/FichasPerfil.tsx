import React from 'react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import CoordinadorView from './components/CoordinadorView';
import EstudianteView from './components/EstudianteView';
import AsesorFichaView from './components/AsesorFichaView';
import RepresentanteView from './components/RepresentanteView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Coordinador]: CoordinadorView,
  [Rol.Estudiante]: EstudianteView,
  [Rol.AsesorFicha]: AsesorFichaView,
  [Rol.RepresentanteComiteCurriculum]: RepresentanteView,
};

export default function FichasPerfil() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}

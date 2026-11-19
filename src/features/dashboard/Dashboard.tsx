import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import AdministradorView from './components/AdministradorView';
import AsesorFichaView from './components/AsesorFichaView';
import AsesorView from './components/AsesorView';
import BibliotecarioView from './components/BibliotecarioView';
import CoordinadorView from './components/CoordinadorView';
import EstudianteView from './components/EstudianteView';
import JuradoView from './components/JuradoView';
import RepresentanteView from './components/RepresentanteView';

const VIEW_POR_ROL: Record<Rol, ComponentType> = {
  [Rol.Estudiante]: EstudianteView,
  [Rol.Coordinador]: CoordinadorView,
  [Rol.Asesor]: AsesorView,
  [Rol.AsesorFicha]: AsesorFichaView,
  [Rol.Jurado]: JuradoView,
  [Rol.Bibliotecario]: BibliotecarioView,
  [Rol.RepresentanteComiteCurriculum]: RepresentanteView,
  [Rol.Administrador]: AdministradorView,
};

export default function Dashboard() {
  const rolActivo = useRolActivo();

  if (rolActivo === null) return <Navigate to="/seleccionar-rol" replace />;

  const Vista = VIEW_POR_ROL[rolActivo];
  return <Vista />;
}

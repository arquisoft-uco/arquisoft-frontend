import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import PestanaProyecto from './PestanaProyecto';

vi.mock('./estudiante/HistorialEstadosProyectoPanel', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Panel de estados {proyectoGradoId}</p>
  ),
}));
vi.mock('./PestanaAsesores', () => ({
  default: ({ proyectoGradoId }: { proyectoGradoId: string }) => (
    <p>Panel de asesores {proyectoGradoId}</p>
  ),
}));

function renderizar(ruta: string, rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
  return render(
    <Routes>
      <Route path="/proyectos-grado/:id">
        <Route path="asesores" element={<PestanaProyecto pestana="asesores" />} />
        <Route path="estados" element={<PestanaProyecto pestana="estados" />} />
      </Route>
    </Routes>,
    { initialPath: ruta },
  );
}

describe('PestanaProyecto', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el estudiante ve el historial en estados', () => {
    // Arrange / Act
    renderizar('/proyectos-grado/p-1/estados', Rol.Estudiante);

    // Assert
    expect(screen.getByText('Panel de estados p-1')).toBeInTheDocument();
  });

  it('el estudiante en asesores se redirige a estados', () => {
    // Arrange / Act
    renderizar('/proyectos-grado/p-1/asesores', Rol.Estudiante);

    // Assert
    expect(screen.getByText('Panel de estados p-1')).toBeInTheDocument();
  });

  it('el coordinador en estados se redirige a asesores', () => {
    // Arrange / Act
    renderizar('/proyectos-grado/p-1/estados', Rol.Coordinador);

    // Assert
    expect(screen.getByText('Panel de asesores p-1')).toBeInTheDocument();
  });
});

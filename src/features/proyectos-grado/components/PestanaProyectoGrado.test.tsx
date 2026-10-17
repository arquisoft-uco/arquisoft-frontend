import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import PestanaProyectoGrado from './PestanaProyectoGrado';

vi.mock('./PestanaAsesores', () => ({ default: () => <p>Panel de asesores</p> }));
vi.mock('./asesor/PestanaResumenAsesor', () => ({ default: () => <p>Panel de resumen</p> }));

function renderizar(ruta: string) {
  return render(
    <Routes>
      <Route path="/proyectos-grado/:id">
        <Route index element={<PestanaProyectoGrado />} />
        <Route path="asesores" element={<PestanaProyectoGrado pestana="asesores" />} />
        <Route path="resumen" element={<PestanaProyectoGrado pestana="resumen" />} />
      </Route>
      <Route path="/forbidden" element={<p>Sin acceso</p>} />
    </Routes>,
    { initialPath: ruta },
  );
}

function comoRol(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u-1', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('PestanaProyectoGrado', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el índice lleva a cada rol a su pestaña inicial', () => {
    // Arrange
    comoRol(Rol.Asesor);

    // Act
    const asesor = renderizar('/proyectos-grado/p-1');

    // Assert
    expect(screen.getByText('Panel de resumen')).toBeInTheDocument();
    asesor.unmount();

    // Arrange
    resetAllStores();
    comoRol(Rol.Coordinador);

    // Act
    renderizar('/proyectos-grado/p-1');

    // Assert
    expect(screen.getByText('Panel de asesores')).toBeInTheDocument();
  });

  it('redirige a la pestaña propia del rol sin renderizar la ajena', () => {
    // Arrange
    comoRol(Rol.Asesor);

    // Act
    const asesor = renderizar('/proyectos-grado/p-1/asesores');

    // Assert
    expect(screen.getByText('Panel de resumen')).toBeInTheDocument();
    expect(screen.queryByText('Panel de asesores')).not.toBeInTheDocument();
    asesor.unmount();

    // Arrange
    resetAllStores();
    comoRol(Rol.Coordinador);

    // Act
    renderizar('/proyectos-grado/p-1/resumen');

    // Assert
    expect(screen.getByText('Panel de asesores')).toBeInTheDocument();
    expect(screen.queryByText('Panel de resumen')).not.toBeInTheDocument();
  });

  it('un rol sin pestañas va a /forbidden', () => {
    // Arrange
    comoRol(Rol.Estudiante);

    // Act
    renderizar('/proyectos-grado/p-1/resumen');

    // Assert
    expect(screen.getByText('Sin acceso')).toBeInTheDocument();
  });
});

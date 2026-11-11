import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Outlet, Route, Routes } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import PestanaProyectoGrado from './PestanaProyectoGrado';

vi.mock('./PestanaAsesores', () => ({ default: () => <p>Panel de asesores</p> }));
vi.mock('./PestanaEstados', () => ({ default: () => <p>Panel de estados</p> }));

function renderizar(ruta: string) {
  return render(
    <Routes>
      <Route
        path="/proyectos-grado/:id"
        element={
          <>
            <p>Detalle del proyecto</p>
            <Outlet />
          </>
        }
      >
        <Route index element={<PestanaProyectoGrado />} />
        <Route path="asesores" element={<PestanaProyectoGrado pestana="asesores" />} />
        <Route path="estados" element={<PestanaProyectoGrado pestana="estados" />} />
      </Route>
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

  it('el índice del coordinador termina en su pestaña de asesores', () => {
    // Arrange
    comoRol(Rol.Coordinador);

    // Act
    renderizar('/proyectos-grado/p-1');

    // Assert
    expect(screen.getByText('Panel de asesores')).toBeInTheDocument();
  });

  it('el coordinador ve el panel de estados en su pestaña', () => {
    // Arrange
    comoRol(Rol.Coordinador);

    // Act
    renderizar('/proyectos-grado/p-1/estados');

    // Assert
    expect(screen.getByText('Panel de estados')).toBeInTheDocument();
  });

  it('el asesor llega a estados desde el índice y desde la pestaña de asesores, que no le corresponde', () => {
    // Arrange
    comoRol(Rol.Asesor);

    // Act
    const indice = renderizar('/proyectos-grado/p-1');

    // Assert
    expect(screen.getByText('Panel de estados')).toBeInTheDocument();
    indice.unmount();

    // Act
    renderizar('/proyectos-grado/p-1/asesores');

    // Assert
    expect(screen.getByText('Panel de estados')).toBeInTheDocument();
    expect(screen.queryByText('Panel de asesores')).not.toBeInTheDocument();
  });
});

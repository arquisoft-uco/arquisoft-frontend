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

  it('el asesor no tiene pestañas: el índice no renderiza panel y la subruta ajena vuelve al detalle', () => {
    // Arrange
    comoRol(Rol.Asesor);

    // Act
    const indice = renderizar('/proyectos-grado/p-1');

    // Assert
    expect(screen.getByText('Detalle del proyecto')).toBeInTheDocument();
    expect(screen.queryByText('Panel de asesores')).not.toBeInTheDocument();
    indice.unmount();

    // Act
    renderizar('/proyectos-grado/p-1/asesores');

    // Assert
    expect(screen.getByText('Detalle del proyecto')).toBeInTheDocument();
    expect(screen.queryByText('Panel de asesores')).not.toBeInTheDocument();
  });
});

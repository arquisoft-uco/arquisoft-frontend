import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import Evaluaciones from './Evaluaciones';
import { Rol } from '../../shared/models/rol';

vi.mock('./components/ItemsCualitativosJuradoView', () => ({
  default: () => <p>Vista de ítems cualitativos</p>,
}));

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('Evaluaciones', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it.each([Rol.Administrador, Rol.Jurado])(
    'con el rol %s, renderiza la vista de ítems cualitativos',
    (rol) => {
      // Arrange
      autenticarCon(rol);

      // Act
      render(<Evaluaciones />, { initialPath: '/evaluaciones' });

      // Assert
      expect(screen.getByText('Vista de ítems cualitativos')).toBeInTheDocument();
    },
  );

  it.each([Rol.Asesor, Rol.Estudiante, Rol.Coordinador])(
    'con el rol %s, redirige a /forbidden',
    (rol) => {
      // Arrange
      autenticarCon(rol);

      // Act
      render(
        <Routes>
          <Route path="/evaluaciones" element={<Evaluaciones />} />
          <Route path="/forbidden" element={<p>Pantalla de acceso denegado</p>} />
        </Routes>,
        { initialPath: '/evaluaciones' },
      );

      // Assert
      expect(screen.getByText('Pantalla de acceso denegado')).toBeInTheDocument();
      expect(screen.queryByText('Vista de ítems cualitativos')).not.toBeInTheDocument();
    },
  );

  it('sin rol activo, redirige a seleccionar-rol', () => {
    // Act
    render(
      <Routes>
        <Route path="/evaluaciones" element={<Evaluaciones />} />
        <Route path="/seleccionar-rol" element={<p>Pantalla de selección de rol</p>} />
      </Routes>,
      { initialPath: '/evaluaciones' },
    );

    // Assert
    expect(screen.getByText('Pantalla de selección de rol')).toBeInTheDocument();
    expect(screen.queryByText('Vista de ítems cualitativos')).not.toBeInTheDocument();
  });
});

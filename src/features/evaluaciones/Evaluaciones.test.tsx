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

  it('con rol administrador o jurado, renderiza la vista de ítems cualitativos', () => {
    for (const rol of [Rol.Administrador, Rol.Jurado]) {
      // Arrange
      autenticarCon(rol);

      // Act
      const { unmount } = render(<Evaluaciones />, { initialPath: '/evaluaciones' });

      // Assert
      expect(screen.getByText('Vista de ítems cualitativos')).toBeInTheDocument();
      expect(screen.queryByText('Esta opción aún no está disponible.')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('con rol asesor, estudiante o coordinador, muestra ComingSoon y no la vista', () => {
    for (const rol of [Rol.Asesor, Rol.Estudiante, Rol.Coordinador]) {
      // Arrange
      autenticarCon(rol);

      // Act
      const { unmount } = render(<Evaluaciones />, { initialPath: '/evaluaciones' });

      // Assert
      expect(screen.getByRole('heading', { name: 'Evaluaciones' })).toBeInTheDocument();
      expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
      expect(screen.queryByText('Vista de ítems cualitativos')).not.toBeInTheDocument();
      unmount();
    }
  });

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

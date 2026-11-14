import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import PlanesEstimadosProyecto from './PlanesEstimadosProyecto';

vi.mock('./components/PlanesEstimadosProyectoAsesorView', () => ({
  default: () => <p>Vista asesor</p>,
}));

function renderizar() {
  return render(
    <Routes>
      <Route
        path="/mapas-ruta/proyectos/:proyectoGradoId/planes-estimados"
        element={<PlanesEstimadosProyecto />}
      />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
      <Route path="/seleccionar-rol" element={<p>Selecciona un rol</p>} />
    </Routes>,
    { initialPath: '/mapas-ruta/proyectos/p-1/planes-estimados' },
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('PlanesEstimadosProyecto', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('con rol asesor renderiza su vista', () => {
    // Arrange
    entrarComo(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Vista asesor')).toBeInTheDocument();
    expect(screen.queryByText('Acceso denegado')).not.toBeInTheDocument();
  });

  it('con un rol sin vista redirige a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Vista asesor')).not.toBeInTheDocument();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    setAuthenticatedUser({
      tokenParsed: { sub: 'u', realm_access: { roles: [Rol.Asesor, Rol.Estudiante] } },
    });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selecciona un rol')).toBeInTheDocument();
    expect(screen.queryByText('Vista asesor')).not.toBeInTheDocument();
  });
});

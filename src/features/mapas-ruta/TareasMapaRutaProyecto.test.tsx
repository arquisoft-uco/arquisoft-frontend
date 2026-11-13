import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import TareasMapaRutaProyecto from './TareasMapaRutaProyecto';

vi.mock('./components/TareasMapaRutaAsesorView', () => ({
  default: () => <p>Vista asesor</p>,
}));

function renderizar() {
  return render(
    <Routes>
      <Route
        path="/mapas-ruta/proyectos/:proyectoGradoId/tareas"
        element={<TareasMapaRutaProyecto />}
      />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/mapas-ruta/proyectos/p-1/tareas' },
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('TareasMapaRutaProyecto', () => {
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
});

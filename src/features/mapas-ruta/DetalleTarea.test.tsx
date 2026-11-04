import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import DetalleTarea from './DetalleTarea';

vi.mock('./components/DetalleTareaEstudianteView', () => ({
  default: () => <p>Vista estudiante</p>,
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/mapas-ruta/tareas/:id" element={<DetalleTarea />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/mapas-ruta/tareas/t-1' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('DetalleTarea', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Coordinador, Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });

  it('el coordinador no tiene vista y termina en /forbidden', () => {
    // Arrange
    entrarComo(Rol.Coordinador);
    setActiveRole(Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Vista estudiante')).not.toBeInTheDocument();
  });

  it('el estudiante ve su vista', () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Vista estudiante')).toBeInTheDocument();
  });
});

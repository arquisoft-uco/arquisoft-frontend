import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import Artefactos from './Artefactos';

vi.mock('./services/artefactosService', () => ({
  artefactosService: {
    getEstadosRevisionAsesor: vi.fn().mockResolvedValue([]),
  },
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/artefactos" element={<Artefactos />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/artefactos' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('Artefactos', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el asesor ve el encabezado de estados de revisión', async () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Estados de revisión' }),
    ).toBeInTheDocument();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Asesor, Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });

  it('un rol sin vista redirige a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});

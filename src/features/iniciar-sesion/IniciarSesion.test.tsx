import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils/render';
import { resetAllStores } from '../../test-utils/store.utils';
import { useProveedorStore } from '../../auth/proveedorStore';
import { useProveedoresDisponibles } from '../../hooks/useAuth';
import IniciarSesion from './IniciarSesion';

vi.mock('../../hooks/useAuth', () => ({ useProveedoresDisponibles: vi.fn() }));

function Origen() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/iniciar-sesion', { state: { desde: '/fichas-perfil?pagina=2' } })}
    >
      Ir al selector
    </button>
  );
}

function Destino() {
  const { pathname, search } = useLocation();
  return <p>{`Destino ${pathname}${search}`}</p>;
}

function renderizar() {
  render(
    <Routes>
      <Route path="/privada" element={<Origen />} />
      <Route path="/iniciar-sesion" element={<IniciarSesion />} />
      <Route path="*" element={<Destino />} />
    </Routes>,
    { initialPath: '/privada' },
  );
}

describe('IniciarSesion', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetAllStores();
    vi.mocked(useProveedoresDisponibles).mockReturnValue([
      { id: 'keycloak', titulo: 'Keycloak', descripcion: 'Cuenta institucional' },
      { id: 'pdp', titulo: 'Security Baseline', descripcion: 'Plataforma de seguridad' },
    ]);
  });

  it('ofrece una opción por proveedor disponible con su descripción', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(screen.getByRole('button', { name: 'Ir al selector' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Inicia sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con Keycloak' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continuar con Security Baseline' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Plataforma de seguridad')).toBeInTheDocument();
  });

  it('al elegir guarda el proveedor y vuelve a la ruta de origen', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    await user.click(screen.getByRole('button', { name: 'Ir al selector' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Continuar con Security Baseline' }));

    // Assert
    expect(useProveedorStore.getState().proveedor).toBe('pdp');
    expect(await screen.findByText('Destino /fichas-perfil?pagina=2')).toBeInTheDocument();
  });
});

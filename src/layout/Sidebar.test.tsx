import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Route, Routes, useNavigate } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';
import { Rol } from '../shared/models/rol';
import { NAV_ITEMS, estaDisponible, navItemsDelRol } from './nav-items';
import Sidebar from './Sidebar';

vi.mock('./nav-items', async (importOriginal) => {
  const real = await importOriginal<typeof import('./nav-items')>();
  return { ...real, navItemsDelRol: vi.fn(real.navItemsDelRol) };
});

function Navegador() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/usuarios')}>
      Ir a usuarios
    </button>
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function renderizar(onClose = vi.fn()) {
  render(
    <>
      <Sidebar onClose={onClose} />
      <Routes>
        <Route path="*" element={<Navegador />} />
      </Routes>
    </>,
    { initialPath: '/dashboard' },
  );
  return onClose;
}

function fijarAncho(ancho: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: ancho });
}

describe('Sidebar', () => {
  beforeEach(() => {
    resetAllStores();
    fijarAncho(1280);
  });

  afterEach(() => {
    fijarAncho(1024);
  });

  it('separa «Trabajo» (enlaces) de «Próximamente» (sin enlace, con aria-disabled y texto accesible)', () => {
    entrarComo(Rol.Estudiante);

    renderizar();

    const trabajo = screen.getByRole('list', { name: 'Trabajo' });
    expect(
      within(trabajo)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href')),
    ).toEqual(['/dashboard', '/fichas-perfil', '/solicitudes']);
    const proximamente = screen.getByRole('list', { name: 'Próximamente' });
    const pendientes = within(proximamente).getAllByRole('link');
    expect(pendientes.length).toBeGreaterThan(0);
    pendientes.forEach((p) => {
      expect(p).toHaveAttribute('aria-disabled', 'true');
      expect(p).not.toHaveAttribute('href');
      expect(p).toHaveTextContent('Próximamente');
    });
  });

  it('no pinta «Próximamente» si el rol no tiene ítems pendientes', () => {
    entrarComo(Rol.Estudiante);
    vi.mocked(navItemsDelRol).mockReturnValueOnce(NAV_ITEMS.filter((item) => estaDisponible(item)));

    renderizar();

    expect(screen.getByRole('list', { name: 'Trabajo' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Próximamente' })).not.toBeInTheDocument();
  });

  it('el botón de ocultar llama onClose', async () => {
    const user = userEvent.setup();
    entrarComo(Rol.Estudiante);
    const onClose = renderizar();

    await user.click(screen.getByRole('button', { name: 'Ocultar menú de navegación' }));

    expect(onClose).toHaveBeenCalled();
  });

  it.each([
    [500, true],
    [1280, false],
  ])('con ancho %i al navegar, cerrar el cajón es %s', async (ancho, seCierra) => {
    const user = userEvent.setup();
    entrarComo(Rol.Administrador);
    fijarAncho(ancho);
    const onClose = renderizar();
    onClose.mockClear();

    await user.click(screen.getByRole('button', { name: 'Ir a usuarios' }));

    expect(onClose.mock.calls.length > 0).toBe(seCierra);
  });
});

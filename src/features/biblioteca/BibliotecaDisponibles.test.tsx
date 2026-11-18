import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import BibliotecaDisponibles from './BibliotecaDisponibles';

vi.mock('./services/bibliotecaService', () => ({
  bibliotecaService: {
    consultarEntregablesDisponibles: vi.fn().mockResolvedValue({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    }),
  },
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/biblioteca/disponibles" element={<BibliotecaDisponibles />} />
    </Routes>,
    { initialPath: '/biblioteca/disponibles' },
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('BibliotecaDisponibles', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el bibliotecario ve la pestaña «Por registrar» con su lista', async () => {
    // Arrange
    entrarComo(Rol.Bibliotecario);

    // Act
    renderizar();

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Biblioteca' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Por registrar' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(await screen.findByText('No hay entregables por registrar')).toBeInTheDocument();
  });

  it('un rol sin vista muestra Acceso denegado', async () => {
    // Arrange
    entrarComo(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
  });
});

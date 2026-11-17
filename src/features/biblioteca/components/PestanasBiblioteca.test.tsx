import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import PestanasBiblioteca from './PestanasBiblioteca';

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('PestanasBiblioteca', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el bibliotecario ve las dos pestañas con sus enlaces y la activa marcada', () => {
    // Arrange
    entrarComo(Rol.Bibliotecario);

    // Act
    render(<PestanasBiblioteca activa="por-registrar" />);

    // Assert
    expect(screen.getByRole('navigation', { name: 'Secciones de Biblioteca' })).toBeInTheDocument();
    const documentaciones = screen.getByRole('link', { name: 'Documentaciones' });
    const porRegistrar = screen.getByRole('link', { name: 'Por registrar' });
    expect(documentaciones).toHaveAttribute('href', '/biblioteca');
    expect(porRegistrar).toHaveAttribute('href', '/biblioteca/disponibles');
    expect(porRegistrar).toHaveAttribute('aria-current', 'page');
    expect(documentaciones).not.toHaveAttribute('aria-current');
  });

  it('un rol distinto del bibliotecario no ve las pestañas', () => {
    // Arrange
    entrarComo(Rol.Asesor);

    // Act
    render(<PestanasBiblioteca activa="documentaciones" />);

    // Assert
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import CoordinadorView from './CoordinadorView';

vi.mock('./coordinador/ConsultarFichasPerfilCoordinador', () => ({
  default: () => <p>Listado de fichas</p>,
}));
function Ubicacion() {
  const { pathname, search } = useLocation();
  return <p>{`${pathname}${search}`}</p>;
}

describe('CoordinadorView', () => {
  it('muestra el título de la página y el listado', () => {
    // Act
    render(<CoordinadorView />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Fichas de perfil' })).toBeInTheDocument();
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
  });

  it('Nueva ficha de perfil navega a la página de registro conservando la búsqueda del listado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <>
        <CoordinadorView />
        <Ubicacion />
      </>,
      { initialPath: '/fichas-perfil?q=sistema&pagina=2' },
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Nueva ficha de perfil' }));

    // Assert
    expect(screen.getByText('/fichas-perfil/nueva?q=sistema&pagina=2')).toBeInTheDocument();
  });
});

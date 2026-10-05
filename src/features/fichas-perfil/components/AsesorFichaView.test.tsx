import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import AsesorFichaView from './AsesorFichaView';

vi.mock('./asesor-ficha/ConsultarFichasAsesor', () => ({
  default: () => <p>Listado de fichas</p>,
}));

vi.mock('./asesor-ficha/EstadosFichasAsesorPanel', () => ({
  default: () => <p>Panel de estados de fichas</p>,
}));

function Busqueda() {
  return <p>{`busqueda:${useLocation().search}`}</p>;
}

describe('AsesorFichaView', () => {
  it('muestra un solo título de página y las dos pestañas, con el listado por defecto', () => {
    // Act
    render(<AsesorFichaView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mis fichas de perfil' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
  });

  it('la pestaña "Estados de mis fichas" muestra el panel de estados y "Mis fichas" vuelve al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsesorFichaView />);
    expect(screen.getByRole('tab', { name: 'Mis fichas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Act
    await user.click(screen.getByRole('tab', { name: 'Estados de mis fichas' }));

    // Assert
    expect(screen.getByText('Panel de estados de fichas')).toBeInTheDocument();
    expect(screen.queryByText('Listado de fichas')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Estados de mis fichas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Act
    await user.click(screen.getByRole('tab', { name: 'Mis fichas' }));

    // Assert
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
    expect(screen.queryByText('Panel de estados de fichas')).not.toBeInTheDocument();
  });

  it('lee la pestaña de la URL: con ?vista=estados abre "Estados de mis fichas"', () => {
    // Act
    render(<AsesorFichaView />, { initialPath: '/fichas-perfil?vista=estados&q=sis' });

    // Assert
    expect(screen.getByText('Panel de estados de fichas')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Estados de mis fichas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('al cambiar de pestaña escribe vista en la URL y limpia el resto de la búsqueda', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <>
        <AsesorFichaView />
        <Busqueda />
      </>,
      { initialPath: '/fichas-perfil?pagina=3&q=monitoreo' },
    );
    expect(screen.getByText('busqueda:?pagina=3&q=monitoreo')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Estados de mis fichas' }));

    // Assert
    expect(screen.getByText('busqueda:?vista=estados')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Mis fichas' }));

    // Assert
    expect(screen.getByText('busqueda:')).toBeInTheDocument();
  });
});

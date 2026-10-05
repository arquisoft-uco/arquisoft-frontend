import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AsesorFichaView from './AsesorFichaView';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';

const FICHA: FichaPerfilAsesor = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  estadoActual: 'En Construcción',
};

vi.mock('./asesor-ficha/ConsultarFichasAsesor', () => ({
  default: ({ onSeleccionar }: { onSeleccionar: (ficha: FichaPerfilAsesor) => void }) => (
    <div>
      <p>Listado de fichas</p>
      <button type="button" onClick={() => onSeleccionar(FICHA)}>
        Seleccionar ficha
      </button>
    </div>
  ),
}));

vi.mock('./asesor-ficha/EstadosFichasAsesorPanel', () => ({
  default: () => <p>Panel de estados de fichas</p>,
}));

vi.mock('./asesor-ficha/DetalleFichaAsesor', () => ({
  default: ({
    ficha,
    onVolver,
    onEstadoCambiado,
  }: {
    ficha: FichaPerfilAsesor;
    onVolver: () => void;
    onEstadoCambiado?: (nuevoEstado: string) => void;
  }) => (
    <div>
      <p>Detalle de {ficha.titulo}</p>
      <p>Estado: {ficha.estadoActual}</p>
      <button type="button" onClick={onVolver}>
        Volver
      </button>
      <button type="button" onClick={() => onEstadoCambiado?.('Aprobada')}>
        Cambiar estado
      </button>
    </div>
  ),
}));

describe('AsesorFichaView', () => {
  it('muestra un solo título de página y las dos pestañas en la vista de lista', () => {
    // Act
    render(<AsesorFichaView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mis fichas de perfil' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('sin ficha seleccionada, renderiza el listado', () => {
    // Act
    render(<AsesorFichaView />);

    // Assert
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
    expect(screen.queryByText(/Detalle de/)).not.toBeInTheDocument();
  });

  it('al seleccionar una ficha desde el listado, se desmonta el listado y se renderiza el detalle con esa ficha', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsesorFichaView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Seleccionar ficha' }));

    // Assert
    expect(screen.queryByText('Listado de fichas')).not.toBeInTheDocument();
    expect(screen.getByText('Detalle de Sistema de monitoreo')).toBeInTheDocument();
  });

  it('al volver desde el detalle, vuelve a renderizar el listado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsesorFichaView />);
    await user.click(screen.getByRole('button', { name: 'Seleccionar ficha' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver' }));

    // Assert
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
    expect(screen.queryByText(/Detalle de/)).not.toBeInTheDocument();
  });

  it('al cambiar el estado desde el detalle, el detalle recibe la ficha con el estadoActual actualizado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsesorFichaView />);
    await user.click(screen.getByRole('button', { name: 'Seleccionar ficha' }));
    expect(screen.getByText('Estado: En Construcción')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(screen.getByText('Estado: Aprobada')).toBeInTheDocument();
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

  it('con una ficha seleccionada se ocultan las pestañas y al volver regresa a la pestaña desde la que se abrió', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsesorFichaView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Seleccionar ficha' }));

    // Assert
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver' }));

    // Assert
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Mis fichas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

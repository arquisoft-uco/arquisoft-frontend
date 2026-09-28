import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AsesorFichaView from './AsesorFichaView';
import type { FichaPerfilAsesor } from '../models/FichaPerfilAsesor';

const FICHA: FichaPerfilAsesor = { id: 'f-1', titulo: 'Sistema de monitoreo', estadoActual: 'En Construcción' };

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
});

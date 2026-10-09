import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useRevisionesFichaAsesor } from '../../hooks/useRevisionesFichaAsesor';
import RevisionesFichaAsesorPanel from './RevisionesFichaAsesorPanel';

vi.mock('../../hooks/useRevisionesFichaAsesor', () => ({ useRevisionesFichaAsesor: vi.fn() }));

function conRevisiones(parcial: Partial<ReturnType<typeof useRevisionesFichaAsesor>>) {
  vi.mocked(useRevisionesFichaAsesor).mockReturnValue({
    filas: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    direccion: undefined,
    ordenar: vi.fn(),
    sinItems: false,
    isLoading: false,
    isError: false,
    error: null,
    reintentar: vi.fn(),
    ...parcial,
  });
}

const FILA = {
  revision: {
    id: 'r-1',
    itemId: 'i-1',
    estadoId: 'CERRADA',
    estadoNombre: 'Cerrada',
    fechaCreacion: '2026-09-01T10:00:00Z',
  },
  item: {
    id: 'i-1',
    fichaPerfilId: 'f-1',
    tipoItem: { id: 't-1', nombre: 'Objetivo general' },
    contenido: 'Medir el impacto',
  },
};

describe('RevisionesFichaAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con la ficha sin revisiones muestra el vacío del asesor', () => {
    // Arrange
    conRevisiones({ sinItems: true });

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene revisiones')).toBeInTheDocument();
    expect(useRevisionesFichaAsesor).toHaveBeenCalledWith('f-1');
  });

  it('lista la revisión con el tipo de ítem, el estado y la fecha', () => {
    // Arrange
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getAllByText('Objetivo general').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cerrada').length).toBeGreaterThan(0);
    expect(screen.queryByText('Esta ficha aún no tiene revisiones')).not.toBeInTheDocument();
  });

  it('ante un error ofrece reintentar', async () => {
    // Arrange
    const reintentar = vi.fn();
    conRevisiones({ isError: true, reintentar });
    const user = userEvent.setup();

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByText('No pudimos cargar las revisiones')).toBeInTheDocument();
    expect(reintentar).toHaveBeenCalledTimes(1);
  });
});

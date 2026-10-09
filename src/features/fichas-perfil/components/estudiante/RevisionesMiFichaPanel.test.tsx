import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useRevisionesMiFicha } from '../../hooks/useRevisionesMiFicha';
import RevisionesMiFichaPanel from './RevisionesMiFichaPanel';

vi.mock('../../hooks/useRevisionesMiFicha', () => ({ useRevisionesMiFicha: vi.fn() }));

function conRevisiones(parcial: Partial<ReturnType<typeof useRevisionesMiFicha>>) {
  vi.mocked(useRevisionesMiFicha).mockReturnValue({
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

describe('RevisionesMiFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga y no pinta el vacío', () => {
    // Arrange
    conRevisiones({ isLoading: true });

    // Act
    render(<RevisionesMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando revisiones…');
    expect(screen.queryByText('Tu ficha aún no tiene revisiones')).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const reintentar = vi.fn();
    conRevisiones({ isError: true, error: new Error('fallo'), reintentar });
    render(<RevisionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las revisiones');
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('sin ítems muestra el texto de vacío y no una alerta', () => {
    // Arrange
    conRevisiones({ sinItems: true });

    // Act
    render(<RevisionesMiFichaPanel />);

    // Assert
    expect(screen.getByText('Tu ficha aún no tiene revisiones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista cada revisión con ítem, estado y fecha, y «Ítem no disponible» si no hay cruce', () => {
    // Arrange
    conRevisiones({
      filas: [FILA, { revision: { ...FILA.revision, id: 'r-2' }, item: undefined }],
      totalElements: 2,
      totalPages: 1,
    });

    // Act
    render(<RevisionesMiFichaPanel />);

    // Assert
    expect(screen.getAllByText('Objetivo general').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Medir el impacto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cerrada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ítem no disponible').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/2026/).length).toBeGreaterThan(0);
  });

  it('la cabecera «Estado» ordena ascendente y, si ya está ascendente, descendente', async () => {
    // Arrange
    const user = userEvent.setup();
    const ordenar = vi.fn();
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1, ordenar });
    const { rerender } = render(<RevisionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: /^Estado/ }));
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1, ordenar, direccion: 'ASC' });
    rerender(<RevisionesMiFichaPanel />);
    await user.click(screen.getByRole('button', { name: /^Estado/ }));

    // Assert
    expect(ordenar).toHaveBeenNthCalledWith(1, 'ASC');
    expect(ordenar).toHaveBeenNthCalledWith(2, 'DESC');
  });

  it('el paginador aparece solo con más de una página y navega con goToPage', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });
    const { rerender } = render(<RevisionesMiFichaPanel />);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
    conRevisiones({ filas: [FILA], totalElements: 25, totalPages: 3, goToPage });
    rerender(<RevisionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });
});

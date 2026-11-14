import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useHistorialEstadosEntregable } from '../../hooks/useHistorialEstadosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import HistorialEstadosEntregablePanel from './HistorialEstadosEntregablePanel';

vi.mock('../../hooks/useHistorialEstadosEntregable', () => ({
  useHistorialEstadosEntregable: vi.fn(),
}));

const hookMock = vi.mocked(useHistorialEstadosEntregable);
const refetch = vi.fn();

const ENTREGABLE: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 3,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

function consulta(parcial: Record<string, unknown>) {
  hookMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    ...parcial,
  } as never);
}

function renderizar(onCerrar = vi.fn()) {
  render(<HistorialEstadosEntregablePanel entregable={ENTREGABLE} onCerrar={onCerrar} />);
  return onCerrar;
}

describe('HistorialEstadosEntregablePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista los estados con "Actual" solo en la primera fila y el nombre tal como viene', () => {
    // Arrange
    consulta({
      data: [
        {
          id: 'h-2',
          estado: { id: 'APROBADO', nombre: 'Aprobado' },
          fechaActualizacion: '2026-09-02T10:00:00Z',
        },
        {
          id: 'h-1',
          estado: { id: 'DISPONIBLE_EVALUACION', nombre: 'Disponible para evaluación' },
          fechaActualizacion: '2026-09-01T10:00:00Z',
        },
      ],
    });

    // Act
    renderizar();

    // Assert
    expect(hookMock).toHaveBeenCalledWith('e-1');
    expect(screen.getByText('Sistema de riego · Versión 3')).toBeInTheDocument();
    const items = within(
      screen.getByRole('list', { name: 'Historial de estados del entregable' }),
    ).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Aprobado');
    expect(items[0]).toHaveTextContent('Actual');
    expect(items[1]).toHaveTextContent('Disponible para evaluación');
    expect(items[1]).not.toHaveTextContent('Actual');
    expect(screen.queryByText(/Motivo/)).not.toBeInTheDocument();
  });

  it('muestra un estado de carga accesible', () => {
    // Arrange
    consulta({ isLoading: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin estados muestra el vacío del entregable', () => {
    // Arrange
    consulta({ data: [] });

    // Act
    renderizar();

    // Assert
    expect(
      screen.getByText('Este entregable aún no tiene estados registrados'),
    ).toBeInTheDocument();
  });

  it('ante un error muestra el estado de error y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consulta({ isError: true, error: new Error('fallo') });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar el historial de estados',
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

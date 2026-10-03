import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarFichasRepresentante from './ConsultarFichasRepresentante';
import { useFichasRepresentante } from '../../hooks/useFichasRepresentante';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';

vi.mock('../../hooks/useFichasRepresentante', () => ({ useFichasRepresentante: vi.fn() }));
vi.mock('../../hooks/useEstadosFicha', () => ({ useEstadosFicha: vi.fn() }));

const goToPage = vi.fn();
const refetch = vi.fn();

function mockFichas(overrides: Record<string, unknown> = {}) {
  vi.mocked(useFichasRepresentante).mockReturnValue({
    data: {
      content: [
        {
          id: 'f1',
          titulo: 'Proyecto Uno',
          asesorNombre: 'Ana Ruiz',
          asesorEmail: 'ana@uco.edu.co',
          estadoActual: 'DISPONIBLE_PARA_EVALUACION',
          estadoFechaActualizacion: '2026-09-01T10:00:00',
        },
      ],
      totalElements: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    refetch,
    page: 0,
    pageSize: 10,
    goToPage,
    ...overrides,
  } as never);
}

describe('ConsultarFichasRepresentante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEstadosFicha).mockReturnValue({
      data: [
        { id: 'e1', nombre: 'APROBADA', descripcion: '' },
        { id: 'e2', nombre: 'NO_APROBADA', descripcion: '' },
      ],
      isLoading: false,
      isError: false,
    } as never);
    mockFichas();
  });

  it('muestra las fichas y abre el detalle con Ver detalle', async () => {
    // Arrange
    const onSeleccionar = vi.fn();
    const user = userEvent.setup();
    render(<ConsultarFichasRepresentante onSeleccionar={onSeleccionar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver detalle' }));

    // Assert
    expect(screen.getByText('Proyecto Uno')).toBeInTheDocument();
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('DISPONIBLE_PARA_EVALUACION')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Última actualización' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /2026/ })).toBeInTheDocument();
    expect(screen.getByText('1 ficha')).toBeInTheDocument();
    expect(onSeleccionar).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }));
  });

  it('Buscar aplica título y estados múltiples y vuelve a la página 1; Limpiar los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.type(screen.getByLabelText('Título'), 'robot');
    await user.click(screen.getByRole('button', { name: /todos los estados/i }));
    await user.click(screen.getByRole('checkbox', { name: 'APROBADA' }));
    await user.click(screen.getByRole('checkbox', { name: 'NO_APROBADA' }));
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    // Assert
    expect(useFichasRepresentante).toHaveBeenLastCalledWith({
      titulo: 'robot',
      asesorNombre: '',
      asesorEmail: '',
      estadoIds: ['e1', 'e2'],
    });
    expect(goToPage).toHaveBeenCalledWith(0);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    // Assert
    expect(useFichasRepresentante).toHaveBeenLastCalledWith({
      titulo: '',
      asesorNombre: '',
      asesorEmail: '',
      estadoIds: [],
    });
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });

  it('Buscar con los mismos filtros vuelve a consultar el endpoint', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío sin tratarlo como error', () => {
    // Arrange
    mockFichas({ data: { content: [], totalElements: 0, totalPages: 0 } });

    // Act
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Assert
    expect(
      screen.getByText('No hay fichas de perfil para evaluar con esos filtros.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error con reintento', async () => {
    // Arrange
    mockFichas({ data: undefined, isError: true });
    const user = userEvent.setup();
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Intenta nuevamente');
    expect(refetch).toHaveBeenCalled();
  });

  it('deshabilita el selector de estados si el catálogo falla y deja los demás filtros', () => {
    // Arrange
    vi.mocked(useEstadosFicha).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as never);

    // Act
    render(<ConsultarFichasRepresentante onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: /todos los estados/i })).toBeDisabled();
    expect(screen.getByLabelText('Título')).toBeEnabled();
  });
});

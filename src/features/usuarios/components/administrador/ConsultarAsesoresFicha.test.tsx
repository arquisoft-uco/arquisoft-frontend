import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import ConsultarAsesoresFicha from './ConsultarAsesoresFicha';
import { useAsesoresFicha } from '../../hooks/useAsesoresFicha';
import type { AsesorFicha } from '../../models/AsesorFicha';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useAsesoresFicha', () => ({
  useAsesoresFicha: vi.fn(),
}));

const VIGENTE: AsesorFicha = {
  id: 'af-1',
  identificador: '3001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  contacto: '3001112233',
  estado: 'ACTIVO',
  vigente: true,
};

const DE_BAJA: AsesorFicha = {
  id: 'af-2',
  identificador: '3002',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  contacto: '3004445566',
  estado: 'INACTIVO',
  vigente: false,
};

function crearPagina(content: AsesorFicha[]): Page<AsesorFicha> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function crearHookMock(
  parcial: Partial<ReturnType<typeof useAsesoresFicha>> = {},
): ReturnType<typeof useAsesoresFicha> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useAsesoresFicha>;
}

describe('ConsultarAsesoresFicha', () => {
  beforeEach(() => {
    vi.mocked(useAsesoresFicha).mockReset();
  });

  it('muestra el estado de carga con el título visible', () => {
    vi.mocked(useAsesoresFicha).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarAsesoresFicha />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando asesores de ficha...');
    expect(screen.getByRole('heading', { name: 'Asesores de ficha' })).toBeInTheDocument();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useAsesoresFicha).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarAsesoresFicha />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los asesores de ficha. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando no hay asesores de ficha', () => {
    vi.mocked(useAsesoresFicha).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    render(<ConsultarAsesoresFicha />);

    expect(screen.getByText('No hay asesores de ficha registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra una fila por asesor de ficha, sin columna de acciones ni botón de quitar', () => {
    vi.mocked(useAsesoresFicha).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE, DE_BAJA]) }),
    );

    render(<ConsultarAsesoresFicha />);

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /quitar rol/i })).not.toBeInTheDocument();
  });
});

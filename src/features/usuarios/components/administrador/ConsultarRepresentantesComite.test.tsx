import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarRepresentantesComite from './ConsultarRepresentantesComite';
import { useRepresentantesComite } from '../../hooks/useRepresentantesComite';
import type { RepresentanteComite } from '../../models/RepresentanteComite';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useRepresentantesComite', () => ({
  useRepresentantesComite: vi.fn(),
}));

const VIGENTE: RepresentanteComite = {
  id: 'rc-1',
  identificador: '4001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  contacto: '3001112233',
  estado: 'ACTIVO',
  vigente: true,
};

const DE_BAJA: RepresentanteComite = {
  id: 'rc-2',
  identificador: '4002',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  contacto: '3004445566',
  estado: 'INACTIVO',
  vigente: false,
};

function crearPagina(content: RepresentanteComite[]): Page<RepresentanteComite> {
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
  parcial: Partial<ReturnType<typeof useRepresentantesComite>> = {},
): ReturnType<typeof useRepresentantesComite> {
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
  } as ReturnType<typeof useRepresentantesComite>;
}

describe('ConsultarRepresentantesComite', () => {
  beforeEach(() => {
    vi.mocked(useRepresentantesComite).mockReset();
  });

  it('muestra el estado de carga con el título visible', () => {
    vi.mocked(useRepresentantesComite).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarRepresentantesComite />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando representantes del comité...');
    expect(screen.getByRole('heading', { name: 'Representantes del comité' })).toBeInTheDocument();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useRepresentantesComite).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarRepresentantesComite />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los representantes del comité. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando no hay representantes del comité', () => {
    vi.mocked(useRepresentantesComite).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    render(<ConsultarRepresentantesComite />);

    expect(screen.getByText('No hay representantes del comité registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista los representantes con su vigencia y sin columna de acciones ni botón de quitar rol', () => {
    vi.mocked(useRepresentantesComite).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE, DE_BAJA]) }),
    );

    render(<ConsultarRepresentantesComite />);

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('2 representantes del comité')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getAllByText('Vigente').length).toBeGreaterThan(1);
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /quitar rol/i })).not.toBeInTheDocument();
  });

  it('Actualizar vuelve a consultar con refetch', async () => {
    // Arrange
    const refetch = vi.fn();
    vi.mocked(useRepresentantesComite).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE]), refetch }),
    );
    const user = userEvent.setup();
    render(<ConsultarRepresentantesComite />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

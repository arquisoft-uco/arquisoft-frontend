import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEstudiantes from './ConsultarEstudiantes';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import type { Estudiante } from '../../models/Estudiante';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
}));

const ESTUDIANTE_VIGENTE: Estudiante = {
  id: 'e-1',
  identificador: '2001',
  nombre: 'Marta Ríos',
  email: 'marta@uco.edu.co',
  contacto: '3001112233',
  estado: 'ACTIVO',
  vigente: true,
};

const ESTUDIANTE_DE_BAJA: Estudiante = {
  id: 'e-2',
  identificador: '2002',
  nombre: 'Pedro Soto',
  email: 'pedro@uco.edu.co',
  contacto: '3004445566',
  estado: 'INACTIVO',
  vigente: false,
};

function crearPagina(
  content: Estudiante[],
  { totalPages = 1, totalElements = content.length } = {},
): Page<Estudiante> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  };
}

function crearHookMock(
  parcial: Partial<ReturnType<typeof useEstudiantes>> = {},
  goToPage = vi.fn(),
): ReturnType<typeof useEstudiantes> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage,
    ...parcial,
  } as ReturnType<typeof useEstudiantes>;
}

describe('ConsultarEstudiantes', () => {
  beforeEach(() => {
    vi.mocked(useEstudiantes).mockReset();
  });

  it('muestra el estado de carga con el título visible', () => {
    vi.mocked(useEstudiantes).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarEstudiantes />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando estudiantes...');
    expect(screen.getByRole('heading', { name: 'Estudiantes' })).toBeInTheDocument();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarEstudiantes />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los estudiantes. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando no hay estudiantes', () => {
    vi.mocked(useEstudiantes).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    render(<ConsultarEstudiantes />);

    expect(screen.getByText('No hay estudiantes registrados.')).toBeInTheDocument();
    expect(screen.getByText('0 estudiantes')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra una fila por estudiante con el estado tal cual y la insignia de vigencia', () => {
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE, ESTUDIANTE_DE_BAJA]) }),
    );

    render(<ConsultarEstudiantes />);

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Marta Ríos')).toBeInTheDocument();
    expect(screen.getByText('pedro@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('ACTIVO')).toBeInTheDocument();
    expect(screen.getByText('INACTIVO')).toBeInTheDocument();
    expect(screen.getByText('Vigente', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(screen.getByText('2 estudiantes')).toBeInTheDocument();
  });

  it('pagina con Siguiente y no muestra el paginador con una sola página', async () => {
    const goToPage = vi.fn();
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock(
        { data: crearPagina([ESTUDIANTE_VIGENTE], { totalPages: 3, totalElements: 25 }) },
        goToPage,
      ),
    );
    const user = userEvent.setup();
    const { unmount } = render(<ConsultarEstudiantes />);

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(goToPage).toHaveBeenCalledWith(1);

    unmount();
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE], { totalPages: 1 }) }),
    );
    render(<ConsultarEstudiantes />);

    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();
  });
});

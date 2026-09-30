import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import ConsultarUsuarios from './ConsultarUsuarios';
import { useUsuarios } from '../../hooks/useUsuarios';
import type { Usuario } from '../../models/Usuario';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useUsuarios', () => ({
  useUsuarios: vi.fn(),
}));

const USUARIO: Usuario = {
  id: 'u-1',
  identificador: '2001',
  nombre: 'Marta Ríos',
  email: 'marta@uco.edu.co',
  contacto: '3001234567',
  estado: 'ACTIVO',
  vigente: true,
  esEstudiante: true,
  esAsesor: false,
  esAsesorFicha: false,
  esCoordinador: false,
  esRepresentanteComite: false,
  esAdministrador: false,
};

function crearPagina(
  content: Usuario[],
  { totalPages = 1, totalElements = content.length } = {},
): Page<Usuario> {
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
  parcial: Partial<ReturnType<typeof useUsuarios>> = {},
): ReturnType<typeof useUsuarios> {
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
    rolesSeleccionados: [],
    toggleRol: vi.fn(),
    estado: undefined,
    setEstado: vi.fn(),
    vigente: undefined,
    setVigente: vi.fn(),
    ordenCampo: undefined,
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useUsuarios>;
}

describe('ConsultarUsuarios', () => {
  beforeEach(() => {
    vi.mocked(useUsuarios).mockReset();
  });

  it('muestra el estado de carga con el título visible', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios...');
    expect(screen.getByRole('heading', { name: 'Todos los usuarios' })).toBeInTheDocument();
  });

  it('muestra el texto de vacío cuando no hay usuarios', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByText('No hay usuarios que coincidan con el filtro.')).toBeInTheDocument();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los usuarios. Intenta nuevamente.',
    );
  });

  it('deshabilita el botón de actualizar mientras isFetching', () => {
    // Arrange
    vi.mocked(useUsuarios).mockReturnValue(
      crearHookMock({ data: crearPagina([USUARIO]), isFetching: true }),
    );

    // Act
    render(<ConsultarUsuarios />);

    // Assert
    expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled();
  });
});

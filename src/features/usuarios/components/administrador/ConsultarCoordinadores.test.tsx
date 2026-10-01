import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarCoordinadores from './ConsultarCoordinadores';
import { useCoordinadores } from '../../hooks/useCoordinadores';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import type { Coordinador } from '../../models/Coordinador';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useEstadosUsuario', () => ({
  useEstadosUsuario: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock('../../hooks/useCoordinadores', () => ({
  useCoordinadores: vi.fn(),
}));
vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
}));

const COORDINADOR_VIGENTE: Coordinador = {
  id: 'c-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  contacto: '3001112233',
  estado: 'ACTIVO',
  vigente: true,
};

const COORDINADOR_DE_BAJA: Coordinador = {
  id: 'c-2',
  identificador: '1002',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  contacto: '3004445566',
  estado: 'INACTIVO',
  vigente: false,
};

function crearPagina(
  content: Coordinador[],
  { totalPages = 1, totalElements = content.length } = {},
): Page<Coordinador> {
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
  parcial: Partial<ReturnType<typeof useCoordinadores>> = {},
  goToPage = vi.fn(),
): ReturnType<typeof useCoordinadores> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage,
    ...parcial,
  } as ReturnType<typeof useCoordinadores>;
}

type ConfirmarRemocion = (usuarioId: string, rol: Rol, onExito?: () => void) => void;

function usarRemoverRolFalso(
  confirmar: ConfirmarRemocion,
  isPending = false,
): ReturnType<typeof useRemoverRol> {
  const [objetivo, setObjetivo] = useState<ReturnType<typeof useRemoverRol>['objetivo']>(null);
  return {
    objetivo,
    solicitar: setObjetivo,
    cancelar: () => setObjetivo(null),
    confirmar: (onExito) => {
      if (objetivo) confirmar(objetivo.usuarioId, objetivo.rol, onExito);
      setObjetivo(null);
    },
    isPending,
  };
}

describe('ConsultarCoordinadores', () => {
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCoordinadores).mockReset();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
  });

  it('muestra el estado de carga con el título y el botón de actualizar visibles', () => {
    vi.mocked(useCoordinadores).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarCoordinadores />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando coordinadores...');
    expect(screen.getByRole('heading', { name: 'Coordinadores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });

  it('el clic en Actualizar dispara refetch y se deshabilita mientras isFetching', async () => {
    const refetch = vi.fn();
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE]), refetch }),
    );
    const user = userEvent.setup();
    const { unmount } = render(<ConsultarCoordinadores />);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    unmount();

    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE]), isFetching: true }),
    );
    render(<ConsultarCoordinadores />);

    expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarCoordinadores />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los coordinadores. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando no hay coordinadores', () => {
    vi.mocked(useCoordinadores).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    render(<ConsultarCoordinadores />);

    expect(screen.getByText('No hay coordinadores registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra una fila por coordinador con la insignia Vigente o Dado de baja según corresponda', () => {
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE, COORDINADOR_DE_BAJA]) }),
    );

    render(<ConsultarCoordinadores />);

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Vigente', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(screen.getByText('2 coordinadores')).toBeInTheDocument();
  });

  it('deshabilita Anterior en la primera página y Siguiente avanza a la página siguiente', async () => {
    const goToPage = vi.fn();
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock(
        { data: crearPagina([COORDINADOR_VIGENTE], { totalPages: 3, totalElements: 25 }), page: 0 },
        goToPage,
      ),
    );
    const user = userEvent.setup();

    render(<ConsultarCoordinadores />);

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('no muestra el paginador cuando hay una sola página', () => {
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE], { totalPages: 1 }) }),
    );

    render(<ConsultarCoordinadores />);

    expect(screen.queryByRole('button', { name: 'Página anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();
  });

  it('el botón de quitar rol de una fila de baja está deshabilitado y el de una vigente habilitado', () => {
    // Arrange
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE, COORDINADOR_DE_BAJA]) }),
    );

    // Act
    render(<ConsultarCoordinadores />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'Quitar rol coordinador a Ana Pérez' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Luis Gómez ya no es coordinador vigente' }),
    ).toBeDisabled();
  });

  it('el botón de una fila abre la confirmación con el texto exacto y cancelar no llama a la mutación', async () => {
    // Arrange
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE]) }),
    );
    const user = userEvent.setup();
    render(<ConsultarCoordinadores />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol coordinador a Ana Pérez' }));
    const dialogo = screen.getByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(dialogo).toHaveTextContent(
      '¿Está seguro de eliminar el rol Coordinador para el usuario Ana Pérez?',
    );
    expect(mockRemover).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirmar llama a la mutación con el id y el rol coordinador y cierra el diálogo', async () => {
    // Arrange
    vi.mocked(useCoordinadores).mockReturnValue(
      crearHookMock({ data: crearPagina([COORDINADOR_VIGENTE]) }),
    );
    const user = userEvent.setup();
    render(<ConsultarCoordinadores />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol coordinador a Ana Pérez' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mockRemover).toHaveBeenCalledWith(COORDINADOR_VIGENTE.id, Rol.Coordinador, undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

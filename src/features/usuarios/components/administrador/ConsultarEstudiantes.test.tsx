import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEstudiantes from './ConsultarEstudiantes';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import type { Estudiante } from '../../models/Estudiante';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
}));
vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
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
    isFetching: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage,
    ...parcial,
  } as ReturnType<typeof useEstudiantes>;
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

describe('ConsultarEstudiantes', () => {
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.mocked(useEstudiantes).mockReset();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
  });

  it('muestra el estado de carga con el título y el botón de actualizar visibles', () => {
    vi.mocked(useEstudiantes).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarEstudiantes />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando estudiantes...');
    expect(screen.getByRole('heading', { name: 'Estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });

  it('el clic en Actualizar dispara refetch y se deshabilita mientras isFetching', async () => {
    const refetch = vi.fn();
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE]), refetch }),
    );
    const user = userEvent.setup();
    const { unmount } = render(<ConsultarEstudiantes />);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    unmount();

    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE]), isFetching: true }),
    );
    render(<ConsultarEstudiantes />);

    expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled();
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

  it('el botón de quitar rol de una fila de baja está deshabilitado y el de una vigente habilitado', () => {
    // Arrange
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE, ESTUDIANTE_DE_BAJA]) }),
    );

    // Act
    render(<ConsultarEstudiantes />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'Quitar rol estudiante a Marta Ríos' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Pedro Soto ya no es estudiante vigente' }),
    ).toBeDisabled();
  });

  it('el botón de una fila abre la confirmación con el texto exacto y cancelar no llama a la mutación', async () => {
    // Arrange
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE]) }),
    );
    const user = userEvent.setup();
    render(<ConsultarEstudiantes />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol estudiante a Marta Ríos' }));
    const dialogo = screen.getByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(dialogo).toHaveTextContent(
      '¿Está seguro de eliminar el rol Estudiante para el usuario Marta Ríos?',
    );
    expect(mockRemover).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirmar llama a la mutación con el id y el rol estudiante y cierra el diálogo', async () => {
    // Arrange
    vi.mocked(useEstudiantes).mockReturnValue(
      crearHookMock({ data: crearPagina([ESTUDIANTE_VIGENTE]) }),
    );
    const user = userEvent.setup();
    render(<ConsultarEstudiantes />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol estudiante a Marta Ríos' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mockRemover).toHaveBeenCalledWith(ESTUDIANTE_VIGENTE.id, Rol.Estudiante, undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarAsesores from './ConsultarAsesores';
import { useAsesores } from '../../hooks/useAsesores';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import type { Asesor } from '../../models/Asesor';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useAsesores', () => ({
  useAsesores: vi.fn(),
}));
vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
}));

const ASESOR_VIGENTE: Asesor = {
  id: 'a-1',
  identificador: '2001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  contacto: '3001112233',
  estado: 'ACTIVO',
  vigente: true,
};

const ASESOR_DE_BAJA: Asesor = {
  id: 'a-2',
  identificador: '2002',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  contacto: '3004445566',
  estado: 'INACTIVO',
  vigente: false,
};

function crearPagina(
  content: Asesor[],
  { totalPages = 1, totalElements = content.length } = {},
): Page<Asesor> {
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
  parcial: Partial<ReturnType<typeof useAsesores>> = {},
  goToPage = vi.fn(),
): ReturnType<typeof useAsesores> {
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
  } as ReturnType<typeof useAsesores>;
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

describe('ConsultarAsesores', () => {
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.mocked(useAsesores).mockReset();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
  });

  it('muestra el estado de carga con el título y el botón de actualizar visibles', () => {
    vi.mocked(useAsesores).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarAsesores />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando asesores...');
    expect(screen.getByRole('heading', { name: 'Asesores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });

  it('el clic en Actualizar dispara refetch y se deshabilita mientras isFetching', async () => {
    const refetch = vi.fn();
    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock({ data: crearPagina([ASESOR_VIGENTE]), refetch }),
    );
    const user = userEvent.setup();
    const { unmount } = render(<ConsultarAsesores />);

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    unmount();

    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock({ data: crearPagina([ASESOR_VIGENTE]), isFetching: true }),
    );
    render(<ConsultarAsesores />);

    expect(screen.getByRole('button', { name: /actualizando/i })).toBeDisabled();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarAsesores />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los asesores. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando no hay asesores', () => {
    vi.mocked(useAsesores).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    render(<ConsultarAsesores />);

    expect(screen.getByText('No hay asesores registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra una fila por asesor con su insignia de vigencia', () => {
    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock({ data: crearPagina([ASESOR_VIGENTE, ASESOR_DE_BAJA]) }),
    );

    render(<ConsultarAsesores />);

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Vigente', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(screen.getByText('2 asesores')).toBeInTheDocument();
  });

  it('deshabilita Anterior en la primera página y Siguiente avanza a la página siguiente', async () => {
    const goToPage = vi.fn();
    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock(
        { data: crearPagina([ASESOR_VIGENTE], { totalPages: 3, totalElements: 25 }), page: 0 },
        goToPage,
      ),
    );
    const user = userEvent.setup();

    render(<ConsultarAsesores />);

    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('el botón de quitar rol de una fila de baja está deshabilitado y el de una vigente habilitado', () => {
    // Arrange
    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock({ data: crearPagina([ASESOR_VIGENTE, ASESOR_DE_BAJA]) }),
    );

    // Act
    render(<ConsultarAsesores />);

    // Assert
    expect(screen.getByRole('button', { name: 'Quitar rol asesor a Ana Pérez' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Luis Gómez ya no es asesor vigente' }),
    ).toBeDisabled();
  });

  it('el botón de una fila abre la confirmación con el texto exacto y cancelar no llama a la mutación', async () => {
    // Arrange
    vi.mocked(useAsesores).mockReturnValue(crearHookMock({ data: crearPagina([ASESOR_VIGENTE]) }));
    const user = userEvent.setup();
    render(<ConsultarAsesores />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol asesor a Ana Pérez' }));
    const dialogo = screen.getByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(dialogo).toHaveTextContent(
      '¿Está seguro de eliminar el rol Asesor para el usuario Ana Pérez?',
    );
    expect(mockRemover).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirmar llama a la mutación con el id y el rol asesor y cierra el diálogo', async () => {
    // Arrange
    vi.mocked(useAsesores).mockReturnValue(crearHookMock({ data: crearPagina([ASESOR_VIGENTE]) }));
    const user = userEvent.setup();
    render(<ConsultarAsesores />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol asesor a Ana Pérez' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(mockRemover).toHaveBeenCalledWith(ASESOR_VIGENTE.id, Rol.Asesor, undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('no muestra el paginador cuando hay una sola página', () => {
    vi.mocked(useAsesores).mockReturnValue(
      crearHookMock({ data: crearPagina([ASESOR_VIGENTE], { totalPages: 1 }) }),
    );

    render(<ConsultarAsesores />);

    expect(screen.queryByRole('button', { name: 'Página anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();
  });
});

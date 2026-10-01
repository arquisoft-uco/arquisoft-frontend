import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarAsesoresFicha from './ConsultarAsesoresFicha';
import { useAsesoresFicha } from '../../hooks/useAsesoresFicha';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import type { AsesorFicha } from '../../models/AsesorFicha';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useAsesoresFicha', () => ({
  useAsesoresFicha: vi.fn(),
}));
vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
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

describe('ConsultarAsesoresFicha', () => {
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.mocked(useAsesoresFicha).mockReset();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
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
  });

  it('el botón de quitar rol de una fila de baja está deshabilitado y el de una vigente habilitado', () => {
    // Arrange
    vi.mocked(useAsesoresFicha).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE, DE_BAJA]) }),
    );

    // Act
    render(<ConsultarAsesoresFicha />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'Quitar rol asesor de ficha a Ana Pérez' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Luis Gómez ya no es asesor de ficha vigente' }),
    ).toBeDisabled();
  });

  it('cancelar la confirmación no llama a la mutación y confirmar la llama con el rol asesor de ficha', async () => {
    // Arrange
    vi.mocked(useAsesoresFicha).mockReturnValue(crearHookMock({ data: crearPagina([VIGENTE]) }));
    const user = userEvent.setup();
    render(<ConsultarAsesoresFicha />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar rol asesor de ficha a Ana Pérez' }));
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const llamadasTrasCancelar = mockRemover.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Quitar rol asesor de ficha a Ana Pérez' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      '¿Está seguro de eliminar el rol Asesor de Ficha para el usuario Ana Pérez?',
    );
    expect(llamadasTrasCancelar).toBe(0);
    expect(mockRemover).toHaveBeenCalledWith(VIGENTE.id, Rol.AsesorFicha, undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

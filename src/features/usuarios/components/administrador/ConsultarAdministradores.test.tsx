import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarAdministradores from './ConsultarAdministradores';
import { useAdministradores } from '../../hooks/useAdministradores';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import type { Administrador } from '../../models/Administrador';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useEstadosUsuario', () => ({
  useEstadosUsuario: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock('../../hooks/useAdministradores', () => ({
  useAdministradores: vi.fn(),
}));

vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
}));

const VIGENTE: Administrador = {
  id: 'ad-1',
  identificador: '5001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  contacto: '3001112233',
  estado: 'ACTIVO',
  vigente: true,
};

const DE_BAJA: Administrador = {
  id: 'ad-2',
  identificador: '5002',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  contacto: '3004445566',
  estado: 'INACTIVO',
  vigente: false,
};

function crearPagina(content: Administrador[]): Page<Administrador> {
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
  parcial: Partial<ReturnType<typeof useAdministradores>> = {},
): ReturnType<typeof useAdministradores> {
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
  } as ReturnType<typeof useAdministradores>;
}

type ConfirmarRemocion = (usuarioId: string, rol: Rol, onExito?: () => void) => void;

function usarRemoverRolFalso(confirmar: ConfirmarRemocion): ReturnType<typeof useRemoverRol> {
  const [objetivo, setObjetivo] = useState<ReturnType<typeof useRemoverRol>['objetivo']>(null);
  return {
    objetivo,
    solicitar: setObjetivo,
    cancelar: () => setObjetivo(null),
    confirmar: (onExito) => {
      if (objetivo) confirmar(objetivo.usuarioId, objetivo.rol, onExito);
      setObjetivo(null);
    },
    isPending: false,
  };
}

describe('ConsultarAdministradores', () => {
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.mocked(useAdministradores).mockReset();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
  });

  it('muestra el estado de carga con el título visible', () => {
    vi.mocked(useAdministradores).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarAdministradores />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando administradores...');
    expect(screen.getByRole('heading', { name: 'Administradores' })).toBeInTheDocument();
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useAdministradores).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarAdministradores />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los administradores. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando no hay administradores', () => {
    vi.mocked(useAdministradores).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    render(<ConsultarAdministradores />);

    expect(screen.getByText('No hay administradores registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista los administradores con su vigencia y la columna de acciones', () => {
    vi.mocked(useAdministradores).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE, DE_BAJA]) }),
    );

    render(<ConsultarAdministradores />);

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('5002')).toBeInTheDocument();
    expect(screen.getByText('Dado de baja')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar rol administrador a Ana Pérez' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Luis Gómez ya no es administrador vigente' }),
    ).toBeDisabled();
  });

  it('cancelar la confirmación no llama a la mutación y confirmar la llama con el rol administrador', async () => {
    // Arrange
    vi.mocked(useAdministradores).mockReturnValue(crearHookMock({ data: crearPagina([VIGENTE]) }));
    const user = userEvent.setup();
    render(<ConsultarAdministradores />);
    const nombreBoton = 'Quitar rol administrador a Ana Pérez';

    // Act
    await user.click(screen.getByRole('button', { name: nombreBoton }));
    const dialogo = screen.getByRole('dialog');
    const textoDialogo = dialogo.textContent;
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    const llamadasTrasCancelar = mockRemover.mock.calls.length;
    await user.click(screen.getByRole('button', { name: nombreBoton }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(textoDialogo).toContain(
      '¿Está seguro de eliminar el rol Administrador para el usuario Ana Pérez?',
    );
    expect(llamadasTrasCancelar).toBe(0);
    expect(mockRemover).toHaveBeenCalledWith(VIGENTE.id, Rol.Administrador, undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Actualizar vuelve a consultar con refetch', async () => {
    // Arrange
    const refetch = vi.fn();
    vi.mocked(useAdministradores).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE]), refetch }),
    );
    const user = userEvent.setup();
    render(<ConsultarAdministradores />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

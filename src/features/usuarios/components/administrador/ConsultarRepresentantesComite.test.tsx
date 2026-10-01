import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarRepresentantesComite from './ConsultarRepresentantesComite';
import { useRepresentantesComite } from '../../hooks/useRepresentantesComite';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import { Rol } from '../../../../shared/models/rol';
import type { RepresentanteComite } from '../../models/RepresentanteComite';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useRepresentantesComite', () => ({
  useRepresentantesComite: vi.fn(),
}));
vi.mock('../../hooks/useRemoverRol', () => ({
  useRemoverRol: vi.fn(),
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

describe('ConsultarRepresentantesComite', () => {
  let mockRemover: Mock<ConfirmarRemocion>;

  beforeEach(() => {
    vi.mocked(useRepresentantesComite).mockReset();
    mockRemover = vi.fn<ConfirmarRemocion>();
    vi.mocked(useRemoverRol).mockImplementation(() => usarRemoverRolFalso(mockRemover));
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

  it('lista los representantes con su vigencia y la columna de acciones', () => {
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
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
  });

  it('el botón de quitar rol de una fila de baja está deshabilitado y el de una vigente habilitado', () => {
    // Arrange
    vi.mocked(useRepresentantesComite).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE, DE_BAJA]) }),
    );

    // Act
    render(<ConsultarRepresentantesComite />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'Quitar rol representante del comité a Ana Pérez' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', {
        name: 'Luis Gómez ya no es representante del comité vigente',
      }),
    ).toBeDisabled();
  });

  it('cancelar la confirmación no llama a la mutación y confirmar la llama con el rol representante del comité', async () => {
    // Arrange
    vi.mocked(useRepresentantesComite).mockReturnValue(
      crearHookMock({ data: crearPagina([VIGENTE]) }),
    );
    const user = userEvent.setup();
    render(<ConsultarRepresentantesComite />);
    const nombreBoton = 'Quitar rol representante del comité a Ana Pérez';

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
      '¿Está seguro de eliminar el rol Representante del Comité para el usuario Ana Pérez?',
    );
    expect(llamadasTrasCancelar).toBe(0);
    expect(mockRemover).toHaveBeenCalledWith(VIGENTE.id, Rol.RepresentanteComiteCurriculum, undefined);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

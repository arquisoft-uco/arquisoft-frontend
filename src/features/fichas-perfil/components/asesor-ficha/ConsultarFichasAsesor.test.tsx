import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarFichasAsesor from './ConsultarFichasAsesor';
import { useFichasAsesor } from '../../hooks/useFichasAsesor';
import type { Page } from '../../../../shared/models/api-response';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('../../hooks/useFichasAsesor', () => ({
  useFichasAsesor: vi.fn(),
}));

function crearHookMock(
  parcial: Partial<ReturnType<typeof useFichasAsesor>> = {},
): ReturnType<typeof useFichasAsesor> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasAsesor>;
}

function crearPagina(content: FichaPerfil[], extra: Partial<Page<FichaPerfil>> = {}): Page<FichaPerfil> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    first: true,
    last: true,
    empty: content.length === 0,
    ...extra,
  };
}

const FICHA_1: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
};

const FICHA_2: FichaPerfil = {
  id: 'f-2',
  tituloProyecto: 'Plataforma de matrículas',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
};

describe('ConsultarFichasAsesor', () => {
  beforeEach(() => {
    vi.mocked(useFichasAsesor).mockReset();
  });

  it('muestra el spinner accesible mientras carga', () => {
    // Arrange
    vi.mocked(useFichasAsesor).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando fichas de perfil...');
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    // Arrange
    vi.mocked(useFichasAsesor).mockReturnValue(crearHookMock({ isError: true }));

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las fichas. Intenta nuevamente.',
    );
  });

  it('muestra el texto de vacío cuando el asesor no tiene fichas asignadas', () => {
    // Arrange
    vi.mocked(useFichasAsesor).mockReturnValue(crearHookMock({ data: crearPagina([]) }));

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByText('No tienes fichas de perfil asignadas.')).toBeInTheDocument();
  });

  it('lista cada ficha por su título de proyecto y no muestra columna de estado actual', () => {
    // Arrange
    vi.mocked(useFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([FICHA_1, FICHA_2]) }),
    );

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(screen.getByText('Plataforma de matrículas')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Estado Actual' })).not.toBeInTheDocument();
  });

  it('al hacer clic en Ver detalle llama a onSeleccionar con id, titulo y estadoActual vacío', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSeleccionar = vi.fn();
    vi.mocked(useFichasAsesor).mockReturnValue(crearHookMock({ data: crearPagina([FICHA_1]) }));
    render(<ConsultarFichasAsesor onSeleccionar={onSeleccionar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver detalle' }));

    // Assert
    expect(onSeleccionar).toHaveBeenCalledWith({
      id: 'f-1',
      titulo: 'Sistema de monitoreo',
      estadoActual: '',
    });
  });

  it('con más de una página, los botones Anterior/Siguiente llaman a goToPage y se deshabilitan en los extremos', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    vi.mocked(useFichasAsesor).mockReturnValue(
      crearHookMock({
        data: crearPagina([FICHA_1], { totalPages: 2, totalElements: 11 }),
        page: 0,
        goToPage,
      }),
    );
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert: deshabilitado en el extremo inicial
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).not.toBeDisabled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  it('en la última página, el botón Siguiente se deshabilita y Anterior no', () => {
    // Arrange
    vi.mocked(useFichasAsesor).mockReturnValue(
      crearHookMock({
        data: crearPagina([FICHA_1], { totalPages: 2, totalElements: 11, first: false, last: true }),
        page: 1,
      }),
    );

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Página anterior' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('con una sola página, no renderiza la paginación', () => {
    // Arrange
    vi.mocked(useFichasAsesor).mockReturnValue(
      crearHookMock({ data: crearPagina([FICHA_1], { totalPages: 1 }) }),
    );

    // Act
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();
  });

  it('al hacer clic en Actualizar llama a refetch', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useFichasAsesor).mockReturnValue(crearHookMock({ data: crearPagina([]), refetch }));
    render(<ConsultarFichasAsesor onSeleccionar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    // Assert
    expect(refetch).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AdministradorView from './AdministradorView';
import { useRegistrarUsuario } from '../hooks/useRegistrarUsuario';
import { useCoordinadores } from '../hooks/useCoordinadores';
import { useEstudiantes } from '../hooks/useEstudiantes';

vi.mock('../hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));

vi.mock('../hooks/useCoordinadores', () => ({
  useCoordinadores: vi.fn(),
}));

vi.mock('../hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
}));

function crearCoordinadoresMock(
  parcial: Partial<ReturnType<typeof useCoordinadores>> = {},
): ReturnType<typeof useCoordinadores> {
  return {
    data: {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    },
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useCoordinadores>;
}

function crearEstudiantesMock(
  parcial: Partial<ReturnType<typeof useEstudiantes>> = {},
): ReturnType<typeof useEstudiantes> {
  return {
    data: {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    },
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEstudiantes>;
}

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
): ReturnType<typeof useRegistrarUsuario> {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ReturnType<typeof useRegistrarUsuario>;
}

describe('AdministradorView', () => {
  beforeEach(() => {
    vi.mocked(useCoordinadores).mockReturnValue(crearCoordinadoresMock());
    vi.mocked(useEstudiantes).mockReturnValue(crearEstudiantesMock());
  });

  it('muestra el botón "Registrar usuario" por defecto y alterna con el formulario al abrir y cerrar', async () => {
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(vi.fn()));
    const user = userEvent.setup();
    render(<AdministradorView />);

    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^registrar$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /registrar usuario/i }));

    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^registrar$/i })).not.toBeInTheDocument();
  });

  it('mantiene el listado de coordinadores montado mientras el formulario está abierto', async () => {
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(vi.fn()));
    const user = userEvent.setup();
    render(<AdministradorView />);

    await user.click(screen.getByRole('button', { name: /registrar usuario/i }));

    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Coordinadores' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Coordinadores' })).toBeInTheDocument();
  });

  it('muestra las secciones de coordinadores y estudiantes y las mantiene con el formulario abierto', async () => {
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(vi.fn()));
    const user = userEvent.setup();
    render(<AdministradorView />);

    expect(screen.getByRole('heading', { name: 'Coordinadores' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Estudiantes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /registrar usuario/i }));

    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Coordinadores' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Estudiantes' })).toBeInTheDocument();
  });
});

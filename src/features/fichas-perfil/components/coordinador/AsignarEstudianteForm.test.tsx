import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AsignarEstudianteForm from './AsignarEstudianteForm';
import { useEstudiantesVigentes } from '../../../../shared/hooks/useEstudiantesVigentes';
import { useAsignarEstudiante } from '../../hooks/useAsignarEstudiante';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES } from '../../../../shared/validation';
import type { EstudianteVigente } from '../../../../shared/models/EstudianteVigente';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';

vi.mock('../../../../shared/hooks/useEstudiantesVigentes', () => ({
  useEstudiantesVigentes: vi.fn(),
}));
vi.mock('../../hooks/useAsignarEstudiante', () => ({
  useAsignarEstudiante: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useEstudiantesVigentesMock = vi.mocked(useEstudiantesVigentes);
const useAsignarEstudianteMock = vi.mocked(useAsignarEstudiante);

type ResultadoEstudiantes = ReturnType<typeof useEstudiantesVigentes>;
type ResultadoMutacion = ReturnType<typeof useAsignarEstudiante>;

const E1: EstudianteVigente = { id: 'e-1', nombre: 'Carlos Ruiz', email: 'carlos@uco.edu.co' };
const E2: EstudianteVigente = { id: 'e-2', nombre: 'Diana Soto', email: 'diana@uco.edu.co' };
const E3: EstudianteVigente = { id: 'e-3', nombre: 'Elena Vargas', email: 'elena@uco.edu.co' };

function mockEstudiantes(parcial: Partial<ResultadoEstudiantes>) {
  useEstudiantesVigentesMock.mockReturnValue({
    data: [E1, E2, E3],
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoEstudiantes);
}

function crearMutacionMock(mutate: ReturnType<typeof vi.fn>, isPending = false): ResultadoMutacion {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: isPending ? 'pending' : 'idle',
    isError: false,
    isIdle: !isPending,
    isPending,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ResultadoMutacion;
}

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useAsignarEstudianteMock.mockReturnValue(crearMutacionMock(mutate, isPending));
  return mutate;
}

function vinculado(id: string): EstudianteVinculado {
  return { idVinculo: `v-${id}`, id, nombre: 'Vinculado', email: 'vinculado@uco.edu.co' };
}

describe('AsignarEstudianteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEstudiantes({});
    mockMutacion();
  });

  it('muestra el estado de carga mientras el catálogo de estudiantes no resuelve', async () => {
    // Arrange
    mockEstudiantes({ data: undefined, isLoading: true });

    // Act
    render(<AsignarEstudianteForm idFichaPerfil="f-1" vinculados={[]} />);

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('Cargando estudiantes...');
  });

  it('muestra AvisoNoDisponible cuando el catálogo de estudiantes falla', async () => {
    // Arrange
    mockEstudiantes({ data: undefined, isError: true });

    // Act
    render(<AsignarEstudianteForm idFichaPerfil="f-1" vinculados={[]} />);

    // Assert
    expect(
      await screen.findByRole('note', { name: 'No disponible: estudiantes' }),
    ).toBeInTheDocument();
  });

  it('excluye de las opciones a los estudiantes ya vinculados', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsignarEstudianteForm idFichaPerfil="f-1" vinculados={[vinculado(E2.id)]} />);

    // Act
    await user.click(await screen.findByRole('combobox', { name: 'Agregar estudiantes' }));

    // Assert
    expect(screen.getByRole('option', { name: /Carlos Ruiz/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Elena Vargas/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Diana Soto/ })).not.toBeInTheDocument();
  });

  it('deshabilita el campo al llegar al tope de cupos restantes de la ficha', async () => {
    // Arrange: un solo vinculado deja 2 cupos, no el máximo fijo de 3
    const vinculados = [vinculado('v-existente')];
    expect(LIMITES.ESTUDIANTES_MAX - vinculados.length).toBe(2);
    const user = userEvent.setup();
    render(<AsignarEstudianteForm idFichaPerfil="f-1" vinculados={vinculados} />);
    const campo = await screen.findByRole('combobox', { name: 'Agregar estudiantes' });

    // Act
    await user.click(campo);
    await user.click(screen.getByRole('option', { name: /Carlos Ruiz/ }));
    await user.click(screen.getByRole('option', { name: /Diana Soto/ }));

    // Assert
    expect(campo).toBeDisabled();
  });

  it('envía los ids seleccionados, notifica el éxito y limpia la selección', async () => {
    // Arrange
    const mutate = vi.fn((_ids: string[], opciones?: { onSuccess?: () => void }) =>
      opciones?.onSuccess?.(),
    );
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<AsignarEstudianteForm idFichaPerfil="f-1" vinculados={[]} />);

    // Act
    await user.click(await screen.findByRole('combobox', { name: 'Agregar estudiantes' }));
    await user.click(screen.getByRole('option', { name: /Carlos Ruiz/ }));
    await user.click(screen.getByRole('option', { name: /Elena Vargas/ }));
    await user.click(screen.getByRole('button', { name: 'Asignar estudiantes seleccionados' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(['e-1', 'e-3'], expect.anything());
    expect(toast.success).toHaveBeenCalledWith('Estudiantes asignados', expect.any(String));
    expect(screen.queryByRole('button', { name: 'Quitar a Carlos Ruiz' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar a Elena Vargas' })).not.toBeInTheDocument();
  });
});

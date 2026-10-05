import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import EstudiantesVinculadosPanel from './EstudiantesVinculadosPanel';
import { useEstudiantesVinculados } from '../../hooks/useEstudiantesVinculados';
import { useRemoverEstudiante } from '../../hooks/useRemoverEstudiante';
import { toast } from '../../../../shared/hooks/useToast';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('../../hooks/useEstudiantesVinculados', () => ({ useEstudiantesVinculados: vi.fn() }));
vi.mock('../../hooks/useRemoverEstudiante', () => ({ useRemoverEstudiante: vi.fn() }));
vi.mock('./AsignarEstudianteForm', () => ({
  default: () => <p>Formulario para asignar</p>,
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const FICHA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};
const CARLOS: EstudianteVinculado = {
  idVinculo: 'v-1',
  id: 'e-1',
  nombre: 'Carlos Ruiz',
  email: 'carlos@uco.edu.co',
};

type ResultadoConsulta = ReturnType<typeof useEstudiantesVinculados>;
type ResultadoMutacion = ReturnType<typeof useRemoverEstudiante>;

function mockConsulta(parcial: Partial<ResultadoConsulta> = {}) {
  vi.mocked(useEstudiantesVinculados).mockReturnValue({
    data: [CARLOS],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ResultadoConsulta);
}

function mockQuitar(mutate = vi.fn()) {
  vi.mocked(useRemoverEstudiante).mockReturnValue({
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
  } as ResultadoMutacion);
  return mutate;
}

describe('EstudiantesVinculadosPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsulta();
    mockQuitar();
  });

  it('muestra el título de la ficha, los estudiantes vinculados y el formulario para asignar', () => {
    // Act
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Estudiantes de la ficha' })).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Estudiantes vinculados' })).toHaveTextContent(
      'Carlos Ruiz',
    );
    expect(screen.getByText('Formulario para asignar')).toBeInTheDocument();
  });

  it('muestra un estado de carga accesible mientras llegan los estudiantes', () => {
    // Arrange
    mockConsulta({ data: undefined, isLoading: true });

    // Act
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estudiantes vinculados…');
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockConsulta({ data: undefined, isError: true, refetch });
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los estudiantes');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin estudiantes vinculados muestra el vacío y sigue ofreciendo asignar', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no hay estudiantes vinculados')).toBeInTheDocument();
    expect(screen.getByText('Formulario para asignar')).toBeInTheDocument();
  });

  it('quitar pide confirmación, y al confirmar notifica el éxito sin cerrar el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockQuitar(
      vi.fn((_id: string, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.()),
    );
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar a Carlos Ruiz de la ficha' }));

    // Assert
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Carlos Ruiz será quitado de esta ficha de perfil.',
    );
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('e-1', expect.anything());
    expect(toast.success).toHaveBeenCalledWith('Estudiante quitado', expect.any(String));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si quitar falla muestra el error en un toast y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockQuitar(
      vi.fn((_id: string, opciones?: { onError?: (error: Error) => void }) =>
        opciones?.onError?.(new Error('fallo')),
      ),
    );
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar a Carlos Ruiz de la ficha' }));
    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo quitar al estudiante',
        expect.any(String),
      ),
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('"Cerrar" cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<EstudiantesVinculadosPanel ficha={FICHA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});

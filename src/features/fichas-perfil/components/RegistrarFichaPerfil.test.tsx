import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../test-utils/render';
import RegistrarFichaPerfil from './RegistrarFichaPerfil';
import { useRegistrarFichaPerfil } from '../hooks/useRegistrarFichaPerfil';
import { useAsesoresFichaVigentes } from '../../../shared/hooks/useAsesoresFichaVigentes';
import { useEstudiantesVigentes } from '../../../shared/hooks/useEstudiantesVigentes';
import { toast } from '../../../shared/hooks/useToast';
import type { Asesor } from '../../../shared/models/Asesor';
import type { Estudiante } from '../models/Estudiante';
import type { ApiError } from '../../../shared/models/api-response';

vi.mock('../hooks/useRegistrarFichaPerfil', () => ({
  useRegistrarFichaPerfil: vi.fn(),
}));
vi.mock('../../../shared/hooks/useAsesoresFichaVigentes', () => ({
  useAsesoresFichaVigentes: vi.fn(),
}));
vi.mock('../../../shared/hooks/useEstudiantesVigentes', () => ({
  useEstudiantesVigentes: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useAsesoresFichaVigentesMock = vi.mocked(useAsesoresFichaVigentes);
const useEstudiantesVigentesMock = vi.mocked(useEstudiantesVigentes);
const useRegistrarFichaPerfilMock = vi.mocked(useRegistrarFichaPerfil);

type ResultadoAsesores = ReturnType<typeof useAsesoresFichaVigentes>;
type ResultadoEstudiantes = ReturnType<typeof useEstudiantesVigentes>;

function mockAsesores(parcial: Partial<ResultadoAsesores>) {
  useAsesoresFichaVigentesMock.mockReturnValue({
    data: [ANA],
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoAsesores);
}

function mockEstudiantes(parcial: Partial<ResultadoEstudiantes>) {
  useEstudiantesVigentesMock.mockReturnValue({
    data: [E1, E2, E3],
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoEstudiantes);
}

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const E1: Estudiante = { id: 'e-1', nombre: 'Carlos Ruiz', email: 'carlos@uco.edu.co' };
const E2: Estudiante = { id: 'e-2', nombre: 'Diana Soto', email: 'diana@uco.edu.co' };
const E3: Estudiante = { id: 'e-3', nombre: 'Elena Vargas', email: 'elena@uco.edu.co' };

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

type MutacionRegistrarFichaPerfil = ReturnType<typeof useRegistrarFichaPerfil>;

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
  isPending = false,
): MutacionRegistrarFichaPerfil {
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
  } as MutacionRegistrarFichaPerfil;
}

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useRegistrarFichaPerfilMock.mockReturnValue(crearMutacionMock(mutate, isPending));
  return mutate;
}

async function llenarFormularioValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Título del Proyecto/), 'Sistema de monitoreo');
  await user.selectOptions(
    await screen.findByRole('combobox'),
    screen.getByRole('option', { name: /Ana Pérez/ }),
  );
  await user.click(await screen.findByRole('button', { name: 'Carlos Ruiz' }));
}

describe('RegistrarFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsesores({});
    mockEstudiantes({});
  });

  it('mantiene Registrar Ficha deshabilitado hasta tener título, asesor y al menos un estudiante', async () => {
    // Arrange
    mockMutacion();
    const user = userEvent.setup();
    render(<RegistrarFichaPerfil onCerrar={vi.fn()} />);
    const submit = screen.getByRole('button', { name: 'Registrar Ficha' });

    // Assert (inicial)
    expect(submit).toBeDisabled();

    // Act + Assert (progresivo)
    await user.type(screen.getByLabelText(/Título del Proyecto/), 'Sistema de monitoreo');
    expect(submit).toBeDisabled();

    await user.selectOptions(
      await screen.findByRole('combobox'),
      screen.getByRole('option', { name: /Ana Pérez/ }),
    );
    expect(submit).toBeDisabled();

    await user.click(await screen.findByRole('button', { name: 'Carlos Ruiz' }));
    expect(submit).toBeEnabled();
  });

  it('envía con datos válidos, notifica el éxito y cierra el formulario', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarFichaPerfil onCerrar={onCerrar} />);

    // Act
    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: 'Registrar Ficha' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      {
        tituloProyecto: 'Sistema de monitoreo',
        asesorFichaId: 'a-1',
        estudiantesIds: ['e-1'],
      },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Ficha de perfil registrada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('muestra el error del backend en un toast y conserva los datos cuando el registro falla', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'FICHA_TITULO_DUPLICADO',
          message: 'Ya existe una ficha con ese título.',
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarFichaPerfil onCerrar={onCerrar} />);

    // Act
    await llenarFormularioValido(user);
    await user.click(screen.getByRole('button', { name: 'Registrar Ficha' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'Error al registrar la ficha',
      'Ya existe una ficha con ese título.',
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Título del Proyecto/)).toHaveValue('Sistema de monitoreo');
  });

  it('quita un estudiante de las opciones al elegirlo, permite quitarlo y oculta las opciones al llegar al máximo', async () => {
    // Arrange
    mockMutacion();
    const user = userEvent.setup();
    render(<RegistrarFichaPerfil onCerrar={vi.fn()} />);

    // Act: elegir el primero
    await user.click(await screen.findByRole('button', { name: 'Carlos Ruiz' }));

    // Assert: sale de las opciones y aparece como chip con botón de quitar
    expect(screen.queryByRole('button', { name: 'Carlos Ruiz' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar a Carlos Ruiz' })).toBeInTheDocument();

    // Act: quitarlo
    await user.click(screen.getByRole('button', { name: 'Quitar a Carlos Ruiz' }));
    expect(await screen.findByRole('button', { name: 'Carlos Ruiz' })).toBeInTheDocument();

    // Act: elegir los tres
    await user.click(screen.getByRole('button', { name: 'Carlos Ruiz' }));
    await user.click(screen.getByRole('button', { name: 'Diana Soto' }));
    await user.click(screen.getByRole('button', { name: 'Elena Vargas' }));

    // Assert: sin opciones restantes y mensaje de máximo
    expect(screen.queryByRole('button', { name: 'Diana Soto' })).not.toBeInTheDocument();
    expect(screen.getByText('Máximo de estudiantes alcanzado.')).toBeInTheDocument();
  });

  it.each([
    {
      recurso: 'asesores',
      preparar: () => {
        mockAsesores({ data: undefined, isError: true });
      },
    },
    {
      recurso: 'estudiantes',
      preparar: () => {
        mockEstudiantes({ data: undefined, isError: true });
      },
    },
  ])(
    'muestra AvisoNoDisponible para $recurso y deja Registrar Ficha deshabilitado',
    async ({ recurso, preparar }) => {
      // Arrange
      preparar();
      mockMutacion();

      // Act
      render(<RegistrarFichaPerfil onCerrar={vi.fn()} />);

      // Assert
      expect(
        await screen.findByRole('note', { name: `No disponible: ${recurso}` }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Registrar Ficha' })).toBeDisabled();
    },
  );

  it.each([
    {
      recurso: 'asesores',
      textoCarga: 'Cargando asesores...',
      preparar: () => {
        mockAsesores({ data: undefined, isLoading: true });
      },
    },
    {
      recurso: 'estudiantes',
      textoCarga: 'Cargando estudiantes...',
      preparar: () => {
        mockEstudiantes({ data: undefined, isLoading: true });
      },
    },
  ])(
    'muestra el estado de carga de $recurso mientras el catálogo no resuelve',
    async ({ textoCarga, preparar }) => {
      // Arrange
      preparar();
      mockMutacion();

      // Act
      render(<RegistrarFichaPerfil onCerrar={vi.fn()} />);

      // Assert
      expect(await screen.findByRole('status')).toHaveTextContent(textoCarga);
    },
  );

  it('muestra que no hay más estudiantes disponibles cuando el catálogo llega vacío', async () => {
    // Arrange
    mockEstudiantes({ data: [] });
    mockMutacion();

    // Act
    render(<RegistrarFichaPerfil onCerrar={vi.fn()} />);

    // Assert
    expect(
      await screen.findByText('No hay más estudiantes disponibles para agregar.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar Ficha' })).toBeDisabled();
  });

  it('cancela sin enviar: llama a onCerrar y no llama a mutate', async () => {
    // Arrange
    const mutate = vi.fn();
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarFichaPerfil onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';
import { useGenerarRepositorioArtefacto } from '../../hooks/useGenerarRepositorioArtefacto';
import GenerarRepositorioPanel from './GenerarRepositorioPanel';

vi.mock('../../hooks/useGenerarRepositorioArtefacto', () => ({
  useGenerarRepositorioArtefacto: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useGenerarRepositorioArtefacto>;

const mutate = vi.fn();

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function mutarFallando(cuerpo: ApiError) {
  mutate.mockImplementation((_valores: unknown, opciones: OpcionesMutate) =>
    opciones.onError(crearErrorApi(cuerpo)),
  );
}

async function llenarYEnviar() {
  const user = userEvent.setup();
  const onCerrar = vi.fn();
  render(<GenerarRepositorioPanel onCerrar={onCerrar} />);
  await user.type(screen.getByLabelText('Nombre'), '  Repositorio Alfa  ');
  await user.type(screen.getByLabelText('Descripción'), 'Artefactos del semillero');
  await user.click(screen.getByRole('button', { name: 'Generar repositorio' }));
  return { user, onCerrar };
}

describe('GenerarRepositorioPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const base: Partial<Resultado> = { mutate, isPending: false, reset: vi.fn() };
    vi.mocked(useGenerarRepositorioArtefacto).mockReturnValue(base as Resultado);
  });

  it('con datos válidos envía los valores recortados, avisa el éxito y cierra', async () => {
    // Arrange
    mutate.mockImplementation((_valores: unknown, opciones: OpcionesMutate) =>
      opciones.onSuccess(),
    );

    // Act
    const { onCerrar } = await llenarYEnviar();

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(mutate).toHaveBeenCalledWith(
      { nombreRepositorio: 'Repositorio Alfa', descripcion: 'Artefactos del semillero' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Repositorio generado', expect.any(String));
  });

  it('con los campos vacíos no envía y muestra el resumen de errores', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<GenerarRepositorioPanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Generar repositorio' }));

    // Assert
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante un nombre duplicado avisa con toast, marca el campo y deja el panel abierto', async () => {
    // Arrange
    mutarFallando({
      error: 'Unprocessable Entity',
      errorCode: 'REPOSITORIO_ARTEFACTO_DUPLICADO',
      message: 'Duplicado en el backend',
      status: 422,
    });

    // Act
    const { onCerrar } = await llenarYEnviar();

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText('Ya existe un repositorio con este nombre.').length).toBeGreaterThan(
      0,
    );
    expect(screen.getByLabelText('Nombre')).toHaveValue('  Repositorio Alfa  ');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('pinta cada fieldError del backend bajo su campo', async () => {
    // Arrange
    mutarFallando({
      error: 'Bad Request',
      message: 'Datos inválidos',
      status: 400,
      fieldErrors: [
        { field: 'nombreRepositorio', message: 'Nombre rechazado por el servidor' },
        { field: 'descripcion', message: 'Descripción rechazada por el servidor' },
      ],
    });

    // Act
    await llenarYEnviar();

    // Assert
    expect((await screen.findAllByText('Nombre rechazado por el servidor')).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('Descripción rechazada por el servidor').length).toBeGreaterThan(0);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('con administrador no vigente solo avisa con toast, sin mensaje de campo', async () => {
    // Arrange
    mutarFallando({
      error: 'Unprocessable Entity',
      errorCode: 'ADMINISTRADOR_NO_VIGENTE',
      message: 'El administrador no está vigente.',
      status: 422,
    });

    // Act
    const { onCerrar } = await llenarYEnviar();

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo generar el repositorio',
        'El administrador no está vigente.',
      ),
    );
    expect(screen.queryByText('Ya existe un repositorio con este nombre.')).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con administrador no vigente y sin mensaje del backend usa el texto de respaldo', async () => {
    // Arrange
    mutarFallando({
      error: 'Unprocessable Entity',
      errorCode: 'ADMINISTRADOR_NO_VIGENTE',
      status: 422,
    } as ApiError);

    // Act
    await llenarYEnviar();

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo generar el repositorio',
        'Tu cuenta de administrador no está vigente.',
      ),
    );
  });

  it('cancelar sin cambios cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    render(<GenerarRepositorioPanel onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
  });
});

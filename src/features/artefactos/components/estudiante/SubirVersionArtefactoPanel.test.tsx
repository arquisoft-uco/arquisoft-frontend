import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';
import { useSubirVersionArtefacto } from '../../hooks/useSubirVersionArtefacto';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';
import SubirVersionArtefactoPanel from './SubirVersionArtefactoPanel';

vi.mock('../../hooks/useSubirVersionArtefacto', () => ({ useSubirVersionArtefacto: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

type ResultadoSubida = ReturnType<typeof useSubirVersionArtefacto>;

interface OpcionesMutate {
  onSuccess: (respuesta: { id: string; version: number }) => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const ARTEFACTO: ArtefactoEstudiante = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  asesor: 's-1',
  nombreAsesor: 'Ana Pérez',
};

function simularSubida(parcial: Partial<ResultadoSubida> = {}) {
  vi.mocked(useSubirVersionArtefacto).mockReturnValue({
    mutate,
    isPending: false,
    reset: vi.fn(),
    fase: null,
    porcentaje: 0,
    faseDelError: () => null,
    ...parcial,
  } as ResultadoSubida);
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

function markdown(nombre = 'acta.md') {
  return new File(['contenido'], nombre, { type: '' });
}

const CAMPO = { selector: 'input' };

describe('SubirVersionArtefactoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularSubida();
  });

  it('muestra el documento, el proyecto y la versión actual', () => {
    // Act
    render(<SubirVersionArtefactoPanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Versión actual: 2')).toBeInTheDocument();
    expect(screen.getByText('Acta de inicio · Sistema de riego')).toBeInTheDocument();
  });

  it('enviar sin archivo muestra el resumen de errores y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SubirVersionArtefactoPanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    expect((await screen.findAllByText(/archivo/i)).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con un archivo válido llama a la mutación y, en éxito, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const archivo = markdown();
    mutate.mockImplementation((_datos: unknown, opciones: OpcionesMutate) =>
      opciones.onSuccess({ id: 'v-9', version: 3 }),
    );
    const onCerrar = vi.fn();
    render(<SubirVersionArtefactoPanel artefacto={ARTEFACTO} onCerrar={onCerrar} />);

    // Act
    await user.upload(screen.getByLabelText('Archivo', CAMPO), archivo);
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(mutate).toHaveBeenCalledWith({ archivo }, expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      'Versión subida',
      expect.stringContaining('Versión 3'),
    );
  });

  it('un error de negocio muestra el aviso con el mensaje del servidor y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_datos: unknown, opciones: OpcionesMutate) =>
      opciones.onError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'REVISION_ASESOR_VERSION_ANTERIOR_NO_EN_PROGRESO',
          message: 'No puede subir una nueva versión: la revisión está pendiente.',
          status: 422,
        }),
      ),
    );
    render(<SubirVersionArtefactoPanel artefacto={ARTEFACTO} onCerrar={onCerrar} />);

    // Act
    await user.upload(screen.getByLabelText('Archivo', CAMPO), markdown());
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    expect(
      await screen.findByText('No puede subir una nueva versión: la revisión está pendiente.'),
    ).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('un error de archivo del servidor se pinta junto al campo', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_datos: unknown, opciones: OpcionesMutate) =>
      opciones.onError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'VERSION_ARTEFACTO_TIPO_ARCHIVO_NO_COINCIDE',
          message: 'El contenido no coincide con la extensión.',
          status: 422,
        }),
      ),
    );
    render(<SubirVersionArtefactoPanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);

    // Act
    await user.upload(screen.getByLabelText('Archivo', CAMPO), markdown());
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    expect(
      (await screen.findAllByText('El contenido no coincide con la extensión.')).length,
    ).toBeGreaterThan(0);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('mientras sube muestra el avance con el porcentaje', () => {
    // Arrange
    simularSubida({ isPending: true, fase: 'subiendo', porcentaje: 40 });

    // Act
    render(<SubirVersionArtefactoPanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Subiendo… 40 %')).toBeInTheDocument();
  });
});

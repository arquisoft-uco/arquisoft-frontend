import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import type { ApiError } from '../../../../shared/models/api-response';
import { useSubirVersionRepositorio } from '../../hooks/useSubirVersionRepositorio';
import { useVersionesRepositorioArtefacto } from '../../hooks/useVersionesRepositorioArtefacto';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import SubirVersionPanel from './SubirVersionPanel';

vi.mock('../../hooks/useSubirVersionRepositorio', () => ({ useSubirVersionRepositorio: vi.fn() }));
vi.mock('../../hooks/useVersionesRepositorioArtefacto', () => ({
  useVersionesRepositorioArtefacto: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

type ResultadoSubida = ReturnType<typeof useSubirVersionRepositorio>;
type ResultadoVersiones = ReturnType<typeof useVersionesRepositorioArtefacto>;

interface OpcionesMutate {
  onSuccess: (respuesta: { id: string; numeroVersion: number }) => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const VERSION: VersionRepositorioArtefacto = {
  id: 'v-1',
  nombreDocumento: 'Manual de usuario',
  numeroVersion: 2,
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'manual.pdf',
};

function simularSubida(parcial: Partial<ResultadoSubida> = {}) {
  vi.mocked(useSubirVersionRepositorio).mockReturnValue({
    mutate,
    isPending: false,
    reset: vi.fn(),
    fase: null,
    porcentaje: 0,
    faseDelError: () => null,
    ...parcial,
  } as ResultadoSubida);
}

function simularVersiones(versiones: VersionRepositorioArtefacto[], cargando = false) {
  vi.mocked(useVersionesRepositorioArtefacto).mockReturnValue({
    data: versiones,
    isLoading: cargando,
  } as ResultadoVersiones);
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

function pdf(nombre = 'Guía técnica.pdf') {
  return new File(['contenido'], nombre, { type: 'application/pdf' });
}

const OPCION_EXISTENTE = { name: 'Nueva versión de un documento existente' };

describe('SubirVersionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularSubida();
    simularVersiones([]);
  });

  it('al elegir un archivo sugiere el nombre y envía un documento nuevo', async () => {
    // Arrange
    const user = userEvent.setup();
    const archivo = pdf();
    mutate.mockImplementation((_datos: unknown, opciones: OpcionesMutate) =>
      opciones.onSuccess({ id: 'v-9', numeroVersion: 1 }),
    );
    const onCerrar = vi.fn();
    render(<SubirVersionPanel repositorioId="r-1" onCerrar={onCerrar} />);

    // Act
    await user.upload(screen.getByLabelText('Archivo', { selector: 'input' }), archivo);
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    expect(screen.getByLabelText('Documento', { selector: 'input' })).toHaveValue('Guía técnica');
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(mutate).toHaveBeenCalledWith(
      { archivo, nombreDocumento: 'Guía técnica', nuevoDocumento: true },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Versión subida',
      expect.stringContaining('Versión 1'),
    );
  });

  it('sin documentos deshabilita la opción de documento existente; con ellos la permite', () => {
    // Act
    const { unmount } = render(<SubirVersionPanel repositorioId="r-1" onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radio', OPCION_EXISTENTE)).toBeDisabled();
    expect(screen.getByText('Este repositorio aún no tiene documentos')).toBeInTheDocument();
    unmount();

    // Arrange
    simularVersiones([VERSION]);

    // Act
    render(<SubirVersionPanel repositorioId="r-1" onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('radio', OPCION_EXISTENTE)).toBeEnabled();
  });

  it('con un documento existente elegido envía nuevoDocumento en falso', async () => {
    // Arrange
    const user = userEvent.setup();
    const archivo = pdf('manual-v2.pdf');
    simularVersiones([VERSION]);
    render(<SubirVersionPanel repositorioId="r-1" onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('radio', OPCION_EXISTENTE));
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Manual de usuario' }));
    await user.upload(screen.getByLabelText('Archivo', { selector: 'input' }), archivo);
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(mutate).toHaveBeenCalledWith(
      { archivo, nombreDocumento: 'Manual de usuario', nuevoDocumento: false },
      expect.any(Object),
    );
  });

  it('una extensión no permitida muestra el error del campo y no envía', async () => {
    // Arrange
    const user = userEvent.setup({ applyAccept: false });
    render(<SubirVersionPanel repositorioId="r-1" onCerrar={vi.fn()} />);

    // Act
    await user.upload(screen.getByLabelText('Archivo', { selector: 'input' }), pdf('notas.txt'));
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    expect(
      (await screen.findAllByText('Formato no permitido. Usa PDF, DOCX, XLSX o PPTX')).length,
    ).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante DOCUMENTO_YA_EXISTE avisa con toast, marca el nombre y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_datos: unknown, opciones: OpcionesMutate) =>
      opciones.onError(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'DOCUMENTO_YA_EXISTE',
          message: 'Duplicado en el backend',
          status: 422,
        }),
      ),
    );
    render(<SubirVersionPanel repositorioId="r-1" onCerrar={onCerrar} />);

    // Act
    await user.upload(screen.getByLabelText('Archivo', { selector: 'input' }), pdf());
    await user.click(screen.getByRole('button', { name: 'Subir versión' }));

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(
      screen.getAllByText('Ya existe un documento con este nombre en el repositorio.').length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText('Documento', { selector: 'input' })).toHaveValue('Guía técnica');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('mientras sube muestra el avance con el porcentaje', () => {
    // Arrange
    simularSubida({ isPending: true, fase: 'subiendo', porcentaje: 40 });

    // Act
    render(<SubirVersionPanel repositorioId="r-1" onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Subiendo… 40 %')).toBeInTheDocument();
  });
});

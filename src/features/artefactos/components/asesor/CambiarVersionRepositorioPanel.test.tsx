import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { artefactosService } from '../../services/artefactosService';
import { useUltimaVersionArtefacto } from '../../hooks/useUltimaVersionArtefacto';
import { useVersionesElegiblesArtefacto } from '../../hooks/useVersionesElegiblesArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import type { VersionRepositorioAsesor } from '../../models/VersionRepositorioAsesor';
import {
  MENSAJE_OTRO_DOCUMENTO,
  VERSION_REPOSITORIO_OTRO_DOCUMENTO,
} from '../../utils/errores-cambio-version-repositorio';
import CambiarVersionRepositorioPanel from './CambiarVersionRepositorioPanel';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: { cambiarVersionRepositorioArtefacto: vi.fn() },
}));
vi.mock('../../hooks/useUltimaVersionArtefacto', () => ({ useUltimaVersionArtefacto: vi.fn() }));
vi.mock('../../hooks/useVersionesElegiblesArtefacto', () => ({
  useVersionesElegiblesArtefacto: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useUltimaMock = vi.mocked(useUltimaVersionArtefacto);
const useElegiblesMock = vi.mocked(useVersionesElegiblesArtefacto);
const cambiar = vi.mocked(artefactosService.cambiarVersionRepositorioArtefacto);

const ARTEFACTO: ArtefactoAsesor = {
  id: 'art-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'v-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 1,
  nombreRepositorio: 'Repo base',
  omitido: false,
};
const V3 = {
  id: 'v-3',
  numeroVersion: 3,
  nombreArchivo: 'acta-v3.pdf',
} as VersionRepositorioAsesor;

function mockUltima(estadoRevision: string | null | 'sin-versiones') {
  const ultimaVersion =
    estadoRevision === 'sin-versiones' ? null : ({ estadoRevision } as VersionArtefacto);
  useUltimaMock.mockReturnValue({
    ultimaVersion,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useUltimaVersionArtefacto>);
}

function mockElegibles(parcial: Record<string, unknown> = {}) {
  useElegiblesMock.mockReturnValue({
    versiones: [V3],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    hayMas: false,
    cargandoMas: false,
    cargarMas: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useVersionesElegiblesArtefacto>);
}

function error422(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'Del servidor', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function renderizar(onCerrar = vi.fn()) {
  render(<CambiarVersionRepositorioPanel artefacto={ARTEFACTO} onCerrar={onCerrar} />);
  return { onCerrar };
}

async function elegirV3(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('combobox', { name: 'Nueva versión' }));
  await user.click(await screen.findByRole('option', { name: /Versión 3/ }));
}

async function enviar(user: ReturnType<typeof userEvent.setup>) {
  await elegirV3(user);
  await user.click(screen.getByRole('button', { name: 'Cambiar versión' }));
  await user.click(screen.getByRole('button', { name: 'Sí, cambiar versión' }));
}

describe('CambiarVersionRepositorioPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUltima('PENDIENTE');
    mockElegibles();
    cambiar.mockResolvedValue(undefined);
  });

  it.each(['PENDIENTE', 'EN_PROGRESO', 'sin-versiones'])(
    'con estado %s ofrece el selector y avisa del correo al confirmar',
    async (estado) => {
      // Arrange
      const user = userEvent.setup();
      mockUltima(estado);
      renderizar();

      // Act
      await elegirV3(user);
      await user.click(screen.getByRole('button', { name: 'Cambiar versión' }));

      // Assert
      expect(screen.getByText(/Cada estudiante vinculado recibirá un correo/)).toBeInTheDocument();
    },
  );

  it.each([null, 'RESUELTA', 'CERRADA'])(
    'con revisión %s muestra el bloqueo, sin selector y con el envío deshabilitado',
    (estado) => {
      // Arrange
      mockUltima(estado);

      // Act
      renderizar();

      // Assert
      expect(screen.queryByRole('combobox', { name: 'Nueva versión' })).toBeNull();
      expect(screen.getByText(/no se puede cambiar|aún no tiene revisión/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cambiar versión' })).toBeDisabled();
    },
  );

  it('confirmar llama al service, muestra el toast de éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = renderizar();

    // Act
    await enviar(user);

    // Assert
    expect(cambiar).toHaveBeenCalledWith({
      artefactoId: 'art-1',
      versionRepositorioId: 'v-3',
    });
    expect(toast.success).toHaveBeenCalledWith('Versión actualizada', expect.any(String));
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });

  it('un 422 de campo muestra el mensaje bajo el selector y el toast, y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    cambiar.mockRejectedValue(error422(VERSION_REPOSITORIO_OTRO_DOCUMENTO));
    const { onCerrar } = renderizar();

    // Act
    await enviar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar la versión',
      MENSAJE_OTRO_DOCUMENTO,
    );
    expect(await screen.findByText(MENSAJE_OTRO_DOCUMENTO)).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('otro error solo muestra el toast con el mensaje del servidor', async () => {
    // Arrange
    const user = userEvent.setup();
    cambiar.mockRejectedValue(error422('ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO'));
    renderizar();

    // Act
    await enviar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar la versión', 'Del servidor');
    expect(screen.queryByText(MENSAJE_OTRO_DOCUMENTO)).toBeNull();
  });

  it('con el catálogo caído muestra el aviso y deshabilita el envío', () => {
    // Arrange
    mockElegibles({ versiones: [], isError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText(/Esta opción aún no está disponible/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar versión' })).toBeDisabled();
  });

  it('sin otras versiones muestra el estado vacío', () => {
    // Arrange
    mockElegibles({ versiones: [] });

    // Act
    renderizar();

    // Assert
    expect(
      screen.getByText('Este documento no tiene otras versiones en el repositorio.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar versión' })).toBeDisabled();
  });

  it('si falla la última versión muestra el error con reintento', () => {
    // Arrange
    useUltimaMock.mockReturnValue({
      ultimaVersion: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as ReturnType<typeof useUltimaVersionArtefacto>);

    // Act
    renderizar();

    // Assert
    const dialogo = within(screen.getByRole('dialog'));
    expect(dialogo.getByRole('alert')).toBeInTheDocument();
    expect(dialogo.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});

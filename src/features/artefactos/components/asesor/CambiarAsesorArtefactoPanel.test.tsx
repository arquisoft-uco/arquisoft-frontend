import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import { useAsesoresVigentes } from '../../../../shared/hooks/useAsesoresVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { ApiError } from '../../../../shared/models/api-response';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { artefactosService } from '../../services/artefactosService';
import CambiarAsesorArtefactoPanel from './CambiarAsesorArtefactoPanel';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: { cambiarAsesorArtefacto: vi.fn() },
}));
vi.mock('../../../../shared/hooks/useAsesoresVigentes', () => ({
  useAsesoresVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambiar = vi.mocked(artefactosService.cambiarAsesorArtefacto);
const useAsesoresMock = vi.mocked(useAsesoresVigentes);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const LUIS: Asesor = { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };
const ARTEFACTO: ArtefactoAsesor = {
  id: 'art-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

type ResultadoAsesores = ReturnType<typeof useAsesoresVigentes>;

function mockAsesores(parcial: Partial<ResultadoAsesores> = {}) {
  useAsesoresMock.mockReturnValue({
    data: [ANA, LUIS],
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoAsesores);
}

function error422(errorCode: string, message: string) {
  const cuerpo: ApiError = { error: 'Unprocessable Entity', errorCode, message, status: 422 };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: 422,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function renderizar(onCerrar = vi.fn()) {
  render(<CambiarAsesorArtefactoPanel artefacto={ARTEFACTO} onCerrar={onCerrar} />);
  return { onCerrar };
}

async function elegirALuis(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('combobox', { name: 'Nuevo asesor' }));
  await user.click(await screen.findByRole('option', { name: /Luis Gómez/ }));
}

async function confirmarCambio(user: ReturnType<typeof userEvent.setup>) {
  await elegirALuis(user);
  await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));
  await user.click(screen.getByRole('button', { name: 'Sí, cambiar' }));
}

describe('CambiarAsesorArtefactoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsesores();
    cambiar.mockResolvedValue(undefined);
  });

  it('muestra el artefacto y deja "Cambiar asesor" deshabilitado hasta elegir', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    const panel = within(screen.getByRole('dialog', { name: 'Cambiar asesor' }));

    // Assert
    expect(panel.getByText('Acta de inicio · Sistema de riego')).toBeInTheDocument();
    expect(panel.getByRole('button', { name: 'Cambiar asesor' })).toBeDisabled();

    // Act
    await elegirALuis(user);

    // Assert
    expect(panel.getByRole('button', { name: 'Cambiar asesor' })).toBeEnabled();
  });

  it('pide confirmación con el nombre y correo del nuevo asesor antes de enviar', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    await elegirALuis(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));

    // Assert
    const dialogo = screen.getByRole('dialog', { name: '¿Cambiar el asesor del artefacto?' });
    expect(dialogo).toHaveTextContent('Luis Gómez (luis@uco.edu.co)');
    expect(cambiar).not.toHaveBeenCalled();
  });

  it('al confirmar envía el cambio, notifica el éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = renderizar();

    // Act
    await confirmarCambio(user);

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(cambiar).toHaveBeenCalledWith({ artefactoId: 'art-1', asesorId: 'a-2' });
    expect(toast.success).toHaveBeenCalledWith('Asesor actualizado', expect.any(String));
  });

  it('con el 422 de proyecto no asignado pinta el mensaje en el campo, avisa con toast y mantiene el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    cambiar.mockRejectedValue(
      error422('ARTEFACTOS_ASESOR_PROYECTO_GRADO_NO_ASIGNADO', 'del backend'),
    );
    const { onCerrar } = renderizar();

    // Act
    await confirmarCambio(user);

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar el asesor',
      expect.stringContaining('no está asignado a este proyecto'),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('no está asignado a este proyecto');
    expect(
      screen.queryByRole('dialog', { name: '¿Cambiar el asesor del artefacto?' }),
    ).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
  });

  it('con otro error solo muestra el toast con el mensaje del servidor', async () => {
    // Arrange
    const user = userEvent.setup();
    cambiar.mockRejectedValue(
      error422('ARTEFACTOS_ASESOR_NO_VIGENTE', 'El asesor no está vigente'),
    );
    const { onCerrar } = renderizar();

    // Act
    await confirmarCambio(user);

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo cambiar el asesor',
        'El asesor no está vigente',
      ),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('si el catálogo de asesores falla muestra el aviso y deja el envío deshabilitado', () => {
    // Arrange
    mockAsesores({ data: undefined, isError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('note', { name: 'No disponible: asesores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar asesor' })).toBeDisabled();
  });
});

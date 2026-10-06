import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import CambiarAsesorPanel from './CambiarAsesorPanel';
import { fichasPerfilService } from '../../services/fichasPerfilService';
import { useAsesoresFichaVigentes } from '../../../../shared/hooks/useAsesoresFichaVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { ApiError } from '../../../../shared/models/api-response';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('../../services/fichasPerfilService', () => ({
  fichasPerfilService: { cambiarAsesor: vi.fn() },
}));
vi.mock('../../../../shared/hooks/useAsesoresFichaVigentes', () => ({
  useAsesoresFichaVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambiarAsesor = vi.mocked(fichasPerfilService.cambiarAsesor);
const useAsesoresMock = vi.mocked(useAsesoresFichaVigentes);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const LUIS: Asesor = { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };
const FICHA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: ANA,
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};

type ResultadoAsesores = ReturnType<typeof useAsesoresFichaVigentes>;

function mockAsesores(parcial: Partial<ResultadoAsesores> = {}) {
  useAsesoresMock.mockReturnValue({
    data: [ANA, LUIS],
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoAsesores);
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function renderizar(onCerrar = vi.fn()) {
  render(<CambiarAsesorPanel ficha={FICHA} onCerrar={onCerrar} />);
  return { onCerrar };
}

async function elegirALuis(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('combobox', { name: 'Nuevo asesor' }));
  await user.click(await screen.findByRole('option', { name: /Luis Gómez/ }));
}

describe('CambiarAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsesores();
    cambiarAsesor.mockResolvedValue(undefined);
  });

  it('abre con el título de la ficha, el asesor actual excluido y "Cambiar asesor" deshabilitado hasta elegir', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    const panel = within(screen.getByRole('dialog', { name: 'Cambiar asesor' }));
    await user.click(screen.getByRole('combobox', { name: 'Nuevo asesor' }));

    // Assert
    expect(panel.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(panel.getByText(/Asesor actual: Ana Pérez/)).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Ana Pérez/ })).not.toBeInTheDocument();
    expect(panel.getByRole('button', { name: 'Cambiar asesor' })).toBeDisabled();

    // Act
    await elegirALuis(user);

    // Assert
    expect(panel.getByRole('button', { name: 'Cambiar asesor' })).toBeEnabled();
  });

  it('pide confirmación con el nombre y el correo del nuevo asesor antes de cambiar', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    await elegirALuis(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));

    // Assert
    const dialogo = screen.getByRole('dialog', { name: '¿Cambiar asesor de la ficha?' });
    expect(dialogo).toHaveTextContent('Luis Gómez (luis@uco.edu.co)');
    expect(cambiarAsesor).not.toHaveBeenCalled();
  });

  it('al confirmar envía el cambio, notifica el éxito y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = renderizar();
    await elegirALuis(user);
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Sí, cambiar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(cambiarAsesor).toHaveBeenCalledWith({ idFicha: 'f-1', idAsesorFicha: 'a-2' });
    expect(toast.success).toHaveBeenCalledWith('Asesor actualizado', expect.any(String));
  });

  it('cancelar la confirmación no envía nada y conserva la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = renderizar();
    await elegirALuis(user);
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));

    // Act
    await user.click(
      within(screen.getByRole('dialog', { name: '¿Cambiar asesor de la ficha?' })).getByRole(
        'button',
        { name: 'Cancelar' },
      ),
    );

    // Assert
    expect(
      screen.queryByRole('dialog', { name: '¿Cambiar asesor de la ficha?' }),
    ).not.toBeInTheDocument();
    expect(cambiarAsesor).not.toHaveBeenCalled();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
  });

  it('si el backend rechaza el cambio muestra el error en un toast, cierra el diálogo y mantiene el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    cambiarAsesor.mockRejectedValue(
      crearErrorApi({
        error: 'Unprocessable Entity',
        errorCode: 'MISMO_ASESOR',
        message: 'El asesor ya está asignado',
        status: 422,
      }),
    );
    const { onCerrar } = renderizar();
    await elegirALuis(user);
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Sí, cambiar' }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo cambiar el asesor',
        'El asesor ya está asignado',
      ),
    );
    expect(
      screen.queryByRole('dialog', { name: '¿Cambiar asesor de la ficha?' }),
    ).not.toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
  });

  it('si el catálogo de asesores falla muestra el aviso y deja "Cambiar asesor" deshabilitado', () => {
    // Arrange
    mockAsesores({ data: undefined, isError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('note', { name: 'No disponible: asesores' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar asesor' })).toBeDisabled();
  });

  it('cerrar sin cambios cierra directo y con una selección pide descartar', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = renderizar();

    // Act: sin cambios
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);

    // Act: con selección
    await elegirALuis(user);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});

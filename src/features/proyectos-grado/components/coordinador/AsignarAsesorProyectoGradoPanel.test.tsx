import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useAsesoresVigentes } from '../../../../shared/hooks/useAsesoresVigentes';
import type { Asesor } from '../../../../shared/models/Asesor';
import { proyectosGradoService } from '../../services/proyectosGradoService';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import AsignarAsesorProyectoGradoPanel from './AsignarAsesorProyectoGradoPanel';

vi.mock('../../../../shared/hooks/useAsesoresVigentes', () => ({ useAsesoresVigentes: vi.fn() }));
vi.mock('../../services/proyectosGradoService', () => ({
  proyectosGradoService: { asignarAsesor: vi.fn() },
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useVigentes = vi.mocked(useAsesoresVigentes);
const asignarAsesor = vi.mocked(proyectosGradoService.asignarAsesor);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const LUIS: Asesor = { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };

const FILA: AsesorProyectoGrado = {
  id: 'ap-1',
  proyectoGradoId: 'p-1',
  asesorId: 'a-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  estado: { id: 'ASIGNADO', nombre: 'Asignado' },
  fechaAsignado: '2026-03-10T12:00:00Z',
  vigente: true,
  actual: true,
};

type Vigentes = ReturnType<typeof useAsesoresVigentes>;
function mockVigentes(parcial: Partial<Vigentes> = {}) {
  useVigentes.mockReturnValue({
    data: [ANA, LUIS],
    isLoading: false,
    isError: false,
    ...parcial,
  } as Vigentes);
}

function renderizar(
  props: { asesores?: AsesorProyectoGrado[]; finalizado?: boolean } = {},
  onCerrar = vi.fn(),
) {
  const resultado = render(
    <AsignarAsesorProyectoGradoPanel
      proyectoGradoId="p-1"
      titulo="Sistema de monitoreo"
      asesores={props.asesores ?? []}
      finalizado={props.finalizado ?? false}
      onCerrar={onCerrar}
    />,
  );
  return { onCerrar, ...resultado };
}

async function elegirALuis(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('combobox', { name: 'Asesor' }));
  await user.click(await screen.findByRole('option', { name: /Luis Gómez/ }));
}

function error422(errorCode: string) {
  return new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable', errorCode, message: 'x', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('AsignarAsesorProyectoGradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVigentes();
    asignarAsesor.mockResolvedValue(undefined);
  });

  it('lista los asesores, deshabilita el envío sin selección y envía el id elegido', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    const panel = within(screen.getByRole('dialog', { name: 'Asignar asesor' }));
    expect(panel.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(panel.getByRole('button', { name: 'Asignar asesor' })).toBeDisabled();

    // Act
    await elegirALuis(user);
    await user.click(panel.getByRole('button', { name: 'Asignar asesor' }));

    // Assert
    await waitFor(() =>
      expect(asignarAsesor).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', asesorId: 'a-2' }),
    );
  });

  it('en éxito notifica y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onCerrar } = renderizar();

    // Act
    await elegirALuis(user);
    await user.click(screen.getByRole('button', { name: 'Asignar asesor' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith('Asesor asignado', expect.any(String));
  });

  it('en error 422 muestra el texto propio, no cierra y conserva la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    asignarAsesor.mockRejectedValue(error422('ASESOR_PROYECTO_GRADO_ASESOR_NO_VIGENTE'));
    const { onCerrar } = renderizar();

    // Act
    await elegirALuis(user);
    await user.click(screen.getByRole('button', { name: 'Asignar asesor' }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo asignar al asesor',
        'El asesor seleccionado ya no está vigente. Elige otro.',
      ),
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
  });

  it('con un asesor asignado muestra el aviso de cupo y no ofrece selector', () => {
    // Act
    renderizar({ asesores: [FILA] });

    // Assert
    expect(screen.getByText(/ya tiene un asesor asignado/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con solo asesores finalizados sí ofrece el selector', () => {
    // Act
    renderizar({ asesores: [{ ...FILA, estado: { id: 'FINALIZADO', nombre: 'Finalizado' } }] });

    // Assert
    expect(screen.getByRole('combobox', { name: 'Asesor' })).toBeInTheDocument();
  });

  it('con el proyecto finalizado muestra el aviso y no ofrece selector', () => {
    // Act
    renderizar({ finalizado: true });

    // Assert
    expect(screen.getByText(/está finalizado y no admite nuevos asesores/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('muestra la carga del catálogo y, si falla, el aviso de no disponible', () => {
    // Arrange
    mockVigentes({ data: undefined, isLoading: true });

    // Act
    const { unmount } = renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    unmount();

    // Arrange
    mockVigentes({ data: undefined, isError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar asesor' })).toBeDisabled();
  });
});

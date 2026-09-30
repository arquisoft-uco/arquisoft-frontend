import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../../test-utils/render';
import CambiarAsesorForm from './CambiarAsesorForm';
import { fichasPerfilService } from '../../services/fichasPerfilService';
import { useAsesoresFichaVigentes } from '../../../../shared/hooks/useAsesoresFichaVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { ApiError } from '../../../../shared/models/api-response';

vi.mock('../../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    cambiarAsesor: vi.fn(),
  },
}));
vi.mock('../../../../shared/hooks/useAsesoresFichaVigentes', () => ({
  useAsesoresFichaVigentes: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambiarAsesor = vi.mocked(fichasPerfilService.cambiarAsesor);
const useAsesoresFichaVigentesMock = vi.mocked(useAsesoresFichaVigentes);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const LUIS: Asesor = { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };
const MARTA: Asesor = { id: 'a-3', nombre: 'Marta Ríos', email: 'marta@uco.edu.co' };

type ResultadoAsesores = ReturnType<typeof useAsesoresFichaVigentes>;

function mockAsesores(parcial: Partial<ResultadoAsesores>) {
  useAsesoresFichaVigentesMock.mockReturnValue({
    data: [ANA, LUIS, MARTA],
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

function renderFormulario(onExito = vi.fn()) {
  render(<CambiarAsesorForm idFichaPerfil="f-1" idAsesorActual={ANA.id} onExito={onExito} />);
  return { onExito };
}

async function abrirConfirmacionCon(nombreOpcion: string) {
  const user = userEvent.setup();
  const opcion = await screen.findByRole('option', { name: nombreOpcion });
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Seleccionar nuevo asesor' }),
    opcion,
  );
  await user.click(screen.getByRole('button', { name: 'Guardar' }));
  return user;
}

describe('CambiarAsesorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsesores({});
    cambiarAsesor.mockResolvedValue(undefined);
  });

  it('lista a los asesores excepto el actual y habilita Guardar solo tras elegir uno', async () => {
    const user = userEvent.setup();
    renderFormulario();

    const select = await screen.findByRole('combobox', { name: 'Seleccionar nuevo asesor' });
    await screen.findByRole('option', { name: 'Luis Gómez — luis@uco.edu.co' });

    expect(screen.getByRole('option', { name: 'Marta Ríos — marta@uco.edu.co' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Ana Pérez/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();

    await user.selectOptions(select, screen.getByRole('option', { name: /Luis Gómez/ }));

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled();
  });

  it('pide confirmación con el nombre y correo del nuevo asesor y, al confirmar, cambia el asesor, notifica, limpia la selección y llama a onExito', async () => {
    const { onExito } = renderFormulario();
    const user = await abrirConfirmacionCon('Luis Gómez — luis@uco.edu.co');

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('Luis Gómez (luis@uco.edu.co)');
    expect(cambiarAsesor).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Sí, cambiar' }));

    await waitFor(() => expect(onExito).toHaveBeenCalledTimes(1));
    expect(cambiarAsesor).toHaveBeenCalledWith({ idFicha: 'f-1', idAsesorFicha: 'a-2' });
    expect(toast.success).toHaveBeenCalledWith('Asesor actualizado', expect.any(String));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Seleccionar nuevo asesor' })).toHaveValue('');
  });

  it('no envía el cambio ni llama a onExito cuando se cancela la confirmación', async () => {
    const { onExito } = renderFormulario();
    const user = await abrirConfirmacionCon('Luis Gómez — luis@uco.edu.co');

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(cambiarAsesor).not.toHaveBeenCalled();
    expect(onExito).not.toHaveBeenCalled();
  });

  it('muestra el error del backend en un toast, cierra el diálogo y conserva la selección cuando el cambio falla', async () => {
    cambiarAsesor.mockRejectedValue(
      crearErrorApi({
        error: 'Unprocessable Entity',
        errorCode: 'MISMO_ASESOR',
        message: 'El nuevo asesor debe ser distinto al actual.',
        status: 422,
      }),
    );
    const { onExito } = renderFormulario();
    const user = await abrirConfirmacionCon('Luis Gómez — luis@uco.edu.co');

    await user.click(screen.getByRole('button', { name: 'Sí, cambiar' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Error al cambiar asesor',
        'El nuevo asesor debe ser distinto al actual.',
      ),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onExito).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Seleccionar nuevo asesor' })).toHaveValue('a-2');
  });

  it('muestra el aviso de catálogo no disponible y no ofrece select ni envío cuando el catálogo falla', async () => {
    mockAsesores({ data: undefined, isError: true });
    renderFormulario();

    expect(await screen.findByRole('alert')).toHaveTextContent(/catálogo de asesores/i);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
  });

  it('deshabilita el select y Guardar cuando el único asesor del catálogo es el actual', async () => {
    mockAsesores({ data: [ANA] });
    renderFormulario();

    expect(
      await screen.findByRole('option', { name: '-- Seleccionar nuevo asesor --' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Seleccionar nuevo asesor' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('muestra el estado de carga del catálogo de asesores y mantiene Guardar deshabilitado', async () => {
    mockAsesores({ data: undefined, isLoading: true });
    renderFormulario();

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando asesores');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });
});

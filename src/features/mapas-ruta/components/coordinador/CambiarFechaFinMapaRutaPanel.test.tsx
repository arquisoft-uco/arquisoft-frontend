import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { resetAllStores } from '../../../../test-utils/store.utils';
import CambiarFechaFinMapaRutaPanel from './CambiarFechaFinMapaRutaPanel';
import { mapasRutaService } from '../../services/mapasRutaService';
import { toast } from '../../../../shared/hooks/useToast';
import type { MapaRuta } from '../../models/MapaRuta';

vi.mock('../../services/mapasRutaService', () => ({
  mapasRutaService: { cambiarFechaFin: vi.fn() },
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const cambiarFechaFin = vi.mocked(mapasRutaService.cambiarFechaFin);

const MAPA: MapaRuta = {
  id: 'm-1',
  proyectoGradoId: 'p-1',
  titulo: 'Sistema A',
  fechaInicio: '2026-03-05',
  fechaFin: '2026-08-01',
};

function crearErrorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function cambiarFecha(valor: string) {
  const campo = screen.getByLabelText(/Fecha de fin/);
  await userEvent.clear(campo);
  await userEvent.type(campo, valor);
}

const GUARDAR = { name: 'Guardar cambios' };

describe('CambiarFechaFinMapaRutaPanel', () => {
  const onCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    cambiarFechaFin.mockResolvedValue(undefined);
  });

  function abrir() {
    render(<CambiarFechaFinMapaRutaPanel mapa={MAPA} onCerrar={onCerrar} />);
  }

  it('abre con la fecha actual y "Guardar cambios" deshabilitado', () => {
    // Arrange / Act
    abrir();

    // Assert
    expect(screen.getByLabelText(/Fecha de fin/)).toHaveValue('2026-08-01');
    expect(screen.getByRole('button', GUARDAR)).toBeDisabled();
  });

  it('con fecha igual o anterior al inicio muestra el error y no envía', async () => {
    // Arrange
    abrir();

    // Act
    await cambiarFecha('2026-03-05');
    await userEvent.click(screen.getByRole('button', GUARDAR));

    // Assert
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
    expect(cambiarFechaFin).not.toHaveBeenCalled();
  });

  it('con fecha válida envía id y fechaFin, avisa y cierra', async () => {
    // Arrange
    abrir();

    // Act
    await cambiarFecha('2026-09-15');
    await userEvent.click(screen.getByRole('button', GUARDAR));

    // Assert
    await vi.waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(cambiarFechaFin.mock.calls[0]).toEqual(['m-1', { fechaFin: '2026-09-15' }]);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('ante un 422 de propietario avisa, pinta el mensaje en el campo y deja el panel abierto', async () => {
    // Arrange
    cambiarFechaFin.mockRejectedValue(crearErrorApi('PROYECTO_GRADO_NO_PROPIETARIO'));
    abrir();

    // Act
    await cambiarFecha('2026-09-15');
    await userEvent.click(screen.getByRole('button', GUARDAR));

    // Assert
    expect(await screen.findAllByText(/Solo el coordinador asignado/)).not.toHaveLength(0);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Fecha de fin/)).toHaveValue('2026-09-15');
  });

  it('si el mapa ya no existe avisa y cierra el panel', async () => {
    // Arrange
    cambiarFechaFin.mockRejectedValue(crearErrorApi('MAPA_RUTA_NO_ENCONTRADO'));
    abrir();

    // Act
    await cambiarFecha('2026-09-15');
    await userEvent.click(screen.getByRole('button', GUARDAR));

    // Assert
    await vi.waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});

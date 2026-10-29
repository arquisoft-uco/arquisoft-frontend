import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useGenerarEntregable } from '../../hooks/useGenerarEntregable';
import { useProyectosAsesor } from '../../hooks/useProyectosAsesor';
import type { ProyectoGradoAsesor } from '../../models/ProyectoGradoAsesor';
import GenerarEntregablePanel from './GenerarEntregablePanel';

vi.mock('../../hooks/useProyectosAsesor', () => ({ useProyectosAsesor: vi.fn() }));
vi.mock('../../hooks/useGenerarEntregable', () => ({ useGenerarEntregable: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const proyectosMock = vi.mocked(useProyectosAsesor);
const generarMock = vi.mocked(useGenerarEntregable);
const mutate = vi.fn();
const refetch = vi.fn();

interface EstadoCatalogo {
  data?: ProyectoGradoAsesor[];
  isLoading?: boolean;
  isError?: boolean;
}

function proyectos({ data, isLoading = false, isError = false }: EstadoCatalogo) {
  const resultado = { data, isLoading, isError, refetch };
  proyectosMock.mockReturnValue(resultado as never);
}

const PROYECTO = {
  id: 'p-1',
  tituloProyecto: 'Sistema de riego',
  estado: { id: 'FINALIZADO', nombre: 'Finalizado' },
};

const botonGenerar = () => screen.getByRole('button', { name: 'Generar entregable' });

describe('GenerarEntregablePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mutacion = { mutate, isPending: false };
    generarMock.mockReturnValue(mutacion as never);
  });

  it('muestra el estado de carga con el envío deshabilitado', () => {
    // Arrange
    proyectos({ isLoading: true });

    // Act
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(botonGenerar()).toBeDisabled();
  });

  it('muestra el vacío cuando el asesor no tiene proyectos', () => {
    // Arrange
    proyectos({ data: [] });

    // Act
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no tienes proyectos de grado')).toBeInTheDocument();
    expect(botonGenerar()).toBeDisabled();
  });

  it('muestra el error del catálogo y reintenta', async () => {
    // Arrange
    const user = userEvent.setup();
    proyectos({ isError: true });
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it('elegir un proyecto habilita el envío, lo genera y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    proyectos({ data: [PROYECTO] });
    mutate.mockImplementation((_id, opciones) => opciones.onSuccess());
    render(<GenerarEntregablePanel onCerrar={onCerrar} />);
    expect(botonGenerar()).toBeDisabled();

    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Sistema de riego/ }));
    await user.click(botonGenerar());

    // Assert
    expect(mutate).toHaveBeenCalledWith('p-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Entregable generado', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('ante un error de envío avisa con el mensaje del backend y no cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    proyectos({ data: [PROYECTO] });
    mutate.mockImplementation((_id, opciones) =>
      opciones.onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Asesor no vigente' } },
      }),
    );
    render(<GenerarEntregablePanel onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Sistema de riego/ }));
    await user.click(botonGenerar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo generar el entregable',
      expect.any(String),
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(botonGenerar()).toBeEnabled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useGenerarEntregable } from '../../hooks/useGenerarEntregable';
import { useProyectosGenerables } from '../../hooks/useProyectosGenerables';
import { useVistaPreviaPaquete } from '../../hooks/useVistaPreviaPaquete';
import { errorApi } from '../../../../test-utils/errores-api';
import type { ProyectoGradoAsesor } from '../../models/ProyectoGradoAsesor';
import GenerarEntregablePanel from './GenerarEntregablePanel';

vi.mock('../../hooks/useProyectosGenerables', () => ({ useProyectosGenerables: vi.fn() }));
vi.mock('../../hooks/useVistaPreviaPaquete', () => ({ useVistaPreviaPaquete: vi.fn() }));
vi.mock('../../hooks/useGenerarEntregable', () => ({ useGenerarEntregable: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const proyectosMock = vi.mocked(useProyectosGenerables);
const vistaPreviaMock = vi.mocked(useVistaPreviaPaquete);
const generarMock = vi.mocked(useGenerarEntregable);
const mutate = vi.fn();
const refetch = vi.fn();

interface EstadoCatalogo {
  data?: ProyectoGradoAsesor[];
  totalEnCurso?: number;
  isLoading?: boolean;
  isError?: boolean;
}

function proyectos({
  data = [],
  totalEnCurso,
  isLoading = false,
  isError = false,
}: EstadoCatalogo) {
  proyectosMock.mockReturnValue({
    proyectos: data,
    totalEnCurso: totalEnCurso ?? data.length,
    isLoading,
    isError,
    refetch,
  });
}

function vistaPrevia(cantidad: number, isFetching = false) {
  vistaPreviaMock.mockReturnValue({
    isSuccess: true,
    isLoading: false,
    isFetching,
    isError: false,
    data: {
      cantidad,
      artefactos: Array.from({ length: cantidad }, (_, i) => ({
        artefacto: `a-${i}`,
        documento: `Documento ${i}`,
        numeroVersion: i + 1,
      })),
    },
  } as never);
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
    vistaPrevia(2);
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
    expect(screen.getByText('Aún no tienes proyectos en curso')).toBeInTheDocument();
    expect(botonGenerar()).toBeDisabled();
  });

  it('muestra un vacío propio cuando todos los proyectos ya tienen entregable vigente', () => {
    // Arrange
    proyectos({ data: [], totalEnCurso: 2 });

    // Act
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);

    // Assert
    expect(
      screen.getByText('Tus proyectos en curso ya tienen un entregable vigente'),
    ).toBeInTheDocument();
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
    expect(toast.success).toHaveBeenCalledWith(
      'Entregable generado',
      expect.stringContaining('Nuevo'),
    );
    expect(onCerrar).toHaveBeenCalled();
  });

  it('al elegir el proyecto lista los artefactos del paquete con su versión y la cantidad', async () => {
    // Arrange
    const user = userEvent.setup();
    proyectos({ data: [PROYECTO] });
    vistaPrevia(2);
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);
    expect(screen.queryByRole('list', { name: 'Documentos del paquete' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Sistema de riego/ }));

    // Assert
    expect(vistaPreviaMock).toHaveBeenLastCalledWith('p-1');
    expect(screen.getByText('Contenido del paquete · 2 documentos')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Documentos del paquete' })).toBeInTheDocument();
    expect(screen.getByText('Documento 0')).toBeInTheDocument();
    expect(screen.getByText('Versión 1')).toBeInTheDocument();
    expect(screen.getByText('Documento 1')).toBeInTheDocument();
    expect(screen.getByText('Versión 2')).toBeInTheDocument();
    expect(botonGenerar()).toBeEnabled();
  });

  it('con la vista previa vacía deshabilita Generar y muestra el motivo', async () => {
    // Arrange
    const user = userEvent.setup();
    proyectos({ data: [PROYECTO] });
    vistaPrevia(0);
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Sistema de riego/ }));

    // Assert
    expect(botonGenerar()).toBeDisabled();
    expect(
      screen.getAllByText('No hay artefactos con revisión cerrada para empaquetar').length,
    ).toBeGreaterThan(0);
  });

  it('ante un error de envío avisa con el mensaje del backend y no cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    proyectos({ data: [PROYECTO] });
    mutate.mockImplementation((_id, opciones) =>
      opciones.onError(
        errorApi(422, { errorCode: 'ENTREGABLES_ASESOR_PROYECTO_GRADO_NO_ASIGNADO' }),
      ),
    );
    render(<GenerarEntregablePanel onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Sistema de riego/ }));
    await user.click(botonGenerar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo generar el entregable',
      'Ya no eres el asesor vigente de este proyecto.',
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(botonGenerar()).toBeEnabled();
  });

  it('mantiene Generar deshabilitado mientras la vista previa se refresca', async () => {
    // Arrange
    const user = userEvent.setup();
    proyectos({ data: [PROYECTO] });
    vistaPrevia(2, true);
    render(<GenerarEntregablePanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Sistema de riego/ }));

    // Assert
    expect(botonGenerar()).toBeDisabled();
    expect(screen.getByText('Cargando la vista previa…')).toBeInTheDocument();
  });
});

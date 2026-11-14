import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { useCambiarEstadoEntregable } from '../../hooks/useCambiarEstadoEntregable';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import CambiarEstadoEntregablePanel from './CambiarEstadoEntregablePanel';

vi.mock('../../hooks/useEstadosEntregable', () => ({ useEstadosEntregable: vi.fn() }));
vi.mock('../../hooks/useCambiarEstadoEntregable', () => ({ useCambiarEstadoEntregable: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const estadosMock = vi.mocked(useEstadosEntregable);
const cambiarMock = vi.mocked(useCambiarEstadoEntregable);
const mutate = vi.fn();
const refetch = vi.fn();

const CATALOGO = [
  { id: 'DISPONIBLE_EVALUACION', nombre: 'Disponible para evaluación', descripcion: 'Se habilita' },
  { id: 'CANCELADO', nombre: 'Cancelado', descripcion: 'Se cancela' },
  { id: 'CERRADO', nombre: 'Cerrado', descripcion: 'Se cierra' },
];

function entregable(estadoId: string, nombre: string): EntregableProyectoGrado {
  return {
    id: 'e-1',
    versionEntregable: 3,
    proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
    asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
    proyectoFinalizado: false,
    proyectoCancelado: false,
    estadoEntregable: { id: estadoId, nombre },
  };
}

function catalogo(parcial: { data?: typeof CATALOGO; isLoading?: boolean; isError?: boolean }) {
  estadosMock.mockReturnValue({
    data: parcial.data,
    isLoading: parcial.isLoading ?? false,
    isError: parcial.isError ?? false,
    refetch,
  } as never);
}

const botonEnviar = () => screen.getByRole('button', { name: 'Cambiar estado' });

describe('CambiarEstadoEntregablePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cambiarMock.mockReturnValue({ mutate, isPending: false } as never);
  });

  it('muestra el entregable con Cerrado habilitado y Cancelado bloqueado', () => {
    // Arrange
    catalogo({ data: CATALOGO });

    // Act
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('APROBADO', 'Aprobado')}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Sistema de riego')).toBeInTheDocument();
    expect(screen.getByText('Versión 3')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Cancelado' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Cerrado' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Disponible para evaluación' })).toBeDisabled();
  });

  it('deshabilita Cerrado y deja Cancelado y Habilitar cuando el entregable es nuevo', () => {
    // Arrange
    catalogo({ data: CATALOGO });

    // Act
    render(
      <CambiarEstadoEntregablePanel entregable={entregable('NUEVO', 'Nuevo')} onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByRole('radio', { name: 'Cerrado' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Cancelado' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Disponible para evaluación' })).toBeEnabled();
  });

  it('desde disponible para evaluación o en evaluación ninguna opción es seleccionable', () => {
    // Arrange
    catalogo({ data: CATALOGO });
    const origenes = [
      ['DISPONIBLE_EVALUACION', 'Disponible para evaluación'],
      ['EN_EVALUACION', 'En evaluación'],
    ];

    for (const [id, nombre] of origenes) {
      // Act
      const { unmount } = render(
        <CambiarEstadoEntregablePanel entregable={entregable(id, nombre)} onCerrar={vi.fn()} />,
      );

      // Assert
      for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
      unmount();
    }
  });

  it('preselecciona el destino inicial cuando está permitido', () => {
    // Arrange
    catalogo({ data: CATALOGO });

    // Act
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('NUEVO', 'Nuevo')}
        destinoInicial="DISPONIBLE_EVALUACION"
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('radio', { name: 'Disponible para evaluación' })).toBeChecked();
  });

  it('habilita Cerrado y Cancelado cuando el entregable está rechazado', () => {
    // Arrange
    catalogo({ data: CATALOGO });

    // Act
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('RECHAZADO', 'Rechazado')}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('radio', { name: 'Cerrado' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Cancelado' })).toBeEnabled();
  });

  it('muestra el estado de carga con el envío deshabilitado', () => {
    // Arrange
    catalogo({ isLoading: true });

    // Act
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('APROBADO', 'Aprobado')}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(botonEnviar()).toBeDisabled();
  });

  it('muestra el error del catálogo, reintenta y mantiene el envío deshabilitado', async () => {
    // Arrange
    const user = userEvent.setup();
    catalogo({ isError: true });
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('APROBADO', 'Aprobado')}
        onCerrar={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(botonEnviar()).toBeDisabled();
  });

  it('al elegir un destino y enviar llama a mutate y, en éxito, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    catalogo({ data: CATALOGO });
    mutate.mockImplementation((_v, opciones) => opciones.onSuccess());
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('APROBADO', 'Aprobado')}
        onCerrar={onCerrar}
      />,
    );
    expect(botonEnviar()).toBeDisabled();

    // Act
    await user.click(screen.getByRole('radio', { name: 'Cerrado' }));
    await user.click(botonEnviar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { entregableId: 'e-1', estadoEntregableId: 'CERRADO' },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Estado actualizado',
      'El entregable pasó a Cerrado.',
    );
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('en error de envío muestra el mensaje del backend, no cierra y conserva la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    catalogo({ data: CATALOGO });
    mutate.mockImplementation((_v, opciones) => opciones.onError(new Error('fallo')));
    render(
      <CambiarEstadoEntregablePanel
        entregable={entregable('APROBADO', 'Aprobado')}
        onCerrar={onCerrar}
      />,
    );

    // Act
    await user.click(screen.getByRole('radio', { name: 'Cerrado' }));
    await user.click(botonEnviar());

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar el estado', expect.any(String));
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Cerrado' })).toBeChecked();
  });
});

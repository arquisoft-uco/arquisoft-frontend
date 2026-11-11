import type { ComponentProps } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { render, screen } from '../../../test-utils/render';
import HistorialEstadosProyectoVista from './HistorialEstadosProyectoVista';

type Consulta = ComponentProps<typeof HistorialEstadosProyectoVista>['consulta'];

function consultaCon(parcial: Partial<Record<keyof Consulta, unknown>>) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Consulta;
}

describe('HistorialEstadosProyectoVista', () => {
  it('cargando muestra el esqueleto', () => {
    // Act
    render(<HistorialEstadosProyectoVista consulta={consultaCon({ isLoading: true })} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin estados muestra el vacío', () => {
    // Act
    render(<HistorialEstadosProyectoVista consulta={consultaCon({ data: [] })} />);

    // Assert
    expect(screen.getByText('Este proyecto aún no tiene estados registrados')).toBeInTheDocument();
  });

  it('con error muestra el message del backend y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    const respuesta = {
      status: 422,
      data: { message: 'No está vinculado como asesor ni como coordinador del proyecto' },
    } as AxiosResponse;
    const error = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, respuesta);
    render(
      <HistorialEstadosProyectoVista consulta={consultaCon({ isError: true, error, refetch })} />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/No está vinculado como asesor/)).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('con datos muestra los estados del backend y un solo Actual', () => {
    // Arrange
    const data = [
      {
        id: 'h-2',
        estado: { id: 'EN_CURSO', nombre: 'En curso' },
        fechaActualizacion: '2026-03-02T10:00:00Z',
        motivo: null,
      },
      {
        id: 'h-1',
        estado: { id: 'INICIADO', nombre: 'Iniciado' },
        fechaActualizacion: '2026-03-01T10:00:00Z',
        motivo: null,
      },
    ];

    // Act
    render(<HistorialEstadosProyectoVista consulta={consultaCon({ data })} />);

    // Assert
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('Iniciado')).toBeInTheDocument();
    expect(screen.getAllByText('Actual')).toHaveLength(1);
    expect(screen.queryByText(/Motivo/)).not.toBeInTheDocument();
  });

  it('un paso cancelado muestra el motivo junto al estado', () => {
    // Arrange
    const data = [
      {
        id: 'h-3',
        estado: { id: 'CANCELADO', nombre: 'Cancelado' },
        fechaActualizacion: '2026-03-03T10:00:00Z',
        motivo: 'El estudiante se retiró',
      },
    ];

    // Act
    render(<HistorialEstadosProyectoVista consulta={consultaCon({ data })} />);

    // Assert
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
    expect(screen.getByText('El estudiante se retiró')).toBeInTheDocument();
  });
});

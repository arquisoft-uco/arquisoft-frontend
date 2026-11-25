import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEvaluacionAsesor from './ConsultarEvaluacionAsesor';
import type { ConsultaEvaluacionAsesor } from './ConsultarEvaluacionAsesor';
import {
  EVALUACION_ASESOR_SIN_EVALUACION_ASESOR,
  EVALUACION_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';

function crearError(status: number, errorCode?: string, message = 'Falla del servidor') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, errorCode, message },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function montar(parcial: Partial<ConsultaEvaluacionAsesor> = {}) {
  const refetch = vi.fn();
  const onVolver = vi.fn();
  render(
    <ConsultarEvaluacionAsesor
      consulta={{
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch,
        ...parcial,
      }}
      onVolver={onVolver}
    />,
  );
  return { refetch, onVolver };
}

describe('ConsultarEvaluacionAsesor', () => {
  it('con datos muestra el nombre y el correo del asesor', () => {
    // Act
    montar({
      data: {
        id: 'ea-1',
        asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
        notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
      },
    });

    // Assert
    expect(screen.getByRole('list', { name: 'Asesor de la evaluación' })).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
  });

  it('muestra las tres notas del asesor y «—» cuando no se calcularon', () => {
    // Act
    montar({
      data: {
        id: 'ea-1',
        asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
        notas: { resumenCualitativo: 3.5, resumenCuantitativo: null, notaAcumulada: 4 },
      },
    });

    // Assert
    expect(screen.getByText('Notas del asesor')).toBeInTheDocument();
    expect(screen.getByText('Resumen cualitativo').parentElement).toHaveTextContent('3,50');
    expect(screen.getByText('Resumen cuantitativo').parentElement).toHaveTextContent('—');
    expect(screen.getByText('Nota acumulada').parentElement).toHaveTextContent('4,00');
  });

  it('mientras carga expone un estado accesible', () => {
    // Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin evaluación del asesor muestra el vacío, no un error, y "Volver" invoca onVolver', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onVolver } = montar({
      isError: true,
      error: crearError(422, EVALUACION_ASESOR_SIN_EVALUACION_ASESOR),
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a evaluaciones' }));

    // Assert
    expect(
      screen.getByText('Esta evaluación aún no tiene evaluación del asesor'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it('con evaluación inexistente muestra el error sin ofrecer "Reintentar"', () => {
    // Act
    montar({ isError: true, error: crearError(422, EVALUACION_NO_ENCONTRADA) });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Esta evaluación no está disponible');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a evaluaciones' })).toBeInTheDocument();
  });

  it('con un error genérico muestra el mensaje del servidor y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const { refetch } = montar({
      isError: true,
      error: crearError(503, 'EVALUACION_ASESOR_NO_DISPONIBLE', 'Servicio no disponible'),
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Servicio no disponible');
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

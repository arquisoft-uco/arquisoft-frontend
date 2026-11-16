import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ConsultarInformacionEvaluacionAsesor from './ConsultarInformacionEvaluacionAsesor';
import type { ConsultaEvaluacionAsesorRealizada } from './ConsultarInformacionEvaluacionAsesor';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
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

function montar(parcial: Partial<ConsultaEvaluacionAsesorRealizada> = {}) {
  const refetch = vi.fn();
  const onVolver = vi.fn();
  render(
    <ConsultarInformacionEvaluacionAsesor
      consulta={{
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        refetch,
        ...parcial,
      }}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={onVolver}
    />,
  );
  return { refetch, onVolver };
}

describe('ConsultarInformacionEvaluacionAsesor', () => {
  it('con datos muestra proyecto, versión, estado y el asesor con su correo', () => {
    // Act
    montar({
      data: {
        id: 'ea-1',
        evaluacion: {
          id: 'ev-1',
          entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
          estado: { id: 'e-1', nombre: 'En curso' },
        },
        asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
      },
    });

    // Assert
    expect(screen.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Asesor de la evaluación' })).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
  });

  it('mientras carga expone un estado accesible', () => {
    // Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con evaluación inexistente muestra su mensaje sin ofrecer "Reintentar"', () => {
    // Act
    montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Esta evaluación no está disponible');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('con una evaluación de otro asesor muestra su mensaje sin ofrecer "Reintentar"', () => {
    // Act
    montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No puedes consultar esta evaluación');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('con un error genérico muestra el mensaje del servidor y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const { refetch } = montar({
      isError: true,
      error: crearError(503, 'EVALUACION_ASESOR_REALIZADA_NO_DISPONIBLE', 'Servicio no disponible'),
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Servicio no disponible');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('"Volver a mis evaluaciones" invoca onVolver', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onVolver } = montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR),
    });

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(onVolver).toHaveBeenCalledTimes(1);
  });
});

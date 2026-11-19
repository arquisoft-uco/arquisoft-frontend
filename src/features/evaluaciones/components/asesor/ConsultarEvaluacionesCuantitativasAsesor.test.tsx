import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEvaluacionesCuantitativasAsesor from './ConsultarEvaluacionesCuantitativasAsesor';
import type { ConsultaCuantitativasAsesor } from './ConsultarEvaluacionesCuantitativasAsesor';
import type { SeleccionCuantitativas } from '../EvaluacionesCuantitativasJuradoTable';
import {
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
} from '../../utils/codigos-error-evaluaciones';

const FILA = {
  id: 'ec-1',
  puntaje: 80,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    valor: 100,
  },
};

function error422(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { errorCode, message: 'Mensaje del servidor' },
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function montar(
  parcial: Partial<ConsultaCuantitativasAsesor>,
  onVolver = vi.fn(),
  onVerObservaciones = vi.fn(),
  seleccion?: SeleccionCuantitativas,
) {
  const consulta: ConsultaCuantitativasAsesor = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  };
  render(
    <ConsultarEvaluacionesCuantitativasAsesor
      consulta={consulta}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={onVolver}
      seleccion={seleccion}
      onVerObservaciones={onVerObservaciones}
    />,
  );
  return { consulta, onVolver };
}

describe('ConsultarEvaluacionesCuantitativasAsesor', () => {
  it('muestra ítem, puntaje de valor y resumen, sin rastro de la categoría', () => {
    // Act
    montar({ data: [FILA] });

    // Assert
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Qué tan claro es el documento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('80 de 100').length).toBeGreaterThan(0);
    expect(screen.queryByText(FILA.item.categoriaId)).not.toBeInTheDocument();
    expect(screen.getByText('1 evaluación cuantitativa')).toBeInTheDocument();
  });

  it('la acción «Ver observaciones» de la fila la entrega a onVerObservaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    const onVerObservaciones = vi.fn();
    montar({ data: [FILA] }, vi.fn(), onVerObservaciones);

    // Act
    await user.click(screen.getAllByRole('button', { name: /Ver observaciones de Claridad/ })[0]);

    // Assert
    expect(onVerObservaciones).toHaveBeenCalledWith(FILA);
  });

  it('con lista vacía muestra el estado vacío y no un error', () => {
    // Act
    montar({ data: [] });

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones cuantitativas')).toBeInTheDocument();
    expect(screen.getByText('0 evaluaciones cuantitativas')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mientras carga muestra el estado de carga', () => {
    // Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('un 422 de evaluación inexistente muestra su título y volver, sin reintento', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onVolver } = montar({
      isError: true,
      error: error422(EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA),
    });

    // Assert
    expect(screen.getByText('Esta evaluación no está disponible')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it('un 422 de otro asesor muestra su título y volver, sin reintento', () => {
    // Act
    montar({
      isError: true,
      error: error422(EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR),
    });

    // Assert
    expect(screen.getByText('No puedes consultar esta evaluación')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a mis evaluaciones' })).toBeInTheDocument();
  });

  it('un error genérico muestra el mensaje, «Reintentar» dispara refetch y hay volver', async () => {
    // Arrange
    const user = userEvent.setup();
    const { consulta } = montar({ isError: true, error: new Error('fallo de red') });

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a mis evaluaciones' })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(consulta.refetch).toHaveBeenCalledTimes(1);
  });

  it('con `seleccion` pinta una casilla por ítem y alterna por id de ítem; sin ella no hay casillas', async () => {
    // Arrange
    const user = userEvent.setup();
    const onAlternar = vi.fn();
    montar({ data: [FILA] }, vi.fn(), vi.fn(), { seleccionados: new Set(['i-1']), onAlternar });

    // Act
    const casilla = screen.getAllByRole('checkbox', { name: 'Seleccionar Claridad' })[0];
    await user.click(casilla);

    // Assert
    expect(casilla).toBeChecked();
    expect(onAlternar).toHaveBeenCalledWith('i-1');
  });

  it('sin `seleccion` no pinta casillas', () => {
    // Act
    montar({ data: [FILA] });

    // Assert
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});

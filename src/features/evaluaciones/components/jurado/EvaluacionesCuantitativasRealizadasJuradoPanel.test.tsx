import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import EvaluacionesCuantitativasRealizadasJuradoPanel from './EvaluacionesCuantitativasRealizadasJuradoPanel';
import type { ConsultaCuantitativas } from '../ConsultarEvaluacionesCuantitativasRealizadasJurado';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';

const { cambiarPuntaje } = vi.hoisted(() => ({ cambiarPuntaje: vi.fn() }));

vi.mock('../../hooks/useOmitirEvaluacionesCuantitativasJurado', () => ({
  useOmitirEvaluacionesCuantitativasJurado: () => ({ isPending: false, mutate: vi.fn() }),
}));
vi.mock('../../hooks/useCambiarPuntajeEvaluacionCuantitativaJurado', () => ({
  useCambiarPuntajeEvaluacionCuantitativaJurado: () => ({
    isPending: false,
    mutate: cambiarPuntaje,
    reset: vi.fn(),
  }),
}));

function fila(id: string, item: string): EvaluacionCuantitativaJurado {
  return {
    id,
    puntaje: 10,
    item: {
      id: `i-${id}`,
      nombre: item,
      descripcion: `Descripción de ${item}`,
      categoriaId: 'c-1',
      valor: 50,
    },
  };
}

const CLARIDAD = fila('ec-1', 'Claridad');
const ORDEN = fila('ec-2', 'Orden');

function consulta(data: EvaluacionCuantitativaJurado[]): ConsultaCuantitativas {
  return { data, error: null, isLoading: false, isError: false, refetch: vi.fn() };
}

function panel(data: EvaluacionCuantitativaJurado[], finalizada = false) {
  return (
    <EvaluacionesCuantitativasRealizadasJuradoPanel
      evaluacionJuradoId="ej-1"
      consulta={consulta(data)}
      finalizada={finalizada}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={vi.fn()}
    />
  );
}

describe('EvaluacionesCuantitativasRealizadasJuradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con la evaluación finalizada no hay casillas, barra ni acción de cambiar', () => {
    // Arrange / Act
    render(panel([CLARIDAD], true));

    // Assert
    expect(screen.queryByRole('button', { name: /Cambiar puntaje/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Omitir/ })).not.toBeInTheDocument();
  });

  it('marcar una fila habilita «Omitir (1)» y la selección se descarta cuando el id ya no está en los datos', async () => {
    // Arrange
    const user = userEvent.setup();
    const { rerender } = render(panel([CLARIDAD, ORDEN]));

    // Act
    await user.click(screen.getAllByRole('checkbox', { name: 'Seleccionar Claridad' })[0]);

    // Assert
    expect(screen.getByRole('button', { name: 'Omitir (1)' })).toBeEnabled();

    // Act
    rerender(panel([ORDEN]));

    // Assert
    expect(screen.getByRole('button', { name: 'Omitir (0)' })).toBeDisabled();
  });

  it('sin filas no muestra la barra y sí el estado vacío', () => {
    // Arrange / Act
    render(panel([]));

    // Assert
    expect(screen.queryByRole('button', { name: /Omitir/ })).not.toBeInTheDocument();
    expect(screen.getByText('Aún no registraste evaluaciones cuantitativas')).toBeInTheDocument();
  });

  it('«Cambiar puntaje» abre el editor en la propia fila y «Guardar» envía el puntaje nuevo', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel([CLARIDAD, ORDEN]));
    const tabla = within(screen.getByRole('table'));

    // Act
    await user.click(tabla.getByRole('button', { name: 'Cambiar puntaje de Orden' }));
    const campo = tabla.getByRole('textbox', { name: 'Puntaje de Orden' });
    await user.clear(campo);
    await user.type(campo, '25{Enter}');

    // Assert
    expect(cambiarPuntaje).toHaveBeenCalledWith(
      { evaluacionCuantitativaJuradoId: 'ec-2', puntaje: 25 },
      expect.any(Object),
    );
  });

  it('un puntaje fuera de rango muestra el error bajo el campo y no envía; Esc cancela y devuelve el foco', async () => {
    // Arrange
    const user = userEvent.setup();
    render(panel([CLARIDAD, ORDEN]));
    const tabla = within(screen.getByRole('table'));
    await user.click(tabla.getByRole('button', { name: 'Cambiar puntaje de Orden' }));
    const campo = tabla.getByRole('textbox', { name: 'Puntaje de Orden' });

    // Act
    await user.clear(campo);
    await user.type(campo, '99{Enter}');

    // Assert
    expect(tabla.getByRole('alert')).toBeInTheDocument();
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(cambiarPuntaje).not.toHaveBeenCalled();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(tabla.getByRole('button', { name: 'Cambiar puntaje de Orden' })).toHaveFocus();
  });
});

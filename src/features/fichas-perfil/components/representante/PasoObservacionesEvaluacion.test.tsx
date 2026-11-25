import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import { useRemoverObservacionEvaluacion } from '../../hooks/useRemoverObservacionEvaluacion';
import PasoObservacionesEvaluacion from './PasoObservacionesEvaluacion';

vi.mock('./AgregarObservacionEvaluacionPanel', () => ({
  default: () => <div>Formulario de observación</div>,
}));

vi.mock('../../hooks/useRemoverObservacionEvaluacion', () => ({
  useRemoverObservacionEvaluacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const EVALUACION: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-10-01',
  estadoEvaluacionId: null,
  estadoEvaluacionNombre: null,
};

function observacion(id: string, texto: string): ObservacionEvaluacion {
  return { id, observacion: texto } as ObservacionEvaluacion;
}

function renderizar(observaciones: ObservacionEvaluacion[], onContinuar = vi.fn()) {
  render(
    <PasoObservacionesEvaluacion
      evaluacion={EVALUACION}
      fichaPerfilId="f-1"
      observaciones={observaciones}
      onContinuar={onContinuar}
    />,
  );
  return onContinuar;
}

function props(observaciones: ObservacionEvaluacion[]) {
  return { evaluacion: EVALUACION, fichaPerfilId: 'f-1', observaciones, onContinuar: vi.fn() };
}

describe('PasoObservacionesEvaluacion', () => {
  it('sin elegir nada «Continuar» está deshabilitado y no hay botón «Ver observaciones»', () => {
    // Act
    renderizar([]);

    // Assert
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Ver observaciones' })).not.toBeInTheDocument();
  });

  it('con «Sí» y sin observaciones avisa y deja «Continuar» deshabilitado', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar([]);

    // Act
    await user.click(screen.getByRole('radio', { name: 'Sí' }));

    // Assert
    expect(screen.getByText('Formulario de observación')).toBeInTheDocument();
    expect(screen.getByText(/Agrega al menos una observación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('con «No» habilita «Continuar» y lo invoca', async () => {
    // Arrange
    const user = userEvent.setup();
    const onContinuar = renderizar([]);

    // Act
    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    // Assert
    expect(screen.queryByText('Formulario de observación')).not.toBeInTheDocument();
    expect(onContinuar).toHaveBeenCalledTimes(1);
  });

  it('con observaciones registradas deshabilita «No», muestra la cantidad y habilita «Continuar»', () => {
    // Act
    renderizar([observacion('o-1', 'Corregir objetivos'), observacion('o-2', 'Ampliar alcance')]);

    // Assert
    expect(screen.getByRole('radio', { name: 'No' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Sí' })).toBeChecked();
    expect(screen.getByText('2 observaciones registradas')).toBeInTheDocument();
    expect(screen.getByText('Corregir objetivos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it('con una sola observación usa el singular', () => {
    // Act
    renderizar([observacion('o-1', 'Corregir objetivos')]);

    // Assert
    expect(screen.getByText('1 observación registrada')).toBeInTheDocument();
  });

  it('«Eliminar observación» abre el diálogo con el texto de esa fila y confirmar envía su id', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn();
    vi.mocked(useRemoverObservacionEvaluacion).mockReturnValue({
      mutate,
      isPending: false,
    } as never);
    renderizar([observacion('o-1', 'Corregir objetivos'), observacion('o-2', 'Ampliar alcance')]);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Eliminar observación' })[1]);
    const dialogo = screen.getByRole('alertdialog', { name: '¿Eliminar observación?' });
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    // Assert
    expect(within(dialogo).getByText(/Ampliar alcance/)).toBeInTheDocument();
    expect(mutate.mock.calls[0][0]).toBe('o-2');
  });

  it('con la evaluación en estado final no ofrece «Eliminar observación»', () => {
    // Arrange
    const final: EvaluacionFichaPerfil = {
      ...EVALUACION,
      estadoEvaluacionId: 'APROBADA_CON_OBSERVACIONES',
      estadoEvaluacionNombre: 'Aprobada con observaciones',
    };

    // Act
    render(
      <PasoObservacionesEvaluacion
        evaluacion={final}
        fichaPerfilId="f-1"
        observaciones={[observacion('o-1', 'Corregir objetivos')]}
        onContinuar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Corregir objetivos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar observación' })).not.toBeInTheDocument();
  });

  it('al quedar sin observaciones rehabilita «No», avisa y deshabilita «Continuar»', () => {
    // Arrange
    const { rerender } = render(
      <PasoObservacionesEvaluacion {...props([observacion('o-1', 'Corregir objetivos')])} />,
    );
    expect(screen.getByRole('radio', { name: 'No' })).toBeDisabled();

    // Act
    rerender(<PasoObservacionesEvaluacion {...props([])} />);

    // Assert
    expect(screen.getByRole('radio', { name: 'No' })).toBeEnabled();
    expect(screen.getByText(/Agrega al menos una observación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });
});

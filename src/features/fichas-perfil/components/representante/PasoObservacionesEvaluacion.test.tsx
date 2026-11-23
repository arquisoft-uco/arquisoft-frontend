import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import PasoObservacionesEvaluacion from './PasoObservacionesEvaluacion';

vi.mock('./AgregarObservacionEvaluacionPanel', () => ({
  default: () => <div>Formulario de observación</div>,
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
});

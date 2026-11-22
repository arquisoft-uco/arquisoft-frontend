import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../../../test-utils/render';
import AccionesEvaluacionAsignadaAsesor from './AccionesEvaluacionAsignadaAsesor';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';

function asignacion(estadoId = 'e-1', tiene = false): EvaluacionAsignadaAsesor {
  return {
    id: 'ea-1',
    evaluacion: { id: 'ev-1', estado: { id: estadoId, nombre: 'En curso' } },
    entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
    tieneEvaluacionesCualitativas: tiene,
    tieneEvaluacionesCuantitativas: tiene,
  };
}

function Destino() {
  const { pathname, search, state } = useLocation();
  return (
    <>
      <p>{pathname}</p>
      <p>{search}</p>
      <p>{state === null ? 'sin state' : 'con state'}</p>
    </>
  );
}

function montar(estadoId = 'e-1', tiene = false) {
  return render(
    <Routes>
      <Route
        path="/evaluaciones"
        element={<AccionesEvaluacionAsignadaAsesor asignacion={asignacion(estadoId, tiene)} />}
      />
      <Route path="/evaluaciones/:id/gestionar-cualitativas-asesor" element={<Destino />} />
      <Route path="/evaluaciones/:id/gestionar-cuantitativas-asesor" element={<Destino />} />
    </Routes>,
    { initialPath: '/evaluaciones?q=sis' },
  );
}

describe('AccionesEvaluacionAsignadaAsesor', () => {
  it.each([
    ['sin evaluaciones', 'e-1', false],
    ['con evaluaciones', 'e-1', true],
    ['con la evaluación finalizada', 'FINALIZADA', true],
  ])('%s ofrece siempre exactamente los dos botones de gestión', (_caso, estadoId, tiene) => {
    // Act
    montar(estadoId, tiene);

    // Assert
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Gestionar cualitativas de Sistema de monitoreo' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Gestionar cuantitativas de Sistema de monitoreo' }),
    ).toBeEnabled();
  });

  it('cada botón navega a su página conservando la búsqueda del listado', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();

    // Act
    await user.click(
      screen.getByRole('button', { name: 'Gestionar cualitativas de Sistema de monitoreo' }),
    );

    // Assert
    expect(
      await screen.findByText('/evaluaciones/ea-1/gestionar-cualitativas-asesor'),
    ).toBeInTheDocument();
    expect(screen.getByText('?q=sis')).toBeInTheDocument();
    expect(screen.getByText('sin state')).toBeInTheDocument();
  });

  it('«Gestionar cuantitativas» navega a la página de cuantitativas', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();

    // Act
    await user.click(
      screen.getByRole('button', { name: 'Gestionar cuantitativas de Sistema de monitoreo' }),
    );

    // Assert
    expect(
      await screen.findByText('/evaluaciones/ea-1/gestionar-cuantitativas-asesor'),
    ).toBeInTheDocument();
    expect(screen.getByText('?q=sis')).toBeInTheDocument();
  });
});

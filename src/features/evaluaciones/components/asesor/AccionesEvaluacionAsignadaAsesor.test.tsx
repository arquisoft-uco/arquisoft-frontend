import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../../../test-utils/render';
import AccionesEvaluacionAsignadaAsesor from './AccionesEvaluacionAsignadaAsesor';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';

function asignacion(
  tieneCualitativas: boolean,
  tieneCuantitativas = false,
): EvaluacionAsignadaAsesor {
  return {
    id: 'ea-1',
    evaluacion: { id: 'ev-1', estado: { id: 'e-1', nombre: 'En curso' } },
    entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
    tieneEvaluacionesCualitativas: tieneCualitativas,
    tieneEvaluacionesCuantitativas: tieneCuantitativas,
  } as EvaluacionAsignadaAsesor;
}

function Destino() {
  const { pathname, state } = useLocation();
  return (
    <>
      <h1>Destino cualitativas</h1>
      <p>{pathname}</p>
      <p>{JSON.stringify(state)}</p>
    </>
  );
}

function montar(tieneCualitativas: boolean, tieneCuantitativas = false) {
  return render(
    <Routes>
      <Route
        path="/evaluaciones"
        element={
          <AccionesEvaluacionAsignadaAsesor
            asignacion={asignacion(tieneCualitativas, tieneCuantitativas)}
          />
        }
      />
      <Route path="/evaluaciones/:id/cualitativas-asesor" element={<Destino />} />
      <Route path="/evaluaciones/:id/cuantitativas-asesor" element={<Destino />} />
    </Routes>,
    { initialPath: '/evaluaciones?q=sis' },
  );
}

describe('AccionesEvaluacionAsignadaAsesor', () => {
  it('con cualitativas muestra la acción y navega a la pantalla con el state esperado', async () => {
    // Arrange
    const user = userEvent.setup();
    montar(true);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'Ver cualitativas de Sistema de monitoreo' }),
    );

    // Assert
    expect(
      await screen.findByRole('heading', { name: 'Destino cualitativas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('/evaluaciones/ea-1/cualitativas-asesor')).toBeInTheDocument();
    expect(
      screen.getByText(
        JSON.stringify({
          evaluacionAsesorId: 'ea-1',
          search: '?q=sis',
          resumen: { proyecto: 'Sistema de monitoreo', version: 2 },
        }),
      ),
    ).toBeInTheDocument();
  });

  it('con cuantitativas navega a su pantalla con el state esperado', async () => {
    // Arrange
    const user = userEvent.setup();
    montar(false, true);

    // Act
    await user.click(
      screen.getByRole('button', { name: 'Ver cuantitativas de Sistema de monitoreo' }),
    );

    // Assert
    expect(await screen.findByText('/evaluaciones/ea-1/cuantitativas-asesor')).toBeInTheDocument();
    expect(
      screen.getByText(
        JSON.stringify({
          evaluacionAsesorId: 'ea-1',
          search: '?q=sis',
          resumen: { proyecto: 'Sistema de monitoreo', version: 2 },
        }),
      ),
    ).toBeInTheDocument();
  });

  it('sin ninguna bandera no renderiza acciones', () => {
    // Act
    montar(false);

    // Assert
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

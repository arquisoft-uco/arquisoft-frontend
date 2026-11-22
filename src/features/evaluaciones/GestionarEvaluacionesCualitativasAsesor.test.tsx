import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen, within } from '../../test-utils/render';
import { useHasRole } from '../../hooks/useHasRole';
import GestionarEvaluacionesCualitativasAsesor from './GestionarEvaluacionesCualitativasAsesor';
import type { EvaluacionAsignadaAsesor } from './models/EvaluacionAsignadaAsesor';
import { evaluacionesService } from './services/evaluacionesService';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesAsignadasAsesor: vi.fn(),
    getEvaluacionesCualitativasAsesor: vi.fn(),
    getItemsCualitativosAsesor: vi.fn(),
    getCriteriosItemCualitativoAsesor: vi.fn(),
    registrarEvaluacionesCualitativasAsesor: vi.fn(),
    cambiarCriterioEvaluacionCualitativaAsesor: vi.fn(),
    omitirEvaluacionesCualitativasAsesor: vi.fn(),
  },
}));

const ITEM_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ITEM_ORDEN = '22222222-2222-4222-8222-222222222222';
const CRITERIO = '33333333-3333-4333-8333-333333333333';
const CRITERIO_2 = '55555555-5555-4555-8555-555555555555';

const ASIGNACION = (finalizada: boolean): EvaluacionAsignadaAsesor => ({
  id: 'ea-1',
  evaluacion: {
    id: 'e-1',
    estado: finalizada
      ? { id: 'FINALIZADA', nombre: 'Finalizada' }
      : { id: 'PENDIENTE', nombre: 'Pendiente' },
  },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: true,
  tieneEvaluacionesCuantitativas: false,
});

function preparar(finalizada = false) {
  const servicio = vi.mocked(evaluacionesService);
  servicio.getEvaluacionesAsignadasAsesor.mockResolvedValue({
    content: [ASIGNACION(finalizada)],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  });
  servicio.getItemsCualitativosAsesor.mockResolvedValue([
    { id: ITEM_CLARIDAD, nombre: 'Claridad', descripcion: 'Del documento', peso: 10 },
    { id: ITEM_ORDEN, nombre: 'Orden', descripcion: 'De las ideas', peso: 5 },
  ]);
  servicio.getEvaluacionesCualitativasAsesor.mockResolvedValue([
    {
      id: 'ec-1',
      item: { id: ITEM_ORDEN, nombre: 'Orden', descripcion: 'De las ideas', peso: 5 },
      criterio: { id: CRITERIO, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
    },
  ]);
  servicio.getCriteriosItemCualitativoAsesor.mockResolvedValue([
    { id: CRITERIO, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  ]);
  servicio.registrarEvaluacionesCualitativasAsesor.mockResolvedValue(undefined);
  servicio.cambiarCriterioEvaluacionCualitativaAsesor.mockResolvedValue(undefined);
  return servicio;
}

function montar() {
  render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionAsesorId/gestionar-cualitativas-asesor"
        element={<GestionarEvaluacionesCualitativasAsesor />}
      />
    </Routes>,
    { initialPath: '/evaluaciones/ea-1/gestionar-cualitativas-asesor' },
  );
}

describe('GestionarEvaluacionesCualitativasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHasRole).mockReturnValue(true);
  });

  it('con otro rol muestra el acceso denegado', () => {
    // Arrange
    vi.mocked(useHasRole).mockReturnValue(false);
    preparar();

    // Act
    montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });

  it('resume lo que falta, marca las pendientes y registra las elegidas en un solo lote', async () => {
    // Arrange
    const user = userEvent.setup();
    const servicio = preparar();
    montar();

    // Assert
    expect(
      await screen.findByText('Te faltan 1 de 2 ítems cualitativos por evaluar.'),
    ).toBeVisible();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    const catalogo = within(screen.getByRole('table', { name: 'Ítems cualitativos del catálogo' }));
    expect(catalogo.getAllByText('Pendiente')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Registrar valoraciones (0)' })).toBeDisabled();

    // Act
    await user.selectOptions(
      catalogo.getByRole('combobox', { name: 'Criterio para Claridad' }),
      'Excelente',
    );
    await user.click(screen.getByRole('button', { name: 'Registrar valoraciones (1)' }));

    // Assert
    expect(servicio.registrarEvaluacionesCualitativasAsesor).toHaveBeenCalledWith({
      evaluacionAsesorId: 'ea-1',
      evaluaciones: [{ itemId: ITEM_CLARIDAD, criterioId: CRITERIO }],
    });
  });

  it('con la evaluación finalizada avisa y queda en solo lectura', async () => {
    // Arrange
    preparar(true);

    // Act
    montar();

    // Assert
    expect(await screen.findByText(/ya fue finalizada/)).toBeInTheDocument();
    await screen.findByRole('table', { name: 'Ítems cualitativos del catálogo' });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Cambiar criterio|Omitir/ }),
    ).not.toBeInTheDocument();
  });

  it('cambia el criterio en la propia fila de «Realizadas» y llama al servicio con el cambio', async () => {
    // Arrange
    const user = userEvent.setup();
    const servicio = preparar();
    servicio.getCriteriosItemCualitativoAsesor.mockResolvedValue([
      { id: CRITERIO, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
      { id: CRITERIO_2, nombre: 'Regular', descripcion: 'Cumple lo básico' },
    ]);
    montar();
    const realizadas = within(
      await screen.findByRole('table', { name: 'Evaluaciones cualitativas del asesor' }),
    );
    await screen.findByText('Te faltan 1 de 2 ítems cualitativos por evaluar.');

    // Act
    await user.click(
      await realizadas.findByRole('button', { name: 'Cambiar criterio del ítem Orden' }),
    );
    await user.selectOptions(
      realizadas.getByRole('combobox', { name: 'Criterio para Orden' }),
      'Regular',
    );
    await user.click(realizadas.getByRole('button', { name: 'Guardar criterio de Orden' }));

    // Assert
    expect(servicio.cambiarCriterioEvaluacionCualitativaAsesor).toHaveBeenCalledWith({
      evaluacionCualitativaAsesorId: 'ec-1',
      criterioId: CRITERIO_2,
    });
  });
});

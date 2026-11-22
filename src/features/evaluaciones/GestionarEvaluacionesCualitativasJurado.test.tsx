import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen, within } from '../../test-utils/render';
import { useHasRole } from '../../hooks/useHasRole';
import GestionarEvaluacionesCualitativasJurado from './GestionarEvaluacionesCualitativasJurado';
import type { EvaluacionAsignadaJurado } from './models/EvaluacionAsignadaJurado';
import { evaluacionesService } from './services/evaluacionesService';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesAsignadasJurado: vi.fn(),
    getEvaluacionesCualitativasRealizadasJurado: vi.fn(),
    getItemsCualitativosJurado: vi.fn(),
    getCriteriosItemCualitativoJurado: vi.fn(),
    registrarEvaluacionesCualitativasJurado: vi.fn(),
  },
}));

const ITEM_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ITEM_ORDEN = '22222222-2222-4222-8222-222222222222';
const CRITERIO = '33333333-3333-4333-8333-333333333333';

const ASIGNACION = (finalizada: boolean): EvaluacionAsignadaJurado => ({
  id: 'ej-1',
  estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
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
  servicio.getEvaluacionesAsignadasJurado.mockResolvedValue({
    content: [ASIGNACION(finalizada)],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  });
  servicio.getItemsCualitativosJurado.mockResolvedValue([
    { id: ITEM_CLARIDAD, nombre: 'Claridad', descripcion: 'Del documento', peso: 10 },
    { id: ITEM_ORDEN, nombre: 'Orden', descripcion: 'De las ideas', peso: 5 },
  ]);
  servicio.getEvaluacionesCualitativasRealizadasJurado.mockResolvedValue([
    {
      id: 'ec-1',
      item: { id: ITEM_ORDEN, nombre: 'Orden', descripcion: 'De las ideas' },
      criterio: { id: CRITERIO, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
    },
  ]);
  servicio.getCriteriosItemCualitativoJurado.mockResolvedValue([
    { id: CRITERIO, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  ]);
  servicio.registrarEvaluacionesCualitativasJurado.mockResolvedValue(undefined);
  return servicio;
}

function montar() {
  render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionJuradoId/gestionar-cualitativas"
        element={<GestionarEvaluacionesCualitativasJurado />}
      />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/gestionar-cualitativas' },
  );
}

describe('GestionarEvaluacionesCualitativasJurado', () => {
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
    expect(servicio.registrarEvaluacionesCualitativasJurado).toHaveBeenCalledWith({
      evaluacionJuradoId: 'ej-1',
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
});

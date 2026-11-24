import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen, within } from '../../test-utils/render';
import { useHasRole } from '../../hooks/useHasRole';
import GestionarEvaluacionesCuantitativasAsesor from './GestionarEvaluacionesCuantitativasAsesor';
import type { EvaluacionAsignadaAsesor } from './models/EvaluacionAsignadaAsesor';
import { evaluacionesService } from './services/evaluacionesService';

vi.mock('../../hooks/useHasRole', () => ({ useHasRole: vi.fn() }));
vi.mock('./services/evaluacionesService', () => ({
  evaluacionesService: {
    getEvaluacionesAsignadasAsesor: vi.fn(),
    getEvaluacionesCuantitativasAsesor: vi.fn(),
    getItemsCuantitativosAsesor: vi.fn(),
    registrarEvaluacionesCuantitativasAsesor: vi.fn(),
    omitirEvaluacionesCuantitativasAsesor: vi.fn(),
  },
}));

const ITEM_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ITEM_RIGOR = '22222222-2222-4222-8222-222222222222';
const CATEGORIA = '44444444-4444-4444-8444-444444444444';

const ASIGNACION = (finalizada: boolean): EvaluacionAsignadaAsesor => ({
  id: 'ea-1',
  evaluacion: {
    id: 'e-1',
    estado: finalizada
      ? { id: 'FINALIZADA', nombre: 'Finalizada' }
      : { id: 'PENDIENTE', nombre: 'Pendiente' },
  },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: true,
  notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
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
  servicio.getItemsCuantitativosAsesor.mockResolvedValue([
    {
      id: ITEM_CLARIDAD,
      nombre: 'Claridad',
      descripcion: 'Del documento',
      categoriaId: CATEGORIA,
      valor: 50,
    },
    {
      id: ITEM_RIGOR,
      nombre: 'Rigor',
      descripcion: 'Del método',
      categoriaId: CATEGORIA,
      valor: 30,
    },
  ]);
  servicio.getEvaluacionesCuantitativasAsesor.mockResolvedValue([
    {
      id: 'ec-1',
      puntaje: 20,
      item: {
        id: ITEM_RIGOR,
        nombre: 'Rigor',
        descripcion: 'Del método',
        categoriaId: CATEGORIA,
        valor: 30,
      },
    },
  ]);
  servicio.registrarEvaluacionesCuantitativasAsesor.mockResolvedValue(undefined);
  servicio.omitirEvaluacionesCuantitativasAsesor.mockResolvedValue(undefined);
  return servicio;
}

function montar() {
  render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionAsesorId/gestionar-cuantitativas-asesor"
        element={<GestionarEvaluacionesCuantitativasAsesor />}
      />
    </Routes>,
    { initialPath: '/evaluaciones/ea-1/gestionar-cuantitativas-asesor' },
  );
}

describe('GestionarEvaluacionesCuantitativasAsesor', () => {
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

  it('resume lo que falta, valida el puntaje en la fila y registra el lote cuando es válido', async () => {
    // Arrange
    const user = userEvent.setup();
    const servicio = preparar();
    montar();
    expect(
      await screen.findByText('Te faltan 1 de 2 ítems cuantitativos por evaluar.'),
    ).toBeVisible();
    const catalogo = within(
      screen.getByRole('table', { name: 'Ítems cuantitativos del catálogo' }),
    );
    const campo = catalogo.getByRole('textbox', { name: 'Puntaje de Claridad' });

    // Act
    await user.type(campo, '99');
    await user.click(screen.getByRole('button', { name: 'Registrar valoraciones (1)' }));

    // Assert
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveFocus();
    expect(servicio.registrarEvaluacionesCuantitativasAsesor).not.toHaveBeenCalled();

    // Act
    await user.clear(campo);
    await user.type(campo, '45');
    await user.click(screen.getByRole('button', { name: 'Registrar valoraciones (1)' }));

    // Assert
    expect(servicio.registrarEvaluacionesCuantitativasAsesor).toHaveBeenCalledWith({
      evaluacionAsesorId: 'ea-1',
      evaluaciones: [{ itemId: ITEM_CLARIDAD, puntaje: 45 }],
    });
  });

  it('con la evaluación finalizada avisa y queda en solo lectura', async () => {
    // Arrange
    preparar(true);

    // Act
    montar();

    // Assert
    expect(await screen.findByText(/ya fue finalizada/)).toBeInTheDocument();
    await screen.findByRole('table', { name: 'Ítems cuantitativos del catálogo' });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Cambiar puntaje|Omitir/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Ver observaciones de Rigor' }).length,
    ).toBeGreaterThan(0);
  });

  it('omitir pide confirmación con la frase de las observaciones y envía el id del ítem', async () => {
    // Arrange
    const user = userEvent.setup();
    const servicio = preparar();
    montar();
    const realizadas = within(
      await screen.findByRole('table', { name: 'Evaluaciones cuantitativas del asesor' }),
    );

    // Act
    await user.click(realizadas.getByRole('checkbox', { name: 'Seleccionar Rigor' }));
    await user.click(screen.getByRole('button', { name: 'Omitir (1)' }));

    // Assert
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'También se eliminarán las observaciones asociadas a esos ítems',
    );

    // Act
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Omitir' }),
    );

    // Assert
    expect(servicio.omitirEvaluacionesCuantitativasAsesor).toHaveBeenCalledWith({
      evaluacionAsesorId: 'ea-1',
      items: [ITEM_RIGOR],
    });
  });
});

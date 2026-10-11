import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../../test-utils/render';
import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import ObservacionesFichaAsesorPanel from './ObservacionesFichaAsesorPanel';

vi.mock('../../hooks/useObservacionesFichaAsesor', () => ({
  useObservacionesFichaAsesor: vi.fn(),
}));

describe('ObservacionesFichaAsesorPanel', () => {
  it('consulta las observaciones de la ficha y renderiza sus filas', () => {
    // Arrange
    vi.mocked(useObservacionesFichaAsesor).mockReturnValue({
      filas: [
        {
          observacion: {
            id: 'o-1',
            revisionItemId: 'r-1',
            observacion: 'Ajustar el alcance',
            estadoId: 'EN_PROGRESO',
            estadoNombre: 'En progreso',
          },
          item: {
            id: 'i-1',
            fichaPerfilId: 'f-1',
            tipoItem: { id: 't-1', nombre: 'Objetivo general' },
            contenido: 'Medir el impacto',
          },
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      pageSize: 10,
      goToPage: vi.fn(),
      direccion: undefined,
      ordenar: vi.fn(),
      sinObservables: false,
      isLoading: false,
      isError: false,
      error: null,
      reintentar: vi.fn(),
    });

    // Act
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(useObservacionesFichaAsesor).toHaveBeenCalledWith('f-1');
    expect(screen.getAllByText('Ajustar el alcance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0);
  });
});

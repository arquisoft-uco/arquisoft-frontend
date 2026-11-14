import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import RecibidasPanel from './RecibidasPanel';
import { useTiposSolicitudRecibidas } from '../../hooks/useTiposSolicitudRecibidas';
import type { TipoSolicitud } from '../../models/TipoSolicitud';

vi.mock('../../hooks/useTiposSolicitudRecibidas', () => ({ useTiposSolicitudRecibidas: vi.fn() }));

const TIPOS: TipoSolicitud[] = [
  { id: 'AMPLIACION_DE_PLAZO', nombre: 'Ampliación de Plazo', descripcion: 'd' },
  { id: 'CAMBIO_DE_ASESOR', nombre: 'Cambio de Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_COORDINADOR', nombre: 'Novedad para el Coordinador', descripcion: 'd' },
];

function mockCatalogo(data: TipoSolicitud[]) {
  vi.mocked(useTiposSolicitudRecibidas).mockReturnValue({
    data,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as Partial<ReturnType<typeof useTiposSolicitudRecibidas>> as ReturnType<
    typeof useTiposSolicitudRecibidas
  >);
}

interface PropsPanel {
  page: number;
  onPageChange: (page: number) => void;
}

vi.mock('./SolicitudesRecibidasPanel', () => ({
  default: ({ page, onPageChange }: PropsPanel) => (
    <button type="button" onClick={() => onPageChange(7)}>
      Panel de novedad, página {page}
    </button>
  ),
}));

vi.mock('./SolicitudesCambioAsesorRecibidasPanel', () => ({
  default: ({ page, onPageChange }: PropsPanel) => (
    <button type="button" onClick={() => onPageChange(8)}>
      Panel de cambio de asesor, página {page}
    </button>
  ),
}));

vi.mock('./SolicitudesAmpliacionPlazoRecibidasPanel', () => ({
  default: ({ page, onPageChange }: PropsPanel) => (
    <button type="button" onClick={() => onPageChange(9)}>
      Panel de ampliación de plazo, página {page}
    </button>
  ),
}));

describe('RecibidasPanel del coordinador', () => {
  beforeEach(() => {
    mockCatalogo(TIPOS);
  });

  it('con un subconjunto de tipos ofrece solo los devueltos por el backend', () => {
    // Arrange
    mockCatalogo(TIPOS.filter((t) => t.id !== 'NOVEDAD_PARA_EL_COORDINADOR'));

    // Act
    render(
      <RecibidasPanel
        paginas={{ novedad: 2, 'cambio-asesor': 5, 'ampliacion-plazo': 3 }}
        onPageChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    expect(screen.getByText('Panel de cambio de asesor, página 5')).toBeInTheDocument();
  });

  it('muestra novedad por defecto y al cambiar de tipo entrega a cada panel su propia página', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <RecibidasPanel
        paginas={{ novedad: 2, 'cambio-asesor': 5, 'ampliacion-plazo': 3 }}
        onPageChange={onPageChange}
      />,
    );
    const panelNovedad = screen.getByRole('button', { name: 'Panel de novedad, página 2' });

    // Act
    await user.click(panelNovedad);

    // Assert
    expect(onPageChange).toHaveBeenLastCalledWith('novedad', 7);

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'cambio-asesor',
    );

    // Assert
    expect(screen.queryByText(/Panel de novedad/)).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Panel de cambio de asesor, página 5' }));

    // Assert
    expect(onPageChange).toHaveBeenLastCalledWith('cambio-asesor', 8);

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'ampliacion-plazo',
    );
    await user.click(
      screen.getByRole('button', { name: 'Panel de ampliación de plazo, página 3' }),
    );

    // Assert
    expect(screen.queryByText(/Panel de cambio de asesor/)).not.toBeInTheDocument();
    expect(onPageChange).toHaveBeenLastCalledWith('ampliacion-plazo', 9);
  });
});

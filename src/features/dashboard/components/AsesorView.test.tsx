import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import type { ArtefactoSinAvance } from '../models/ArtefactoSinAvance';
import { useArtefactosSinAvance } from '../hooks/useArtefactosSinAvance';
import { useConteos } from '../hooks/useConteos';
import AsesorView from './AsesorView';

vi.mock('../hooks/useArtefactosSinAvance', () => ({ useArtefactosSinAvance: vi.fn() }));
vi.mock('../hooks/useConteos', () => ({ useConteos: vi.fn() }));

const artefacto: ArtefactoSinAvance = {
  id: 'a-1',
  nombreDocumento: 'Documento de arquitectura',
  versionDocumento: 3,
  nombreProyecto: 'Sistema de alertas',
  diasSinAvance: 20,
  estadoUltimaRevision: 'Aprobada',
};

function bandejaMock(parcial: Partial<ReturnType<typeof useArtefactosSinAvance>> = {}) {
  vi.mocked(useArtefactosSinAvance).mockReturnValue({
    artefactos: [artefacto],
    total: 4,
    dias: 15,
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useArtefactosSinAvance>);
}

describe('AsesorView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Ana' } });
    bandejaMock();
    vi.mocked(useConteos).mockImplementation((recursos) => ({
      valores: recursos.map(() => 6),
      total: undefined,
      cargando: false,
      hayError: false,
      reintentar: vi.fn(),
    }));
  });

  it('lista los artefactos sin avance con sus días y «Ver todos» abre el reporte completo', () => {
    render(<AsesorView />);

    expect(
      screen.getByText('Tienes 4 artefactos sin avance en más de 15 días.'),
    ).toBeInTheDocument();
    const bandeja = screen.getByRole('region', { name: 'Artefactos sin avance' });
    expect(within(bandeja).getByText('Documento de arquitectura')).toBeInTheDocument();
    expect(within(bandeja).getByText('Sistema de alertas · versión 3')).toBeInTheDocument();
    expect(within(bandeja).getByText('20 días sin avance')).toBeInTheDocument();
    expect(within(bandeja).getByRole('link', { name: 'Ver todos' })).toHaveAttribute(
      'href',
      '/artefactos?vista=sin-avance',
    );
    const resumen = screen.getByRole('region', { name: 'Resumen' });
    expect(within(resumen).getAllByRole('link')).toHaveLength(4);
    expect(screen.getByRole('region', { name: 'Solicitudes' })).toHaveTextContent(
      'Novedades recibidas6',
    );
  });

  it('sin artefactos atrasados muestra el vacío sin «Ver todos» y una frase tranquilizadora', () => {
    bandejaMock({ artefactos: [], total: 0 });

    render(<AsesorView />);

    expect(screen.getByText('Tus artefactos tienen avance reciente.')).toBeInTheDocument();
    expect(screen.getByText('Tus artefactos tienen avance reciente')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver todos' })).not.toBeInTheDocument();
  });

  it('un error de la bandeja muestra alerta con «Reintentar» y deja el resumen visible', async () => {
    const user = userEvent.setup();
    const reintentar = vi.fn();
    bandejaMock({ artefactos: [], total: undefined, cargado: false, hayError: true, reintentar });

    render(<AsesorView />);

    const bandeja = screen.getByRole('region', { name: 'Artefactos sin avance' });
    expect(within(bandeja).getByRole('alert')).toHaveTextContent(
      'No pudimos cargar los artefactos sin avance',
    );
    expect(screen.getByRole('region', { name: 'Resumen' })).toBeInTheDocument();
    await user.click(within(bandeja).getByRole('button', { name: 'Reintentar' }));
    expect(reintentar).toHaveBeenCalled();
  });
});

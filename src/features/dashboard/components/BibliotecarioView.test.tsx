import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import { useConteos } from '../hooks/useConteos';
import { useEntregablesPorPublicar } from '../hooks/useEntregablesPorPublicar';
import BibliotecarioView from './BibliotecarioView';

vi.mock('../hooks/useEntregablesPorPublicar', () => ({ useEntregablesPorPublicar: vi.fn() }));
vi.mock('../hooks/useConteos', () => ({ useConteos: vi.fn() }));

function bandejaMock(parcial: Partial<ReturnType<typeof useEntregablesPorPublicar>> = {}) {
  vi.mocked(useEntregablesPorPublicar).mockReturnValue({
    entregables: [
      { id: 'd-1', tituloProyecto: 'Riego', versionEntregable: 2, autores: ['Ana', 'Luis'] },
      { id: 'd-2', tituloProyecto: null, versionEntregable: 1, autores: [] },
    ],
    total: 2,
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEntregablesPorPublicar>);
}

describe('BibliotecarioView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Beto' } });
    bandejaMock();
    vi.mocked(useConteos).mockImplementation((recursos) => ({
      valores: recursos.map(() => 9),
      total: undefined,
      cargando: false,
      hayError: false,
      reintentar: vi.fn(),
    }));
  });

  it('lista los entregables por publicar con sus autores y «Ver todos» lleva a los disponibles', () => {
    render(<BibliotecarioView />);

    expect(
      screen.getByText('Hay 2 entregables por publicar en la biblioteca.'),
    ).toBeInTheDocument();
    const bandeja = screen.getByRole('region', { name: 'Entregables por publicar' });
    expect(within(bandeja).getByText('Versión 2 · Ana, Luis')).toBeInTheDocument();
    expect(within(bandeja).getByText('Proyecto sin título')).toBeInTheDocument();
    expect(within(bandeja).getByRole('link', { name: 'Ver todos' })).toHaveAttribute(
      'href',
      '/biblioteca/disponibles',
    );
    expect(screen.getByRole('button', { name: 'Consultar la biblioteca' })).toBeInTheDocument();
  });

  it('sin entregables muestra el vacío y la frase lo dice', () => {
    bandejaMock({ entregables: [], total: 0 });

    render(<BibliotecarioView />);

    expect(screen.getByText('No hay entregables por publicar.')).toBeInTheDocument();
    expect(screen.getByText('No hay entregables por publicar')).toBeInTheDocument();
  });
});

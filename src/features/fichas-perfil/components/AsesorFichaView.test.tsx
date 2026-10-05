import { describe, it, expect, vi } from 'vitest';
import { useSearchParams } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import AsesorFichaView from './AsesorFichaView';

vi.mock('./asesor-ficha/ConsultarFichasAsesor', () => ({
  default: function ListadoFalso() {
    const [params] = useSearchParams();
    return <p>Listado de fichas {params.get('q')}</p>;
  },
}));

describe('AsesorFichaView', () => {
  it('muestra un solo título de página y el listado, sin pestañas', () => {
    // Act
    render(<AsesorFichaView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mis fichas de perfil' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByText(/Listado de fichas/)).toBeInTheDocument();
  });

  it('ignora un ?vista=estados antiguo: muestra el listado y conserva la búsqueda', () => {
    // Act
    render(<AsesorFichaView />, { initialPath: '/fichas-perfil?vista=estados&q=sis' });

    // Assert
    expect(screen.getByText('Listado de fichas sis')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});

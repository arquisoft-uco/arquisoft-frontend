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

vi.mock('./asesor-ficha/ConsultarEvaluacionesAsesor', () => ({
  default: function EvaluacionesFalso() {
    return <p>Listado de evaluaciones</p>;
  },
}));

describe('AsesorFichaView', () => {
  it('muestra un solo título, las pestañas y por defecto el listado de fichas', () => {
    // Act
    render(<AsesorFichaView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Fichas' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toBeInTheDocument();
    expect(screen.getByText(/Listado de fichas/)).toBeInTheDocument();
    expect(screen.queryByText('Listado de evaluaciones')).not.toBeInTheDocument();
  });

  it('con ?vista=evaluaciones muestra el listado de evaluaciones', () => {
    // Act
    render(<AsesorFichaView />, { initialPath: '/fichas-perfil?vista=evaluaciones' });

    // Assert
    expect(screen.getByText('Listado de evaluaciones')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.queryByText(/Listado de fichas/)).not.toBeInTheDocument();
  });

  it('ignora un ?vista=estados antiguo: muestra las fichas y conserva la búsqueda', () => {
    // Act
    render(<AsesorFichaView />, { initialPath: '/fichas-perfil?vista=estados&q=sis' });

    // Assert
    expect(screen.getByText('Listado de fichas sis')).toBeInTheDocument();
  });
});

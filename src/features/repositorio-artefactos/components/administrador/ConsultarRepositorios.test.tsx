import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { repositorioArtefactosService } from '../../services/repositorioArtefactosService';
import ConsultarRepositorios from './ConsultarRepositorios';

vi.mock('../../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    consultarRepositoriosAdministrador: vi.fn(),
  },
}));

const consultar = vi.mocked(repositorioArtefactosService.consultarRepositoriosAdministrador);

const PAGINA = {
  content: [
    { id: 'r-1', nombreRepositorio: 'Repositorio Alfa' },
    { id: 'r-2', nombreRepositorio: 'Repositorio Beta' },
  ],
  totalElements: 2,
  totalPages: 1,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

describe('ConsultarRepositorios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA);
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarRepositorios />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con datos muestra el resumen y las filas', async () => {
    // Act
    render(<ConsultarRepositorios />);

    // Assert
    expect(await screen.findByText('2 repositorios')).toBeInTheDocument();
    expect(screen.getAllByText('Repositorio Alfa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Repositorio Beta').length).toBeGreaterThan(0);
  });

  it('con error muestra la alerta y reintenta la consulta', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValue(new Error('falla'));
    render(<ConsultarRepositorios />);

    // Act
    const alerta = await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(alerta).toHaveTextContent('No se pudieron cargar los repositorios');
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
  });

  it('escribir en la búsqueda vuelve a consultar con el filtro', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarRepositorios />);
    await screen.findByText('2 repositorios');

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar repositorios' }), 'alfa');

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
        }),
      ),
    );
  });
});

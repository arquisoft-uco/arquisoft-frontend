import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { repositorioArtefactosService } from '../../services/repositorioArtefactosService';
import ConsultarVersionesRepositorio from './ConsultarVersionesRepositorio';

vi.mock('../../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    consultarVersionesRepositorio: vi.fn(),
  },
}));

const consultar = vi.mocked(repositorioArtefactosService.consultarVersionesRepositorio);

const base = {
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'archivo.pdf',
};

const VERSIONES = [
  { ...base, id: 'v-2', nombreDocumento: 'Manual', numeroVersion: 2 },
  { ...base, id: 'v-1', nombreDocumento: 'Manual', numeroVersion: 1 },
];

describe('ConsultarVersionesRepositorio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(VERSIONES);
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarVersionesRepositorio repositorioId="r-1" />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con datos muestra el resumen y las versiones en el orden recibido', async () => {
    // Act
    render(<ConsultarVersionesRepositorio repositorioId="r-1" />);

    // Assert
    expect(await screen.findByText('2 versiones')).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledWith('r-1');
    const versiones = screen.getAllByText(/^Versión \d$/).map((n) => n.textContent);
    expect(versiones.slice(0, 2)).toEqual(['Versión 2', 'Versión 1']);
  });

  it('sin versiones muestra el estado vacío', async () => {
    // Arrange
    consultar.mockResolvedValue([]);

    // Act
    render(<ConsultarVersionesRepositorio repositorioId="r-1" />);

    // Assert
    expect(await screen.findByText('Este repositorio aún no tiene versiones')).toBeInTheDocument();
  });

  it('con error muestra la alerta y reintenta la consulta', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValue(new Error('falla'));
    render(<ConsultarVersionesRepositorio repositorioId="r-1" />);
    await screen.findByRole('alert');

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
  });
});

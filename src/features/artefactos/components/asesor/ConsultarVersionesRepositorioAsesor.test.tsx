import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import type { Page } from '../../../../shared/models/api-response';
import type { VersionRepositorioAsesor } from '../../models/VersionRepositorioAsesor';
import { artefactosService } from '../../services/artefactosService';
import ConsultarVersionesRepositorioAsesor from './ConsultarVersionesRepositorioAsesor';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesRepositorioAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesRepositorioAsesor);

const VERSION: VersionRepositorioAsesor = {
  id: 'v-1',
  nombreDocumento: 'Acta de inicio',
  numeroVersion: 3,
  fechaCreacion: '2026-03-10T15:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'acta-inicio.pdf',
  repositorioArtefacto: { id: 'r-1', nombreRepositorio: 'Repositorio base', descripcion: '' },
};

function pagina(content: VersionRepositorioAsesor[]): Page<VersionRepositorioAsesor> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 10,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('ConsultarVersionesRepositorioAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(pagina([VERSION]));
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarVersionesRepositorioAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con datos muestra las filas y el resumen con el total', async () => {
    // Act
    render(<ConsultarVersionesRepositorioAsesor />);

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Versiones de repositorio' });
    expect(within(tabla).getByText('Acta de inicio')).toBeInTheDocument();
    expect(screen.getByText('1 versión')).toBeInTheDocument();
  });

  it('sin versiones muestra el vacío informativo', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    render(<ConsultarVersionesRepositorioAsesor />);

    // Assert
    expect(await screen.findByText('Aún no hay versiones de repositorio')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(new Error('fallo de red'));
    render(<ConsultarVersionesRepositorioAsesor />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No se pudieron cargar las versiones')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Versiones de repositorio' }),
    ).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('escribir en el buscador consulta con el filtro tras el retardo', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<ConsultarVersionesRepositorioAsesor />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar versiones' }), 'acta');
    avanzar(300);

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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { artefactosService } from '../../services/artefactosService';
import ConsultarArtefactosAsignadosAsesor from './ConsultarArtefactosAsignadosAsesor';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarArtefactosAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosAsesor);

const ARTEFACTO: ArtefactoAsesor = {
  id: '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

function pagina<T>(content: T[]): Page<T> {
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

describe('ConsultarArtefactosAsignadosAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(pagina([ARTEFACTO]));
  });

  it('con datos muestra la tabla, el resumen y la búsqueda habilitada', async () => {
    // Act
    render(<ConsultarArtefactosAsignadosAsesor />);

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Artefactos asignados' });
    expect(await within(tabla).findByText('Sistema de riego')).toBeInTheDocument();
    expect(screen.getByText('1 artefacto')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar artefactos' })).toBeEnabled();
  });

  it('ante un error muestra el aviso y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(new Error('fallo de red'));
    render(<ConsultarArtefactosAsignadosAsesor />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No se pudieron cargar los artefactos')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(await screen.findByRole('table', { name: 'Artefactos asignados' })).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import type { Page } from '../../../../shared/models/api-response';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';
import { artefactosService } from '../../services/artefactosService';
import ConsultarArtefactosEstudiante from './ConsultarArtefactosEstudiante';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: { consultarArtefactosEstudiante: vi.fn() },
}));

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosEstudiante);

const ARTEFACTO: ArtefactoEstudiante = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  asesor: 's-1',
  nombreAsesor: 'Ana Pérez',
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

describe('ConsultarArtefactosEstudiante', () => {
  afterEach(() => {
    restaurarTemporizadores();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(pagina([ARTEFACTO]));
  });

  it('con datos muestra la tabla y el resumen', async () => {
    // Act
    render(<ConsultarArtefactosEstudiante />);

    // Assert
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos de mis proyectos de grado',
    });
    expect(await within(tabla).findByText('Acta de inicio')).toBeInTheDocument();
    expect(screen.getByText('1 artefacto')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso sin paginador y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(new Error('fallo de red'));
    render(<ConsultarArtefactosEstudiante />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No se pudieron cargar los artefactos')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Artefactos de mis proyectos de grado' }),
    ).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('escribir en "Buscar artefactos" consulta con el criterio de búsqueda tras el retardo', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<ConsultarArtefactosEstudiante />);
    await screen.findByRole('table', { name: 'Artefactos de mis proyectos de grado' });

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar artefactos' }), 'acta');
    avanzar(300);

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 0,
          filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
        }),
      ),
    );
  });
});

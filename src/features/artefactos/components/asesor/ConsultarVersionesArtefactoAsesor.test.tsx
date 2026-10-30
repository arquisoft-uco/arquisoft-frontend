import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import type { Page } from '../../../../shared/models/api-response';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarVersionesArtefactoAsesor from './ConsultarVersionesArtefactoAsesor';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoAsesor: vi.fn(),
    consultarArtefactosAsesor: vi.fn(),
  },
}));

const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoAsesor);
const consultarArtefactos = vi.mocked(artefactosService.consultarArtefactosAsesor);

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
};

const ARTEFACTO: ArtefactoAsesor = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
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

describe('ConsultarVersionesArtefactoAsesor', () => {
  afterEach(() => {
    restaurarTemporizadores();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    consultarVersiones.mockResolvedValue(pagina([VERSION]));
    consultarArtefactos.mockResolvedValue(pagina([ARTEFACTO]));
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    consultarVersiones.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con datos muestra las filas con el artefacto nombrado y el resumen', async () => {
    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
    expect(await within(tabla).findByText('Acta de inicio')).toBeInTheDocument();
    expect(within(tabla).getByText('Versión 4')).toBeInTheDocument();
    expect(screen.getByText('1 versión')).toBeInTheDocument();
  });

  it('sin versiones muestra el vacío informativo', async () => {
    // Arrange
    consultarVersiones.mockResolvedValue(pagina([]));

    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    expect(await screen.findByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultarVersiones.mockRejectedValueOnce(new Error('fallo de red'));
    render(<ConsultarVersionesArtefactoAsesor />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No se pudieron cargar las versiones')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Versiones de artefactos' }),
    ).toBeInTheDocument();
    expect(consultarVersiones).toHaveBeenCalledTimes(2);
  });

  it('si el catálogo falla, la búsqueda se deshabilita con aviso y la tabla sigue con "Artefacto sin nombre"', async () => {
    // Arrange
    consultarArtefactos.mockRejectedValue(new Error('fallo'));

    // Act
    render(<ConsultarVersionesArtefactoAsesor />);
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Assert
    expect(await within(tabla).findByText('Artefacto sin nombre')).toBeInTheDocument();
    expect(await screen.findByText(/No se pudo cargar la lista de artefactos/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar artefactos' })).toBeDisabled();
  });

  it('elegir un rango desde el botón de fechas consulta con el criterio y el botón muestra el rango', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarVersionesArtefactoAsesor />);
    await screen.findByRole('table', { name: 'Versiones de artefactos' });
    await user.click(screen.getByRole('button', { name: 'Fecha de creación', expanded: false }));
    const panel = within(screen.getByRole('dialog', { name: 'Fecha de creación' }));

    // Act
    await user.type(panel.getByLabelText('Desde'), '2026-03-01');
    await user.type(panel.getByLabelText('Hasta'), '2026-03-31');

    // Assert
    expect(consultarVersiones).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pagina: 0,
        filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'AND' }),
      }),
    );
    expect(
      await screen.findByRole('button', { name: 'Fecha de creación: 01/03/2026 – 31/03/2026' }),
    ).toBeInTheDocument();
  });

  it('escribir en "Buscar artefactos" consulta con IN sobre los artefactos que coinciden', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<ConsultarVersionesArtefactoAsesor />);
    await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar artefactos' }), 'acta');
    avanzar(300);

    // Assert
    await waitFor(() =>
      expect(consultarVersiones).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: {
            tipo: 'PREDICADO_MULTIVALOR',
            campo: 'artefacto',
            operador: 'IN',
            valores: ['a-1'],
          },
        }),
      ),
    );
  });

  it('un texto sin coincidencias muestra "Sin resultados" sin consultar y "Limpiar filtros" restablece', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarVersionesArtefactoAsesor />, { initialPath: '/artefactos?q=zzz' });

    // Assert
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
    expect(consultarVersiones).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Versiones de artefactos' }),
    ).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar: vi.fn(), descargando: false }),
}));
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { artefactosService } from '../../services/artefactosService';
import ConsultarArtefactosAsignadosAsesor from './ConsultarArtefactosAsignadosAsesor';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarArtefactosAsesor: vi.fn(),
  },
}));
vi.mock('./OmitirArtefactoDialog', () => ({
  default: ({ artefacto }: { artefacto: { nombreDocumento: string } }) => (
    <div role="dialog" aria-label="Omitir">
      {artefacto.nombreDocumento}
    </div>
  ),
}));
vi.mock('./AsignarArtefactoPanel', () => ({
  default: ({ reactivar }: { reactivar?: { nombreDocumento: string } }) => (
    <div role="dialog" aria-label="Reactivar artefacto">
      {reactivar?.nombreDocumento}
    </div>
  ),
}));

vi.mock('./EstudiantesArtefactoPanel', () => ({
  default: ({ artefacto }: { artefacto: { nombreDocumento: string } }) => (
    <div role="dialog" aria-label="Estudiantes del artefacto">
      {artefacto.nombreDocumento}
    </div>
  ),
}));

vi.mock('../../../../shared/hooks/useAsesoresVigentes', () => ({
  useAsesoresVigentes: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
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

  it('"Omitir artefacto" abre la confirmación y "Reactivar artefacto" abre el panel de la fila omitida', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue(
      pagina([
        ARTEFACTO,
        { ...ARTEFACTO, id: 'a-2', nombreDocumento: 'Anteproyecto', omitido: true },
      ]),
    );
    render(<ConsultarArtefactosAsignadosAsesor />);
    const tabla = await screen.findByRole('table', { name: 'Artefactos asignados' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', { name: 'Acciones de Acta de inicio' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Omitir artefacto' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Omitir' })).toHaveTextContent('Acta de inicio');

    // Act
    await user.click(within(tabla).getByRole('button', { name: 'Acciones de Anteproyecto' }));
    await user.click(screen.getByRole('menuitem', { name: 'Reactivar artefacto' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Reactivar artefacto' })).toHaveTextContent(
      'Anteproyecto',
    );
  });

  it('un artefacto omitido no ofrece "Cambiar asesor" y uno no omitido de la misma lista sí', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue(
      pagina([
        ARTEFACTO,
        { ...ARTEFACTO, id: 'a-2', nombreDocumento: 'Anteproyecto', omitido: true },
      ]),
    );
    render(<ConsultarArtefactosAsignadosAsesor />);
    const tabla = await screen.findByRole('table', { name: 'Artefactos asignados' });
    await user.click(
      await within(tabla).findByRole('button', { name: 'Acciones de Acta de inicio' }),
    );
    expect(screen.getByRole('menuitem', { name: 'Cambiar asesor' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    // Act
    await user.click(within(tabla).getByRole('button', { name: 'Acciones de Anteproyecto' }));

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Ver estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Reactivar artefacto' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Cambiar asesor' })).not.toBeInTheDocument();
  });

  it('"Gestionar estudiantes" abre el panel de estudiantes del artefacto', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarArtefactosAsignadosAsesor />);
    const tabla = await screen.findByRole('table', { name: 'Artefactos asignados' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', { name: 'Acciones de Acta de inicio' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Gestionar estudiantes' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Estudiantes del artefacto' })).toHaveTextContent(
      'Acta de inicio',
    );
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

  it('con filtros en la URL envía el criterio, muestra los chips y quitar uno actualiza la consulta', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarArtefactosAsignadosAsesor />, {
      initialPath: '/artefactos?proyecto=riego&version=2',
    });
    await screen.findByRole('table', { name: 'Artefactos asignados' });
    expect(consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'AND' }),
      }),
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Proyecto: riego' }));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: expect.objectContaining({ campo: 'versionDocumento', operador: 'ES' }),
        }),
      ),
    );
    expect(screen.queryByRole('button', { name: 'Quitar filtro Proyecto: riego' })).toBeNull();
  });

  it('sin coincidencias bajo filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue(pagina([]));
    render(<ConsultarArtefactosAsignadosAsesor />, { initialPath: '/artefactos?documento=zzz' });

    // Act
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ filtros: undefined })),
    );
  });

  it('"Cambiar asesor" en una fila abre el panel de ese artefacto y cerrarlo lo quita', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarArtefactosAsignadosAsesor />);
    const tabla = await screen.findByRole('table', { name: 'Artefactos asignados' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', { name: 'Acciones de Acta de inicio' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Cambiar asesor' }));

    // Assert
    const panel = screen.getByRole('dialog', { name: 'Cambiar asesor' });
    expect(within(panel).getByText('Acta de inicio · Sistema de riego')).toBeInTheDocument();

    // Act
    await user.click(within(panel).getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Cambiar asesor' })).not.toBeInTheDocument();
  });
});

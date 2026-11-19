import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import { useArtefactosEntregable } from '../../hooks/useArtefactosEntregable';
import type { ArtefactoEntregable } from '../../models/ArtefactoEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import ArtefactosEntregablePanel from './ArtefactosEntregablePanel';

vi.mock('../../hooks/useArtefactosEntregable', () => ({ useArtefactosEntregable: vi.fn() }));

vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: vi.fn(),
}));

const hookMock = vi.mocked(useArtefactosEntregable);
const descargar = vi.fn();
const refetch = vi.fn();

const ENTREGABLE: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 3,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

function artefacto(n: number): ArtefactoEntregable {
  return {
    id: `id-${n}`,
    entregableProyectoGrado: 'uuid-entregable',
    versionArtefacto: 'uuid-version',
    numeroVersion: n,
    uriArchivo: `docs/archivo-${n}.pdf`,
    artefacto: 'uuid-artefacto',
    versionRepositorioArtefacto: 'uuid-vrepo',
    nombreDocumento: `Documento ${n}`,
    repositorio: 'uuid-repo',
    nombreRepositorio: `Repositorio ${n}`,
  };
}

function consulta(parcial: Record<string, unknown>) {
  hookMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    ...parcial,
  } as never);
}

function renderizar(onCerrar = vi.fn(), entregable = ENTREGABLE) {
  render(<ArtefactosEntregablePanel entregable={entregable} onCerrar={onCerrar} />);
  return onCerrar;
}

describe('ArtefactosEntregablePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDescargarVersionRepositorio).mockReturnValue({
      descargar,
      descargando: false,
    });
  });

  it('consulta el entregable y lista nombre, repositorio y ubicación de cada artefacto en orden', () => {
    // Arrange
    consulta({ data: [artefacto(1), artefacto(2)] });

    // Act
    renderizar();

    // Assert
    expect(hookMock).toHaveBeenCalledWith('e-1');
    expect(screen.getByText('Sistema de riego · Versión 3')).toBeInTheDocument();
    const items = within(
      screen.getByRole('list', { name: 'Artefactos del entregable' }),
    ).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Documento 1');
    expect(items[0]).toHaveTextContent('Repositorio: Repositorio 1');
    expect(items[0]).toHaveTextContent('Ubicación del archivo: docs/archivo-1.pdf');
    expect(items[1]).toHaveTextContent('Documento 2');
    expect(screen.queryByText(/uuid-/)).not.toBeInTheDocument();
  });

  it('con lista vacía muestra el vacío y no un error', () => {
    // Arrange
    consulta({ data: [] });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Este entregable no tiene documentos')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con lista vacía sugiere cancelar solo cuando el entregable está nuevo', () => {
    // Arrange
    const sugerencia = 'Puedes cancelarlo desde la lista de entregables y generar uno nuevo.';
    consulta({ data: [] });

    // Act
    renderizar();

    // Assert
    expect(screen.queryByText(sugerencia)).not.toBeInTheDocument();

    // Act
    renderizar(vi.fn(), { ...ENTREGABLE, estadoEntregable: { id: 'NUEVO', nombre: 'Nuevo' } });

    // Assert
    expect(screen.getByText(sugerencia)).toBeInTheDocument();
  });

  it('muestra la versión de cada artefacto del entregable', () => {
    // Arrange
    consulta({ data: [artefacto(1), artefacto(2)] });

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Versión 1')).toBeInTheDocument();
    expect(screen.getByText('Versión 2')).toBeInTheDocument();
  });

  it('mientras carga muestra el esqueleto accesible', () => {
    // Arrange
    consulta({ isLoading: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: 'Artefactos del entregable' }),
    ).not.toBeInTheDocument();
  });

  it('ante un error muestra el estado de error y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consulta({ isError: true, error: new Error('fallo') });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los artefactos');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('el botón de cierre llama a onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    consulta({ data: [] });
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con proyecto activo cada artefacto se descarga con su versión y nombre de documento', async () => {
    // Arrange
    const user = userEvent.setup();
    consulta({ data: [artefacto(1)] });
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Descargar Documento 1' }));

    // Assert
    expect(useDescargarVersionRepositorio).toHaveBeenCalledWith('artefacto');
    expect(descargar).toHaveBeenCalledWith('uuid-version', 'Documento 1');
    expect(screen.queryByText(/ya no están disponibles/)).not.toBeInTheDocument();
  });

  it('con proyecto finalizado lista los artefactos sin descarga y explica el motivo', () => {
    // Arrange
    consulta({ data: [artefacto(1)] });

    // Act
    renderizar(vi.fn(), { ...ENTREGABLE, proyectoFinalizado: true });

    // Assert
    expect(screen.getByText('Documento 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();
    expect(screen.getByText(/ya no están disponibles para descargar/)).toBeInTheDocument();
  });
});

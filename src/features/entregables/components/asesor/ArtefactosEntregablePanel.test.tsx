import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useArtefactosEntregable } from '../../hooks/useArtefactosEntregable';
import type { ArtefactoEntregable } from '../../models/ArtefactoEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import ArtefactosEntregablePanel from './ArtefactosEntregablePanel';

vi.mock('../../hooks/useArtefactosEntregable', () => ({ useArtefactosEntregable: vi.fn() }));

const hookMock = vi.mocked(useArtefactosEntregable);
const refetch = vi.fn();

const ENTREGABLE: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 3,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
};

function artefacto(n: number): ArtefactoEntregable {
  return {
    id: `id-${n}`,
    entregableProyectoGrado: 'uuid-entregable',
    versionArtefacto: 'uuid-version',
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

function renderizar(onCerrar = vi.fn()) {
  render(<ArtefactosEntregablePanel entregable={ENTREGABLE} onCerrar={onCerrar} />);
  return onCerrar;
}

describe('ArtefactosEntregablePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByText('Este entregable aún no tiene artefactos')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
});

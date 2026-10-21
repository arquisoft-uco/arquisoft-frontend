import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useModificarObservacionItem } from '../../hooks/useModificarObservacionItem';
import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import { useRemoverObservacionItem } from '../../hooks/useRemoverObservacionItem';
import ObservacionesFichaAsesorPanel from './ObservacionesFichaAsesorPanel';

vi.mock('../../hooks/useObservacionesFichaAsesor', () => ({
  useObservacionesFichaAsesor: vi.fn(),
}));

vi.mock('../../hooks/useModificarObservacionItem', () => ({
  useModificarObservacionItem: vi.fn(),
}));

vi.mock('../../hooks/useRemoverObservacionItem', () => ({
  useRemoverObservacionItem: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Resultado = ReturnType<typeof useObservacionesFichaAsesor>;

function fila(id: string, nombreItem: string, revisionCerrada: boolean) {
  return {
    observacion: {
      id,
      revisionItemId: `r-${id}`,
      observacion: `Texto ${id}`,
      estadoId: 'PENDIENTE',
      estadoNombre: 'Pendiente',
    },
    item: {
      id: `i-${id}`,
      fichaPerfilId: 'f-1',
      tipoItem: { id: 't-1', nombre: nombreItem },
      contenido: 'Contenido',
    },
    revisionCerrada,
  };
}

type Opciones = { onSuccess?: () => void; onError?: (err: unknown) => void };

function conFilas(filas: Resultado['filas'], page = 0, goToPage = vi.fn()) {
  vi.mocked(useObservacionesFichaAsesor).mockReturnValue({
    filas,
    totalElements: filas.length,
    totalPages: 1,
    page,
    pageSize: 10,
    goToPage,
    direccion: undefined,
    ordenar: vi.fn(),
    sinObservables: false,
    isLoading: false,
    isError: false,
    error: null,
    reintentar: vi.fn(),
  });
  const mutacion: Partial<Record<keyof ReturnType<typeof useModificarObservacionItem>, unknown>> = {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
  };
  vi.mocked(useModificarObservacionItem).mockReturnValue(
    mutacion as ReturnType<typeof useModificarObservacionItem>,
  );
}

function conRemover(mutate = vi.fn()) {
  const resultado: Partial<Record<keyof ReturnType<typeof useRemoverObservacionItem>, unknown>> = {
    mutate,
    isPending: false,
    variables: undefined,
  };
  vi.mocked(useRemoverObservacionItem).mockReturnValue(
    resultado as ReturnType<typeof useRemoverObservacionItem>,
  );
  return mutate;
}

async function pedirRemover(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getAllByRole('button', { name: /Acciones de la observación de Objetivo general/ })[0],
  );
  await user.click(screen.getByRole('menuitem', { name: 'Remover observación' }));
}

describe('ObservacionesFichaAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conRemover();
  });

  it('consulta las observaciones de la ficha y renderiza sus filas', () => {
    // Arrange
    vi.mocked(useObservacionesFichaAsesor).mockReturnValue({
      filas: [
        {
          observacion: {
            id: 'o-1',
            revisionItemId: 'r-1',
            observacion: 'Ajustar el alcance',
            estadoId: 'EN_PROGRESO',
            estadoNombre: 'En progreso',
          },
          item: {
            id: 'i-1',
            fichaPerfilId: 'f-1',
            tipoItem: { id: 't-1', nombre: 'Objetivo general' },
            contenido: 'Medir el impacto',
          },
          revisionCerrada: false,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      pageSize: 10,
      goToPage: vi.fn(),
      direccion: undefined,
      ordenar: vi.fn(),
      sinObservables: false,
      isLoading: false,
      isError: false,
      error: null,
      reintentar: vi.fn(),
    });

    // Act
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(useObservacionesFichaAsesor).toHaveBeenCalledWith('f-1');
    expect(screen.getAllByText('Ajustar el alcance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0);
  });

  it('ofrece Editar observación solo en filas de revisión abierta y la elección abre el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    conFilas([fila('1', 'Objetivo general', false), fila('2', 'Alcance', true)]);
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(
      screen.getAllByRole('button', { name: /Acciones de la observación de Objetivo general/ })
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole('button', { name: /Acciones de la observación de Alcance/ }),
    ).not.toBeInTheDocument();

    // Act
    await user.click(
      screen.getAllByRole('button', { name: /Acciones de la observación de Objetivo general/ })[0],
    );
    await user.click(screen.getByRole('menuitem', { name: 'Editar observación' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Editar observación' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Observación' })).toHaveValue('Texto 1');
  });

  it('Remover observación abre la confirmación sin enviar nada y cancelar no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = conRemover();
    conFilas([fila('1', 'Objetivo general', false)]);
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await pedirRemover(user);

    // Assert
    expect(
      screen.getByRole('alertdialog', { name: '¿Remover esta observación?' }),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar remueve la observación, avisa del éxito y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = conRemover(vi.fn((_id: string, opts: Opciones) => opts.onSuccess?.()));
    conFilas([fila('1', 'Objetivo general', false), fila('2', 'Alcance', false)]);
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await pedirRemover(user);
    await user.click(screen.getByRole('button', { name: 'Remover observación' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toBe('1');
    expect(toast.success).toHaveBeenCalledWith('Observación removida');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('retrocede una página al remover la única fila de una página que no es la primera', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    conRemover(vi.fn((_id: string, opts: Opciones) => opts.onSuccess?.()));
    conFilas([fila('1', 'Objetivo general', false)], 1, goToPage);
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await pedirRemover(user);
    await user.click(screen.getByRole('button', { name: 'Remover observación' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(0);
  });

  it.each([
    ['REVISION_ITEM_CERRADA', 'La revisión está cerrada y ya no admite cambios.'],
    ['OBSERVACION_ITEM_NO_ENCONTRADA', 'La observación ya no existe.'],
  ])('ante %s avisa con el motivo y cierra el diálogo', async (errorCode, motivo) => {
    // Arrange
    const user = userEvent.setup();
    conRemover(
      vi.fn((_id: string, opts: Opciones) =>
        opts.onError?.(errorApi(422, { errorCode, message: 'backend' })),
      ),
    );
    conFilas([fila('1', 'Objetivo general', false)]);
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await pedirRemover(user);
    await user.click(screen.getByRole('button', { name: 'Remover observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo remover la observación', motivo);
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('una fila con revisión cerrada no ofrece ninguna acción', () => {
    // Arrange
    conFilas([fila('2', 'Alcance', true)]);

    // Act
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(
      screen.queryByRole('button', { name: /Acciones de la observación/ }),
    ).not.toBeInTheDocument();
  });
});

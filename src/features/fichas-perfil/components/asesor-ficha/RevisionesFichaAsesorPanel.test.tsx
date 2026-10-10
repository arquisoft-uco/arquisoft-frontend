import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { errorApi } from '../../../../test-utils/errores-api';
import { useRemoverRevisionItem } from '../../hooks/useRemoverRevisionItem';
import { useRevisionesFichaAsesor } from '../../hooks/useRevisionesFichaAsesor';
import RevisionesFichaAsesorPanel from './RevisionesFichaAsesorPanel';

vi.mock('../../hooks/useRevisionesFichaAsesor', () => ({ useRevisionesFichaAsesor: vi.fn() }));
vi.mock('../../hooks/useRemoverRevisionItem', () => ({ useRemoverRevisionItem: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const mutate = vi.fn();

function conMutacion(parcial: Partial<ReturnType<typeof useRemoverRevisionItem>> = {}) {
  const mutacion = { mutate, isPending: false, variables: undefined, ...parcial };
  vi.mocked(useRemoverRevisionItem).mockReturnValue(
    mutacion as ReturnType<typeof useRemoverRevisionItem>,
  );
}

function conRevisiones(parcial: Partial<ReturnType<typeof useRevisionesFichaAsesor>>) {
  vi.mocked(useRevisionesFichaAsesor).mockReturnValue({
    filas: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    direccion: undefined,
    ordenar: vi.fn(),
    sinItems: false,
    isLoading: false,
    isError: false,
    error: null,
    reintentar: vi.fn(),
    ...parcial,
  });
}

const FILA = {
  revision: {
    id: 'r-1',
    itemId: 'i-1',
    estadoId: 'NUEVA',
    estadoNombre: 'Nueva',
    fechaCreacion: '2026-09-01T10:00:00Z',
  },
  item: {
    id: 'i-1',
    fichaPerfilId: 'f-1',
    tipoItem: { id: 't-1', nombre: 'Objetivo general' },
    contenido: 'Medir el impacto',
  },
};

describe('RevisionesFichaAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conMutacion();
  });

  it('con la ficha sin revisiones muestra el vacío del asesor', () => {
    // Arrange
    conRevisiones({ sinItems: true });

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene revisiones')).toBeInTheDocument();
    expect(useRevisionesFichaAsesor).toHaveBeenCalledWith('f-1');
  });

  it('lista la revisión con el tipo de ítem, el estado y la fecha', () => {
    // Arrange
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getAllByText('Objetivo general').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nueva').length).toBeGreaterThan(0);
    expect(screen.queryByText('Esta ficha aún no tiene revisiones')).not.toBeInTheDocument();
  });

  it('ante un error ofrece reintentar', async () => {
    // Arrange
    const reintentar = vi.fn();
    conRevisiones({ isError: true, reintentar });
    const user = userEvent.setup();

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByText('No pudimos cargar las revisiones')).toBeInTheDocument();
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('ofrece remover la revisión no cerrada y no la cerrada', () => {
    // Arrange
    const cerrada = {
      ...FILA,
      revision: { ...FILA.revision, id: 'r-2', estadoId: 'CERRADA', estadoNombre: 'Cerrada' },
      item: { ...FILA.item, id: 'i-2', tipoItem: { id: 't-2', nombre: 'Alcance' } },
    };
    conRevisiones({ filas: [FILA, cerrada], totalElements: 2, totalPages: 1 });

    // Act
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(
      screen.getAllByRole('button', { name: /Remover la revisión de Objetivo general/ }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole('button', { name: /Remover la revisión de Alcance/ }),
    ).not.toBeInTheDocument();
  });

  it('pedir remover abre la confirmación con el aviso y Cancelar la cierra sin mutar', async () => {
    // Arrange
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });
    const user = userEvent.setup();
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getAllByRole('button', { name: /Remover la revisión de/ })[0]);

    // Assert
    expect(screen.getByText('¿Remover esta revisión?')).toBeInTheDocument();
    expect(screen.getByText('Se borran también sus observaciones.')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByText('¿Remover esta revisión?')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('confirmar remueve la revisión por su id y avisa del éxito', async () => {
    // Arrange
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });
    mutate.mockImplementation((_id, opciones) => opciones.onSuccess());
    const user = userEvent.setup();
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getAllByRole('button', { name: /Remover la revisión de/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Remover revisión' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toBe('r-1');
    expect(toast.success).toHaveBeenCalledWith('Revisión removida');
    expect(screen.queryByText('¿Remover esta revisión?')).not.toBeInTheDocument();
  });

  it('un 422 REVISION_ITEM_CERRADA avisa del error con el motivo', async () => {
    // Arrange
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });
    const error = errorApi(422, { errorCode: 'REVISION_ITEM_CERRADA', message: 'backend' });
    mutate.mockImplementation((_id, opciones) => opciones.onError(error));
    const user = userEvent.setup();
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getAllByRole('button', { name: /Remover la revisión de/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Remover revisión' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo remover la revisión',
      'La revisión está cerrada y ya no admite cambios.',
    );
  });

  it('al remover la única fila de una página posterior vuelve a la página anterior', async () => {
    // Arrange
    const goToPage = vi.fn();
    conRevisiones({ filas: [FILA], totalElements: 11, totalPages: 2, page: 1, goToPage });
    mutate.mockImplementation((_id, opciones) => opciones.onSuccess());
    const user = userEvent.setup();
    render(<RevisionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getAllByRole('button', { name: /Remover la revisión de/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Remover revisión' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(0);
  });
});

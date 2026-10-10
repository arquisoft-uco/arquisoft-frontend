import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { errorApi } from '../../../../test-utils/errores-api';
import { useMarcarRevisionItemVisualizada } from '../../hooks/useMarcarRevisionItemVisualizada';
import { useRevisionesMiFicha } from '../../hooks/useRevisionesMiFicha';
import RevisionesMiFichaPanel from './RevisionesMiFichaPanel';

vi.mock('../../hooks/useMarcarRevisionItemVisualizada', () => ({
  useMarcarRevisionItemVisualizada: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('../../hooks/useRevisionesMiFicha', () => ({ useRevisionesMiFicha: vi.fn() }));

function conRevisiones(parcial: Partial<ReturnType<typeof useRevisionesMiFicha>>) {
  vi.mocked(useRevisionesMiFicha).mockReturnValue({
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

type Opciones = Parameters<ReturnType<typeof useMarcarRevisionItemVisualizada>['mutate']>[1];

function conMutacion(parcial: Partial<ReturnType<typeof useMarcarRevisionItemVisualizada>> = {}) {
  const mutacion = { mutate: vi.fn(), isPending: false, variables: undefined, ...parcial };
  vi.mocked(useMarcarRevisionItemVisualizada).mockReturnValue(
    mutacion as ReturnType<typeof useMarcarRevisionItemVisualizada>,
  );
  return mutacion;
}

const FILA = {
  revision: {
    id: 'r-1',
    itemId: 'i-1',
    estadoId: 'CERRADA',
    estadoNombre: 'Cerrada',
    fechaCreacion: '2026-09-01T10:00:00Z',
  },
  item: {
    id: 'i-1',
    fichaPerfilId: 'f-1',
    tipoItem: { id: 't-1', nombre: 'Objetivo general' },
    contenido: 'Medir el impacto',
  },
};

describe('RevisionesMiFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conMutacion();
  });

  it('muestra el estado de carga y no pinta el vacío', () => {
    // Arrange
    conRevisiones({ isLoading: true });

    // Act
    render(<RevisionesMiFichaPanel />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando revisiones…');
    expect(screen.queryByText('Tu ficha aún no tiene revisiones')).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const reintentar = vi.fn();
    conRevisiones({ isError: true, error: new Error('fallo'), reintentar });
    render(<RevisionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las revisiones');
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('sin ítems muestra el texto de vacío y no una alerta', () => {
    // Arrange
    conRevisiones({ sinItems: true });

    // Act
    render(<RevisionesMiFichaPanel />);

    // Assert
    expect(screen.getByText('Tu ficha aún no tiene revisiones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lista cada revisión con ítem, estado y fecha, y «Ítem no disponible» si no hay cruce', () => {
    // Arrange
    conRevisiones({
      filas: [FILA, { revision: { ...FILA.revision, id: 'r-2' }, item: undefined }],
      totalElements: 2,
      totalPages: 1,
    });

    // Act
    render(<RevisionesMiFichaPanel />);

    // Assert
    expect(screen.getAllByText('Objetivo general').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Medir el impacto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cerrada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ítem no disponible').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/2026/).length).toBeGreaterThan(0);
  });

  it('la cabecera «Estado» ordena ascendente y, si ya está ascendente, descendente', async () => {
    // Arrange
    const user = userEvent.setup();
    const ordenar = vi.fn();
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1, ordenar });
    const { rerender } = render(<RevisionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: /^Estado/ }));
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1, ordenar, direccion: 'ASC' });
    rerender(<RevisionesMiFichaPanel />);
    await user.click(screen.getByRole('button', { name: /^Estado/ }));

    // Assert
    expect(ordenar).toHaveBeenNthCalledWith(1, 'ASC');
    expect(ordenar).toHaveBeenNthCalledWith(2, 'DESC');
  });

  it('el paginador aparece solo con más de una página y navega con goToPage', async () => {
    // Arrange
    const user = userEvent.setup();
    const goToPage = vi.fn();
    conRevisiones({ filas: [FILA], totalElements: 1, totalPages: 1 });
    const { rerender } = render(<RevisionesMiFichaPanel />);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
    conRevisiones({ filas: [FILA], totalElements: 25, totalPages: 3, goToPage });
    rerender(<RevisionesMiFichaPanel />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
  });

  describe('marcar como visualizada', () => {
    const NUEVA = {
      ...FILA,
      revision: { ...FILA.revision, id: 'r-nueva', estadoId: 'NUEVA', estadoNombre: 'Nueva' },
    };
    const VISUALIZADA = {
      ...FILA,
      revision: { ...FILA.revision, id: 'r-vis', estadoId: 'VISUALIZADA' },
      item: { ...FILA.item, tipoItem: { id: 't-2', nombre: 'Alcance' } },
    };

    it('ofrece el botón solo en las filas «Nueva» y no en las demás', () => {
      // Arrange
      conRevisiones({ filas: [NUEVA, VISUALIZADA, FILA], totalElements: 3, totalPages: 1 });

      // Act
      render(<RevisionesMiFichaPanel />);

      // Assert
      expect(
        screen.getAllByRole('button', {
          name: 'Marcar como visualizada la revisión de Objetivo general',
        }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.queryByRole('button', { name: /la revisión de Alcance/ }),
      ).not.toBeInTheDocument();
    });

    it('al pulsar llama a la mutación con el id de la revisión y al éxito avisa con un toast', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutacion = conMutacion({
        mutate: vi.fn((_id: string, opts?: Opciones) =>
          opts?.onSuccess?.(undefined, 'r-nueva', undefined, {} as never),
        ),
      });
      conRevisiones({ filas: [NUEVA], totalElements: 1, totalPages: 1 });
      render(<RevisionesMiFichaPanel />);

      // Act
      await user.click(screen.getAllByRole('button', { name: /^Marcar como visualizada/ })[0]);

      // Assert
      expect(mutacion.mutate).toHaveBeenCalledWith('r-nueva', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Revisión marcada como visualizada');
    });

    it('cada código de error y el respaldo muestran su mensaje en un toast de error', async () => {
      // Arrange
      const user = userEvent.setup();
      const errores = [
        errorApi(422, { errorCode: 'REVISION_ITEM_NO_ENCONTRADA', message: 'backend' }),
        errorApi(422, { errorCode: 'FICHA_NO_PROPIETARIO', message: 'backend' }),
        errorApi(422, { errorCode: 'REVISION_ITEM_CERRADA', message: 'backend' }),
        new Error('sin red'),
      ];
      const mutate = vi.fn();
      for (const error of errores) {
        mutate.mockImplementationOnce((_id: string, opts?: Opciones) =>
          opts?.onError?.(error as never, 'r-nueva', undefined, {} as never),
        );
      }
      conMutacion({ mutate });
      conRevisiones({ filas: [NUEVA], totalElements: 1, totalPages: 1 });
      render(<RevisionesMiFichaPanel />);
      const mensajes: unknown[] = [];

      // Act
      for (let i = 0; i < errores.length; i += 1) {
        await user.click(screen.getAllByRole('button', { name: /^Marcar como visualizada/ })[0]);
        mensajes.push(vi.mocked(toast.error).mock.lastCall?.[1]);
      }

      // Assert
      expect(mensajes).toEqual([
        'La revisión ya no existe.',
        'Esta revisión no pertenece a tu ficha.',
        'La revisión está cerrada y ya no admite cambios.',
        'No se pudo marcar la revisión como visualizada.',
      ]);
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('con la mutación en curso deshabilita solo el botón de esa fila', () => {
      // Arrange
      const OTRA = {
        revision: { ...NUEVA.revision, id: 'r-otra' },
        item: { ...FILA.item, tipoItem: { id: 't-2', nombre: 'Alcance' } },
      };
      conMutacion({ isPending: true, variables: 'r-nueva' });
      conRevisiones({ filas: [NUEVA, OTRA], totalElements: 2, totalPages: 1 });

      // Act
      render(<RevisionesMiFichaPanel />);

      // Assert
      for (const boton of screen.getAllByRole('button', { name: /revisión de Objetivo general/ })) {
        expect(boton).toBeDisabled();
      }
      for (const boton of screen.getAllByRole('button', { name: /revisión de Alcance/ })) {
        expect(boton).toBeEnabled();
      }
    });
  });
});

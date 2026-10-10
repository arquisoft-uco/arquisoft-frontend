import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ItemsFichaAsesorPanel from './ItemsFichaAsesorPanel';
import { useItemsFichaAsesor } from '../../hooks/useItemsFichaAsesor';
import { toast } from '../../../../shared/hooks/useToast';
import { errorApi } from '../../../../test-utils/errores-api';
import { useAgregarRevisionItem } from '../../hooks/useAgregarRevisionItem';
import { useRevisionesPorItemAsesor } from '../../hooks/useRevisionesPorItemAsesor';
import type { Item } from '../../models/fichas-perfil';
import type { RevisionItem } from '../../models/RevisionItem';

vi.mock('../../hooks/useTiposItem', () => ({ useTiposItem: vi.fn() }));
vi.mock('../../hooks/useItemsFichaAsesor', () => ({
  useItemsFichaAsesor: vi.fn(),
}));
vi.mock('../../hooks/useRevisionesPorItemAsesor', () => ({
  useRevisionesPorItemAsesor: vi.fn(),
}));
vi.mock('../../hooks/useAgregarRevisionItem', () => ({ useAgregarRevisionItem: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

type Opciones = Parameters<ReturnType<typeof useAgregarRevisionItem>['mutate']>[1];
const RESPUESTA = { id: 'r-9' };

const REVISION: RevisionItem = {
  id: 'r-1',
  itemId: 'i-2',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
  fechaCreacion: '2026-09-01T10:00:00Z',
};

function conRevisiones(revisiones: RevisionItem[] = [], isLoading = false) {
  vi.mocked(useRevisionesPorItemAsesor).mockReturnValue({
    revisionPorItem: new Map(revisiones.map((r) => [r.itemId, r])),
    isLoading,
    isError: false,
  });
}

function conMutacion(parcial: Partial<ReturnType<typeof useAgregarRevisionItem>> = {}) {
  const mutacion = { mutate: vi.fn(), isPending: false, variables: undefined, ...parcial };
  vi.mocked(useAgregarRevisionItem).mockReturnValue(
    mutacion as ReturnType<typeof useAgregarRevisionItem>,
  );
  return mutacion;
}

function crearHookMock(
  parcial: Partial<ReturnType<typeof useItemsFichaAsesor>> = {},
): ReturnType<typeof useItemsFichaAsesor> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useItemsFichaAsesor>;
}

const ITEM_1: Item = {
  id: 'i-1',
  tipoItem: { id: 't-1', nombre: 'Habilidad técnica' },
  contenido: 'React y TypeScript',
  fichaPerfilId: 'f-1',
};

const ITEM_2: Item = {
  id: 'i-2',
  tipoItem: { id: 't-2', nombre: 'Idioma' },
  contenido: 'Inglés B2',
  fichaPerfilId: 'f-1',
};

describe('ItemsFichaAsesorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useItemsFichaAsesor).mockReset();
    conRevisiones();
    conMutacion();
  });

  it('consulta los ítems de la ficha indicada y muestra la carga accesible', () => {
    // Arrange
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ isLoading: true }));

    // Act
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(useItemsFichaAsesor).toHaveBeenCalledWith('f-1');
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems…');
  });

  it('cuando la consulta falla avisa y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = crearHookMock({ isError: true });
    vi.mocked(useItemsFichaAsesor).mockReturnValue(hook);
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los ítems');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío cuando la ficha no tiene ítems', () => {
    // Arrange
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [] }));

    // Act
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene ítems.')).toBeInTheDocument();
  });

  it('lista cada ítem con su tipo y su contenido, y ofrece la ayuda de tipos de ítem', () => {
    // Arrange
    vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [ITEM_1, ITEM_2] }));

    // Act
    render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Habilidad técnica')).toBeInTheDocument();
    expect(screen.getByText('React y TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Idioma')).toBeInTheDocument();
    expect(screen.getByText('Inglés B2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '¿Qué tipos de ítem existen?' })).toBeInTheDocument();
  });

  describe('agregar revisión', () => {
    beforeEach(() => {
      vi.mocked(useItemsFichaAsesor).mockReturnValue(crearHookMock({ data: [ITEM_1, ITEM_2] }));
    });

    it('ofrece el botón en el ítem sin revisión y la insignia del estado en el que ya la tiene', () => {
      // Arrange
      conRevisiones([REVISION]);

      // Act
      render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

      // Assert
      expect(
        screen.getByRole('button', { name: 'Agregar revisión al ítem Habilidad técnica' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Agregar revisión al ítem Idioma' }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Nueva')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Agregar revisión al ítem/ })).toHaveLength(1);
      expect(within(screen.getAllByRole('listitem')[1]).queryByRole('button')).toBeNull();
    });

    it('al pulsar llama a la mutación con el id del ítem y al éxito avisa con un toast', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutacion = conMutacion({
        mutate: vi.fn((_id: string, opts?: Opciones) =>
          opts?.onSuccess?.(RESPUESTA, 'i-1', undefined, {} as never),
        ),
      });
      render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

      // Act
      await user.click(
        screen.getByRole('button', { name: 'Agregar revisión al ítem Habilidad técnica' }),
      );

      // Assert
      expect(useAgregarRevisionItem).toHaveBeenCalledWith('f-1');
      expect(mutacion.mutate).toHaveBeenCalledWith('i-1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Revisión agregada', expect.any(String));
    });

    it('cada código de error del backend muestra su mensaje en un toast de error', async () => {
      // Arrange
      const user = userEvent.setup();
      const codigos = [
        'REVISION_ITEM_YA_EXISTE',
        'ITEM_NO_ENCONTRADO',
        'FICHA_NO_PERTENECE_ASESOR',
      ];
      const mutate = vi.fn();
      for (const errorCode of codigos) {
        mutate.mockImplementationOnce((_id: string, opts?: Opciones) =>
          opts?.onError?.(
            errorApi(422, { errorCode, message: 'backend' }),
            'i-1',
            undefined,
            {} as never,
          ),
        );
      }
      conMutacion({ mutate });
      render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);
      const mensajes: unknown[] = [];

      // Act
      for (let i = 0; i < codigos.length; i += 1) {
        await user.click(
          screen.getByRole('button', { name: 'Agregar revisión al ítem Habilidad técnica' }),
        );
        mensajes.push(vi.mocked(toast.error).mock.lastCall?.[1]);
      }

      // Assert
      expect(mensajes).toEqual([
        'Este ítem ya tiene una revisión.',
        'El ítem ya no existe.',
        'Esta ficha no está asignada a ti.',
      ]);
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('con la mutación en curso deshabilita el botón de ese ítem y no el de los demás', () => {
      // Arrange
      conMutacion({ isPending: true, variables: 'i-1' });

      // Act
      render(<ItemsFichaAsesorPanel fichaPerfilId="f-1" />);

      // Assert
      expect(
        screen.getByRole('button', { name: 'Agregar revisión al ítem Habilidad técnica' }),
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Agregar revisión al ítem Idioma' })).toBeEnabled();
    });
  });
});

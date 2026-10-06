import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import EstudianteView from './EstudianteView';
import { useMiFichaPerfil } from '../hooks/useMiFichaPerfil';
import { useItemsMiFicha } from '../hooks/useItemsMiFicha';
import { useEstadosFichaPerfilEstudiante } from '../hooks/useEstadosFichaPerfilEstudiante';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';

vi.mock('../hooks/useMiFichaPerfil', () => ({ useMiFichaPerfil: vi.fn() }));
vi.mock('../hooks/useItemsMiFicha', () => ({ useItemsMiFicha: vi.fn() }));
vi.mock('../hooks/useEstadosFichaPerfilEstudiante', () => ({
  useEstadosFichaPerfilEstudiante: vi.fn(),
}));
vi.mock('./TiposItemPanel', () => ({ default: () => <div>Catálogo de tipos</div> }));

type Mi = ReturnType<typeof useMiFichaPerfil>;
type Items = ReturnType<typeof useItemsMiFicha>;

const FICHA: MiFichaPerfilResponse = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
  estadoActual: {
    id: 'EN_CONSTRUCCION',
    nombre: 'En construccion',
    fechaActualizacion: '2026-09-01T10:00:00Z',
  },
  integrantes: [{ id: 'e-1', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' }],
};

const OTRA: MiFichaPerfilResponse = { ...FICHA, id: 'f-2', tituloProyecto: 'Otro proyecto' };

const ITEM = {
  id: 'i-1',
  fichaPerfilId: 'f-1',
  tipoItem: { id: 't-1', nombre: 'Objetivo' },
  contenido: 'Medir consumo',
};

function conFicha(parcial: Partial<Record<keyof Mi, unknown>> = {}) {
  vi.mocked(useMiFichaPerfil).mockReturnValue({
    ficha: FICHA,
    fichas: [FICHA],
    cargada: true,
    errorFicha: false,
    sinFicha: false,
    seleccionarFicha: vi.fn(),
    reintentar: vi.fn(),
    modificarTitulo: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    ...parcial,
  } as Mi);
}

function conItems(parcial: Partial<Record<keyof Items, unknown>> = {}) {
  vi.mocked(useItemsMiFicha).mockReturnValue({
    fichaId: 'f-1',
    items: [ITEM],
    tiposItem: [],
    itemsCargados: true,
    isLoading: false,
    isError: false,
    cargandoTipos: false,
    errorTipos: false,
    refetch: vi.fn(),
    agregar: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    modificar: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    remover: { mutate: vi.fn(), reset: vi.fn(), isPending: false },
    ...parcial,
  } as Items);
}

describe('EstudianteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conItems();
    vi.mocked(useEstadosFichaPerfilEstudiante).mockReturnValue({
      historial: [],
      isLoading: false,
      cargado: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      fichaPerfilIdDisponible: true,
    });
  });

  it('con la consulta pausada (sin datos ni error) muestra la carga y nunca «Aún no tienes una ficha»', () => {
    // Arrange
    conFicha({ ficha: undefined, fichas: [], cargada: false, sinFicha: false });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu ficha…');
    expect(screen.queryByText('Aún no tienes una ficha de perfil')).not.toBeInTheDocument();
  });

  it('sin ficha asignada muestra el vacío y sin acción', () => {
    // Arrange
    conFicha({ ficha: undefined, fichas: [], sinFicha: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Aún no tienes una ficha de perfil')).toBeInTheDocument();
    expect(
      screen.getByText('Cuando tu coordinador te asigne a una, aparecerá aquí.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a pedir la ficha', async () => {
    // Arrange
    const user = userEvent.setup();
    const reintentar = vi.fn();
    conFicha({ ficha: undefined, fichas: [], cargada: false, errorFicha: true, reintentar });
    render(<EstudianteView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu ficha de perfil');
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('muestra la cabecera con título, estado y «Editar título», y el resumen con estado, asesor y equipo', () => {
    // Arrange
    conFicha();

    // Act
    render(<EstudianteView />);

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sistema de monitoreo' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar título' })).toBeInTheDocument();
    const resumen = screen.getByRole('complementary', { name: 'Resumen de la ficha' });
    expect(within(resumen).getByText('En construccion')).toBeInTheDocument();
    expect(within(resumen).getByText('Ana Ruiz')).toBeInTheDocument();
    expect(within(resumen).getByRole('list', { name: 'Equipo de la ficha' })).toHaveTextContent(
      'Luis Pérez',
    );
  });

  it('solo hay dos pestañas, con contador de ítems una vez cargados, y se cambia con el teclado', async () => {
    // Arrange
    const user = userEvent.setup();
    conFicha();
    render(<EstudianteView />);

    // Assert
    const pestanas = screen.getAllByRole('tab');
    expect(pestanas.map((p) => p.textContent)).toEqual(['Ítems1', 'Historial de estados']);
    expect(
      screen.queryByRole('tab', { name: /Revisiones|Evaluaciones|Tipos de ítem/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Cambiar estado/)).not.toBeInTheDocument();

    // Act
    pestanas[0].focus();
    await user.keyboard('{ArrowRight}');

    // Assert
    expect(screen.getByRole('tab', { name: 'Historial de estados' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Tu ficha aún no tiene estados registrados')).toBeInTheDocument();
  });

  it('el contador de ítems no aparece mientras la lista no ha cargado', () => {
    // Arrange
    conFicha();
    conItems({ items: [], itemsCargados: false, isLoading: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getAllByRole('tab').map((p) => p.textContent)).toEqual([
      'Ítems',
      'Historial de estados',
    ]);
  });

  it('el selector de ficha aparece solo con varias fichas y cambia de ficha', async () => {
    // Arrange
    const user = userEvent.setup();
    const seleccionarFicha = vi.fn();
    conFicha();
    const { unmount } = render(<EstudianteView />);

    // Assert
    expect(screen.queryByLabelText('Ficha de perfil')).not.toBeInTheDocument();
    unmount();

    // Arrange
    conFicha({ fichas: [FICHA, OTRA], seleccionarFicha });
    render(<EstudianteView />);

    // Act
    await user.selectOptions(screen.getByLabelText('Ficha de perfil'), 'f-2');

    // Assert
    expect(seleccionarFicha).toHaveBeenCalledWith('f-2');
  });

  it('«¿Qué tipos de ítem existen?» abre la ayuda en un panel', async () => {
    // Arrange
    const user = userEvent.setup();
    conFicha();
    render(<EstudianteView />);

    // Act
    await user.click(screen.getByRole('button', { name: '¿Qué tipos de ítem existen?' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Tipos de ítem' })).toHaveTextContent(
      'Catálogo de tipos',
    );
  });

  it('«Editar título» abre el panel y guarda el nuevo título', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = vi.fn((_t: string, opts: { onSuccess?: () => void }) => opts.onSuccess?.());
    conFicha({
      modificarTitulo: { mutate, reset: vi.fn(), isPending: false },
    });
    render(<EstudianteView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar título' }));
    await user.type(screen.getByRole('textbox', { name: 'Título del proyecto' }), ' 2');
    await user.click(screen.getByRole('button', { name: 'Guardar título' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('Sistema de monitoreo 2', expect.any(Object));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

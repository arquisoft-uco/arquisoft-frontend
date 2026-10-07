import { useState, type ComponentProps } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import FilterBar from './FilterBar';
import type { OpcionFiltro, SeccionFiltro } from './FilterBar';
import type { SeccionOpciones } from './FilterBarSecciones';

type Props = ComponentProps<typeof FilterBar>;
type PropsChips = NonNullable<Props['chips']>;

const TODOS: OpcionFiltro = { id: '', etiqueta: 'Todos' };
const OPCIONES_ROL: OpcionFiltro[] = [
  { id: 'estudiante', etiqueta: 'Estudiantes' },
  { id: 'asesor', etiqueta: 'Asesores' },
];

function crearBusqueda(parcial: Partial<Props['busqueda']> = {}): Props['busqueda'] {
  return {
    valor: '',
    onCambiar: vi.fn(),
    etiqueta: 'Buscar usuarios',
    placeholder: 'Buscar por nombre, correo o identificador',
    ...parcial,
  };
}

function crearChips(parcial: Partial<PropsChips> = {}): PropsChips {
  return {
    etiqueta: 'Filtrar por rol',
    opciones: OPCIONES_ROL,
    seleccionados: [],
    onAlternar: vi.fn(),
    onTodos: vi.fn(),
    ...parcial,
  };
}

function crearSeccion(
  parcial: Partial<SeccionOpciones> & Pick<SeccionOpciones, 'id' | 'etiqueta'>,
): SeccionFiltro {
  return { opciones: [TODOS], valor: '', onCambiar: vi.fn(), ...parcial };
}

function crearProps(parcial: Partial<Props> = {}): Props {
  return { busqueda: crearBusqueda(), aplicados: [], onLimpiar: vi.fn(), ...parcial };
}

function ConChips({ onTodos }: { onTodos: () => void }) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const chips = crearChips({
    seleccionados,
    onAlternar: (id) =>
      setSeleccionados((actuales) =>
        actuales.includes(id) ? actuales.filter((actual) => actual !== id) : [...actuales, id],
      ),
    onTodos: () => {
      setSeleccionados([]);
      onTodos();
    },
  });
  return <FilterBar {...crearProps({ chips })} />;
}

function crearPropsConHoja(): Props {
  return crearProps({
    chips: crearChips(),
    popover: {
      secciones: [
        crearSeccion({
          id: 'estado',
          etiqueta: 'Estado',
          opciones: [TODOS, { id: 'ACTIVO', etiqueta: 'Activo' }],
        }),
      ],
    },
    totalResultados: 12,
  });
}

// El telón es aria-hidden y no tiene rol: se llega a él desde la hoja, su hermano siguiente.
function telonDe(hoja: HTMLElement): HTMLElement {
  const telon = hoja.nextElementSibling;
  if (!(telon instanceof HTMLElement)) throw new Error('La hoja no tiene telón');
  return telon;
}

describe('FilterBar', () => {
  afterEach(() => {
    restaurarTemporizadores();
  });

  it('el texto espera 300 ms tras la última tecla antes de avisar, y avisa una sola vez', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCambiar = vi.fn();
    render(<FilterBar {...crearProps({ busqueda: crearBusqueda({ onCambiar }) })} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar usuarios' }), 'ana');
    avanzar(299);

    // Assert
    expect(onCambiar).not.toHaveBeenCalled();

    // Act
    avanzar(1);
    avanzar(1000);

    // Assert
    expect(onCambiar).toHaveBeenCalledTimes(1);
    expect(onCambiar).toHaveBeenCalledWith('ana');
  });

  it('el ✕ vacía el campo, avisa de inmediato con texto vacío, cancela lo pendiente y devuelve el foco', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCambiar = vi.fn();
    render(<FilterBar {...crearProps({ busqueda: crearBusqueda({ onCambiar }) })} />);
    const campo = screen.getByRole('textbox', { name: 'Buscar usuarios' });
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).not.toBeInTheDocument();
    await user.type(campo, 'ana');

    // Act
    await user.click(screen.getByRole('button', { name: 'Borrar búsqueda' }));

    // Assert
    expect(campo).toHaveValue('');
    expect(campo).toHaveFocus();
    expect(onCambiar).toHaveBeenCalledTimes(1);
    expect(onCambiar).toHaveBeenLastCalledWith('');
    expect(screen.queryByRole('button', { name: 'Borrar búsqueda' })).not.toBeInTheDocument();

    // Act
    avanzar(300);

    // Assert
    expect(onCambiar).toHaveBeenCalledTimes(1);
  });

  it('refleja en el campo el texto que cambia el padre, sin volver a avisarle de él', () => {
    // Arrange
    vi.useFakeTimers();
    const onCambiar = vi.fn();
    const { rerender } = render(
      <FilterBar {...crearProps({ busqueda: crearBusqueda({ valor: 'ana', onCambiar }) })} />,
    );
    const campo = screen.getByRole('textbox', { name: 'Buscar usuarios' });
    expect(campo).toHaveValue('ana');

    // Act
    rerender(<FilterBar {...crearProps({ busqueda: crearBusqueda({ valor: '', onCambiar }) })} />);
    avanzar(300);

    // Assert
    expect(campo).toHaveValue('');
    expect(onCambiar).not.toHaveBeenCalled();
  });

  it('los chips alternan aria-pressed, avisan con su id y "Todos" avisa con onTodos', async () => {
    // Arrange
    const user = userEvent.setup();
    const onTodos = vi.fn();
    render(<ConChips onTodos={onTodos} />);
    const grupo = within(screen.getByRole('group', { name: 'Filtrar por rol' }));
    const todos = grupo.getByRole('button', { name: 'Todos' });
    const estudiantes = grupo.getByRole('button', { name: 'Estudiantes' });
    const asesores = grupo.getByRole('button', { name: 'Asesores' });

    // Assert
    expect(todos).toHaveAttribute('aria-pressed', 'true');
    expect(estudiantes).toHaveAttribute('aria-pressed', 'false');

    // Act
    await user.click(estudiantes);
    await user.click(asesores);

    // Assert
    expect(todos).toHaveAttribute('aria-pressed', 'false');
    expect(estudiantes).toHaveAttribute('aria-pressed', 'true');
    expect(asesores).toHaveAttribute('aria-pressed', 'true');

    // Act
    await user.click(estudiantes);

    // Assert
    expect(estudiantes).toHaveAttribute('aria-pressed', 'false');
    expect(asesores).toHaveAttribute('aria-pressed', 'true');

    // Act
    await user.click(todos);

    // Assert
    expect(onTodos).toHaveBeenCalledTimes(1);
    expect(todos).toHaveAttribute('aria-pressed', 'true');
    expect(asesores).toHaveAttribute('aria-pressed', 'false');
  });

  it('quitar un filtro aplicado avisa con el ✕ de ese filtro', async () => {
    // Arrange
    const user = userEvent.setup();
    const onQuitarEstado = vi.fn();
    const onQuitarVigencia = vi.fn();
    render(
      <FilterBar
        {...crearProps({
          aplicados: [
            { id: 'estado', etiqueta: 'Estado: Activo', onQuitar: onQuitarEstado },
            { id: 'vigencia', etiqueta: 'Vigencia: Vigentes', onQuitar: onQuitarVigencia },
          ],
        })}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Vigencia: Vigentes' }));

    // Assert
    expect(screen.getByText('Filtros aplicados:')).toBeInTheDocument();
    expect(onQuitarVigencia).toHaveBeenCalledTimes(1);
    expect(onQuitarEstado).not.toHaveBeenCalled();
  });

  it('"Limpiar todo" solo aparece con más de un filtro activo y descarta el borrador del buscador', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCambiar = vi.fn();
    const onLimpiar = vi.fn();
    const base = crearProps({
      busqueda: crearBusqueda({ onCambiar }),
      chips: crearChips(),
      aplicados: [{ id: 'estado', etiqueta: 'Estado: Activo', onQuitar: vi.fn() }],
      onLimpiar,
    });
    const { rerender } = render(<FilterBar {...base} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Limpiar todo' })).not.toBeInTheDocument();

    // Act
    rerender(<FilterBar {...base} chips={crearChips({ seleccionados: ['asesor'] })} />);
    await user.type(screen.getByRole('textbox', { name: 'Buscar usuarios' }), 'ana');
    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }));
    avanzar(300);

    // Assert
    expect(onLimpiar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: 'Buscar usuarios' })).toHaveValue('');
    expect(onCambiar).not.toHaveBeenCalled();
  });

  it('el popover se abre con el foco dentro y se cierra con Esc devolviendo el foco al botón, o con un clic fuera', async () => {
    // Arrange
    const user = userEvent.setup();
    const secciones = [crearSeccion({ id: 'estado', etiqueta: 'Estado' })];
    render(
      <>
        <FilterBar {...crearProps({ popover: { secciones } })} />
        <button type="button">Fuera de los filtros</button>
      </>,
    );
    const boton = screen.getByRole('button', { name: 'Filtros' });
    const fuera = screen.getByRole('button', { name: 'Fuera de los filtros' });

    // Assert
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();

    // Act
    await user.click(boton);

    // Assert
    const panel = screen.getByRole('dialog', { name: 'Filtros' });
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(boton).toHaveAttribute('aria-controls', panel.id);
    expect(panel.contains(document.activeElement)).toBe(true);

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(boton).toHaveFocus();

    // Act
    await user.click(boton);
    await user.click(fuera);

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(fuera).toHaveFocus();
  });

  it('elegir una opción de una sección avisa a esa sección y una sección deshabilitada muestra su aviso', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEstado = vi.fn();
    const onVigencia = vi.fn();
    const secciones = [
      crearSeccion({
        id: 'estado',
        etiqueta: 'Estado',
        opciones: [TODOS, { id: 'ACTIVO', etiqueta: 'Activo' }],
        onCambiar: onEstado,
        deshabilitada: true,
        aviso: <p>Los estados no están disponibles por ahora</p>,
      }),
      crearSeccion({
        id: 'vigencia',
        etiqueta: 'Vigencia',
        opciones: [
          TODOS,
          { id: 'vigente', etiqueta: 'Vigentes' },
          { id: 'baja', etiqueta: 'Dados de baja' },
        ],
        valor: 'vigente',
        onCambiar: onVigencia,
      }),
    ];
    render(<FilterBar {...crearProps({ popover: { secciones } })} />);
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    const estado = within(screen.getByRole('group', { name: 'Estado' }));
    const vigencia = within(screen.getByRole('group', { name: 'Vigencia' }));

    // Act
    await user.click(vigencia.getByRole('button', { name: 'Dados de baja' }));
    await user.click(estado.getByRole('button', { name: 'Activo' }));

    // Assert
    expect(vigencia.getByRole('button', { name: 'Vigentes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(onVigencia).toHaveBeenCalledTimes(1);
    expect(onVigencia).toHaveBeenCalledWith('baja');
    expect(estado.getByRole('button', { name: 'Activo' })).toBeDisabled();
    expect(onEstado).not.toHaveBeenCalled();
    expect(screen.getByText('Los estados no están disponibles por ahora')).toBeInTheDocument();
  });

  it('"Limpiar" limpia cada sección, "Ordenar por" cambia el orden y "Ver N resultados" cierra devolviendo el foco', async () => {
    // Arrange
    const user = userEvent.setup();
    const onEstado = vi.fn();
    const onVigencia = vi.fn();
    const onOrden = vi.fn();
    const aplicados = [{ id: 'vigencia', etiqueta: 'Vigencia: Vigentes', onQuitar: vi.fn() }];
    const base = crearProps({
      popover: {
        secciones: [
          crearSeccion({ id: 'estado', etiqueta: 'Estado', valor: 'ACTIVO', onCambiar: onEstado }),
          crearSeccion({ id: 'vigencia', etiqueta: 'Vigencia', onCambiar: onVigencia }),
        ],
      },
      orden: {
        etiqueta: 'Ordenar por',
        opciones: [
          { id: 'nombre:ASC', etiqueta: 'Nombre (A-Z)' },
          { id: 'nombre:DESC', etiqueta: 'Nombre (Z-A)' },
        ],
        valor: 'nombre:ASC',
        onCambiar: onOrden,
      },
      totalResultados: 12,
    });
    const { rerender } = render(<FilterBar {...base} />);
    const boton = screen.getByRole('button', { name: 'Filtros' });
    await user.click(boton);

    // Assert
    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeDisabled();

    // Act
    rerender(<FilterBar {...base} aplicados={aplicados} />);
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));
    await user.click(
      within(screen.getByRole('group', { name: 'Ordenar por' })).getByRole('button', {
        name: 'Nombre (Z-A)',
      }),
    );

    // Assert
    expect(onEstado).toHaveBeenCalledWith('');
    expect(onVigencia).toHaveBeenCalledWith('');
    expect(onOrden).toHaveBeenCalledTimes(1);
    expect(onOrden).toHaveBeenCalledWith('nombre:DESC');

    // Act
    rerender(<FilterBar {...base} aplicados={aplicados} totalResultados={1} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Ver 1 resultado' })).toBeInTheDocument();

    // Act
    rerender(<FilterBar {...base} aplicados={aplicados} totalResultados={undefined} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Listo' })).toBeInTheDocument();

    // Act
    rerender(<FilterBar {...base} aplicados={aplicados} />);
    await user.click(screen.getByRole('button', { name: 'Ver 12 resultados' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
  });

  it('en la hoja de celular Tab y Mayús+Tab dan la vuelta y el foco no sale hacia atrás del telón', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FilterBar {...crearPropsConHoja()} />);
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    const cerrar = screen.getByRole('button', { name: 'Cerrar filtros' });
    const ver = screen.getByRole('button', { name: 'Ver 12 resultados' });

    // Assert
    expect(cerrar).toHaveFocus();

    // Act
    await user.tab({ shift: true });

    // Assert
    expect(ver).toHaveFocus();

    // Act
    await user.tab();

    // Assert
    expect(cerrar).toHaveFocus();
  });

  it('Esc cierra la hoja con el foco en cualquier control, no solo en el botón, y devuelve el foco a «Filtros»', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FilterBar {...crearPropsConHoja()} />);
    const boton = screen.getByRole('button', { name: 'Filtros' });
    await user.click(boton);
    await user.tab();
    const chip = within(screen.getByRole('group', { name: 'Estado' })).getByRole('button', {
      name: 'Todos',
    });

    // Assert
    expect(chip).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(boton).toHaveFocus();

    // Act
    await user.click(boton);
    await user.tab({ shift: true });

    // Assert
    expect(screen.getByRole('button', { name: 'Ver 12 resultados' })).toHaveFocus();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
  });

  it('el telón cierra al soltar el clic y no al presionar, y tanto él como «Cerrar filtros» devuelven el foco a «Filtros»', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FilterBar {...crearPropsConHoja()} />);
    const boton = screen.getByRole('button', { name: 'Filtros' });
    await user.click(boton);
    // En celular el telón cubre el ✕ de un filtro aplicado y «Limpiar todo»:
    // tocarlos equivale a un clic en el telón, que es lo que se prueba aquí.
    const telon = telonDe(screen.getByRole('dialog', { name: 'Filtros' }));

    // Act
    await user.pointer({ keys: '[MouseLeft>]', target: telon });

    // Assert
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();

    // Act
    await user.pointer({ keys: '[/MouseLeft]' });

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(boton).toHaveFocus();

    // Act
    await user.click(boton);
    await user.click(screen.getByRole('button', { name: 'Cerrar filtros' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Filtros' })).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
  });
});

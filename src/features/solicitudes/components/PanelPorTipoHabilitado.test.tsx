import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '../../../test-utils/render';
import PanelPorTipoHabilitado from './PanelPorTipoHabilitado';
import {
  ID_TIPO_BACKEND,
  ID_TIPO_RECIBIDO_BACKEND,
  TIPOS_SOLICITUD_NUEVA,
  TIPOS_SOLICITUD_RECIBIDA,
} from './SelectorTipoSolicitud';
import type { TipoSolicitud } from '../models/TipoSolicitud';

const TIPOS: TipoSolicitud[] = [
  { id: 'AMPLIACION_DE_PLAZO', nombre: 'Ampliación de Plazo', descripcion: 'd' },
  { id: 'CAMBIO_DE_ASESOR', nombre: 'Cambio de Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_ASESOR', nombre: 'Novedad para el Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_COORDINADOR', nombre: 'Novedad para el Coordinador', descripcion: 'd' },
];

function crearConsulta(parcial: Partial<UseQueryResult<TipoSolicitud[]>>) {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as UseQueryResult<TipoSolicitud[]>;
}

function renderizarPanel(consulta: UseQueryResult<TipoSolicitud[]>) {
  return render(
    <PanelPorTipoHabilitado
      opciones={TIPOS_SOLICITUD_NUEVA}
      idBackend={ID_TIPO_BACKEND}
      consulta={consulta}
      renderizar={(tipo) => <p>Panel {tipo}</p>}
    />,
  );
}

describe('PanelPorTipoHabilitado', () => {
  it('con los cuatro tipos muestra los nombres del backend en el orden local y el panel del coordinador', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    renderizarPanel(crearConsulta({ data: TIPOS }));

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Novedad para el Coordinador',
      'Novedad para el Asesor',
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    expect(screen.getByText('Panel coordinador')).toBeInTheDocument();

    // Act
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de solicitud' }), 'asesor');

    // Assert
    expect(screen.getByText('Panel asesor')).toBeInTheDocument();
  });

  it('con un subconjunto sin el del coordinador ofrece solo los devueltos y elige el primero', () => {
    // Arrange
    const data = TIPOS.filter((t) => t.id !== 'NOVEDAD_PARA_EL_COORDINADOR');

    // Act
    renderizarPanel(crearConsulta({ data }));

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Novedad para el Asesor',
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    expect(screen.getByText('Panel asesor')).toBeInTheDocument();
  });

  it('ignora un id desconocido del backend sin error', () => {
    // Arrange
    const data = [
      { id: 'REGISTRO_Y_MODIFICACION_DE_USUARIOS', nombre: 'Registro', descripcion: 'd' },
      TIPOS[1],
    ];

    // Act
    renderizarPanel(crearConsulta({ data }));

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Cambio de Asesor']);
  });

  it('con la lista vacía muestra el texto por defecto y no el selector', () => {
    // Act
    renderizarPanel(crearConsulta({ data: [] }));

    // Assert
    expect(screen.getByText('No tienes tipos de solicitud habilitados')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con la lista vacía muestra el texto recibido en vacio', () => {
    // Act
    render(
      <PanelPorTipoHabilitado
        opciones={TIPOS_SOLICITUD_RECIBIDA}
        idBackend={ID_TIPO_RECIBIDO_BACKEND}
        consulta={crearConsulta({ data: [] })}
        vacio={{ titulo: 'Sin tipos para recibir', descripcion: 'Consulta con el administrador.' }}
        renderizar={(tipo) => <p>Panel {tipo}</p>}
      />,
    );

    // Assert
    expect(screen.getByText('Sin tipos para recibir')).toBeInTheDocument();
    expect(screen.getByText('Consulta con el administrador.')).toBeInTheDocument();
  });

  it('con otro mapa de ids ofrece los tipos del coordinador con el nombre del backend', () => {
    // Act
    render(
      <PanelPorTipoHabilitado
        opciones={TIPOS_SOLICITUD_RECIBIDA}
        idBackend={ID_TIPO_RECIBIDO_BACKEND}
        consulta={crearConsulta({ data: TIPOS })}
        renderizar={(tipo) => <p>Panel {tipo}</p>}
      />,
    );

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Novedad para el Coordinador',
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    expect(screen.getByText('Panel novedad')).toBeInTheDocument();
  });

  it('ante un error muestra el estado de error y Reintentar repite la consulta', async () => {
    // Arrange
    const refetch = vi.fn();
    const user = userEvent.setup();

    // Act
    renderizarPanel(crearConsulta({ isError: true, refetch }));
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No pudimos cargar los tipos de solicitud')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('mientras carga muestra el estado de carga y no el selector', () => {
    // Act
    renderizarPanel(crearConsulta({ isPending: true }));

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});

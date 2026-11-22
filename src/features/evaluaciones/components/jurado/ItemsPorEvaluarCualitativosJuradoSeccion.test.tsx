import type { ComponentProps } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useBorradorEvaluacionesCualitativasJurado } from '../../hooks/useBorradorEvaluacionesCualitativasJurado';
import ItemsPorEvaluarCualitativosJuradoSeccion from './ItemsPorEvaluarCualitativosJuradoSeccion';

vi.mock('../../hooks/useBorradorEvaluacionesCualitativasJurado', () => ({
  useBorradorEvaluacionesCualitativasJurado: vi.fn(),
}));
vi.mock('../../hooks/useCriteriosItemCualitativoJurado', () => ({
  useCriteriosItemCualitativoJurado: () => ({
    data: [{ id: 'c-1', nombre: 'Excelente', descripcion: 'Supera lo esperado' }],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

type Consulta = ComponentProps<typeof ItemsPorEvaluarCualitativosJuradoSeccion>['consulta'];

const FILA = { item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Del documento', peso: 10 } };

function consulta(parcial: Partial<Consulta> = {}): Consulta {
  return {
    filas: [{ ...FILA, pendiente: true }],
    pendientes: [FILA.item],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  };
}

function borrador(
  parcial: Partial<ReturnType<typeof useBorradorEvaluacionesCualitativasJurado>> = {},
) {
  const valor = {
    borrador: {},
    cantidad: 0,
    elegir: vi.fn(),
    registrar: vi.fn(),
    descartar: vi.fn(),
    enviando: false,
    ...parcial,
  };
  vi.mocked(useBorradorEvaluacionesCualitativasJurado).mockReturnValue(valor);
  return valor;
}

function seccion(parcial: Partial<Consulta> = {}, finalizada = false) {
  return (
    <ItemsPorEvaluarCualitativosJuradoSeccion
      evaluacionJuradoId="ej-1"
      proyecto="Sistema de monitoreo"
      consulta={consulta(parcial)}
      finalizada={finalizada}
    />
  );
}

describe('ItemsPorEvaluarCualitativosJuradoSeccion', () => {
  beforeEach(() => {
    vi.mocked(useBorradorEvaluacionesCualitativasJurado).mockReset();
  });

  it('sin selección deshabilita el registro y deja visible, enlazada, la razón', () => {
    // Arrange
    borrador();

    // Act
    render(seccion());

    // Assert
    const boton = screen.getByRole('button', { name: 'Registrar valoraciones (0)' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAccessibleDescription('Elige un criterio en al menos un ítem pendiente.');
    expect(screen.queryByRole('button', { name: 'Descartar selección' })).not.toBeInTheDocument();
  });

  it('con selección muestra el total en el botón, registra y permite descartar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = borrador({ cantidad: 2 });
    render(seccion());

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar valoraciones (2)' }));
    await user.click(screen.getByRole('button', { name: 'Descartar selección' }));

    // Assert
    expect(hook.registrar).toHaveBeenCalledTimes(1);
    expect(hook.descartar).toHaveBeenCalledTimes(1);
  });

  it('al enviar pasa a «Registrando…» ocupado y al terminar el foco va al título de la sección', () => {
    // Arrange
    borrador({ cantidad: 1, enviando: true });
    const { rerender } = render(seccion());

    // Assert
    expect(screen.getByRole('button', { name: 'Registrando…' })).toHaveAttribute(
      'aria-busy',
      'true',
    );

    // Act
    borrador({ cantidad: 0, enviando: false });
    rerender(seccion());

    // Assert
    expect(screen.getByRole('heading', { name: 'Ítems del catálogo' })).toHaveFocus();
  });

  it('con un envío fallido (la selección sigue) el foco no se mueve', () => {
    // Arrange
    borrador({ cantidad: 1, enviando: true });
    const { rerender } = render(seccion());

    // Act
    borrador({ cantidad: 1, enviando: false });
    rerender(seccion());

    // Assert
    expect(screen.getByRole('heading', { name: 'Ítems del catálogo' })).not.toHaveFocus();
  });

  it('con la evaluación finalizada o todo evaluado no ofrece registrar', () => {
    // Arrange
    borrador();
    const { rerender } = render(seccion({}, true));

    // Assert
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);

    // Act
    rerender(seccion({ filas: [{ ...FILA, pendiente: false }], pendientes: [] }));

    // Assert
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
  });

  it('si falla el catálogo muestra el error con «Reintentar» y ningún control', async () => {
    // Arrange
    const user = userEvent.setup();
    borrador();
    const refetch = vi.fn();
    render(seccion({ isError: true, error: new Error('x'), refetch }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los ítems cualitativos',
    );
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
  });
});

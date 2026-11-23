import type { ComponentProps } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useBorradorEvaluacionesCuantitativasJurado } from '../../hooks/useBorradorEvaluacionesCuantitativasJurado';
import ItemsPorEvaluarCuantitativosJuradoSeccion from './ItemsPorEvaluarCuantitativosJuradoSeccion';

vi.mock('../../hooks/useBorradorEvaluacionesCuantitativasJurado', () => ({
  useBorradorEvaluacionesCuantitativasJurado: vi.fn(),
}));

type Consulta = ComponentProps<typeof ItemsPorEvaluarCuantitativosJuradoSeccion>['consulta'];
type Borrador = ReturnType<typeof useBorradorEvaluacionesCuantitativasJurado>;

const ITEM = {
  id: 'i-1',
  nombre: 'Claridad',
  descripcion: 'Del documento',
  categoriaId: 'c-1',
  valor: 50,
};

function consulta(parcial: Partial<Consulta> = {}): Consulta {
  return {
    filas: [{ item: ITEM, pendiente: true }],
    pendientes: [ITEM],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  };
}

function borrador(parcial: Partial<Borrador> = {}) {
  const valor: Borrador = {
    borrador: {},
    errores: {},
    cantidad: 0,
    cambiar: vi.fn(),
    validarFila: vi.fn(),
    registrar: vi.fn(() => null),
    descartar: vi.fn(),
    enviando: false,
    pendientes: [],
    reintentando: false,
    reintentar: vi.fn(),
    descartarPendientes: vi.fn(),
    ...parcial,
  };
  vi.mocked(useBorradorEvaluacionesCuantitativasJurado).mockReturnValue(valor);
  return valor;
}

function seccion(parcial: Partial<Consulta> = {}, finalizada = false) {
  return (
    <ItemsPorEvaluarCuantitativosJuradoSeccion
      evaluacionJuradoId="ej-1"
      proyecto="Sistema de monitoreo"
      consulta={consulta(parcial)}
      finalizada={finalizada}
    />
  );
}

describe('ItemsPorEvaluarCuantitativosJuradoSeccion', () => {
  beforeEach(() => {
    vi.mocked(useBorradorEvaluacionesCuantitativasJurado).mockReset();
  });

  it('sin puntajes deshabilita el registro con la razón visible y con puntajes refleja el total', () => {
    // Arrange
    borrador();
    const { rerender } = render(seccion());

    // Assert
    const boton = screen.getByRole('button', { name: 'Registrar valoraciones (0)' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAccessibleDescription('Escribe el puntaje de al menos un ítem pendiente.');

    // Act
    borrador({ cantidad: 3 });
    rerender(seccion());

    // Assert
    expect(screen.getByRole('button', { name: 'Registrar valoraciones (3)' })).toBeEnabled();
  });

  it('si el registro devuelve un ítem inválido, el foco va a su puntaje', async () => {
    // Arrange
    const user = userEvent.setup();
    borrador({ cantidad: 1, registrar: vi.fn(() => 'i-1') });
    render(seccion());

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar valoraciones (1)' }));

    // Assert
    const tabla = within(screen.getByRole('table'));
    expect(tabla.getByRole('textbox', { name: 'Puntaje de Claridad' })).toHaveFocus();
  });

  it('con observaciones pendientes muestra el aviso y deja reintentar o salir sin ellas', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = borrador({
      pendientes: [{ itemId: 'i-1', descripcion: 'Falta profundidad', motivo: 'Error de red' }],
    });
    render(seccion());

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar observaciones' }));
    await user.click(screen.getByRole('button', { name: 'Salir sin ellas' }));
    await user.click(screen.getAllByRole('button', { name: 'Salir sin ellas' })[1]);

    // Assert
    expect(screen.getByText('Falta profundidad')).toBeInTheDocument();
    expect(hook.reintentar).toHaveBeenCalledTimes(1);
    expect(hook.descartarPendientes).toHaveBeenCalledTimes(1);
  });

  it('con la evaluación finalizada no ofrece registrar ni controles', () => {
    // Arrange
    borrador();

    // Act
    render(seccion({}, true));

    // Assert
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('si falla el catálogo muestra el error con «Reintentar»', async () => {
    // Arrange
    const user = userEvent.setup();
    borrador();
    const refetch = vi.fn();
    render(seccion({ isError: true, error: new Error('x'), refetch }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: /Registrar valoraciones/ }),
    ).not.toBeInTheDocument();
  });
});

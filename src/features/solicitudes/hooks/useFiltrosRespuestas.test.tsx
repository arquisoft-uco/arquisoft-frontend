import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFiltrosRespuestas } from './useFiltrosRespuestas';

function conPagina(n: number) {
  const hook = renderHook(() => useFiltrosRespuestas());
  act(() => hook.result.current.goToPage(n));
  return hook;
}

describe('useFiltrosRespuestas', () => {
  it('arranca en la página 0, sin filtros y con orden por fecha descendente', () => {
    // Act
    const { result } = renderHook(() => useFiltrosRespuestas());

    // Assert
    expect(result.current).toMatchObject({
      page: 0,
      estadoIds: [],
      ordenCampo: 'fechaRespuesta',
      ordenDireccion: 'DESC',
      hayFiltros: false,
    });
  });

  it('goToPage cambia la página y todo setter de filtro u orden la devuelve a 0', () => {
    // Arrange
    const { result } = conPagina(3);
    expect(result.current.page).toBe(3);

    // Act
    act(() => result.current.toggleEstado('APROBADA'));
    // Assert
    expect(result.current.page).toBe(0);

    // Act
    act(() => result.current.goToPage(2));
    act(() => result.current.setOrden('destinatarioNombre', 'ASC'));
    // Assert
    expect(result.current.page).toBe(0);
    expect(result.current.ordenCampo).toBe('destinatarioNombre');
    expect(result.current.ordenDireccion).toBe('ASC');

    // Act
    act(() => result.current.goToPage(2));
    act(() => result.current.limpiarFiltros());
    // Assert
    expect(result.current.page).toBe(0);
  });

  it('toggleEstado agrega y quita, y limpiarFiltros vacía los estados', () => {
    // Arrange
    const { result } = renderHook(() => useFiltrosRespuestas());

    // Act
    act(() => result.current.toggleEstado('APROBADA'));
    act(() => result.current.toggleEstado('EN_REVISION'));
    act(() => result.current.toggleEstado('APROBADA'));
    // Assert
    expect(result.current.estadoIds).toEqual(['EN_REVISION']);
    expect(result.current.hayFiltros).toBe(true);

    // Act
    act(() => result.current.limpiarFiltros());
    // Assert
    expect(result.current).toMatchObject({ estadoIds: [], hayFiltros: false });
  });
});

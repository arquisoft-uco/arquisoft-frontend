import { describe, it, expect } from 'vitest';
import { useLocation } from 'react-router';
import { act, renderHook } from '../../test-utils/render';
import { usePestanaEnUrl } from './usePestanaEnUrl';

const VALIDAS = ['items', 'revisiones', 'estados'] as const;

function renderizar(initialPath: string) {
  return renderHook(
    () => ({ pestana: usePestanaEnUrl(VALIDAS, 'items'), location: useLocation() }),
    { initialPath },
  );
}

describe('usePestanaEnUrl', () => {
  it('lee la pestaña válida de la URL y cae a la de por defecto si es inválida o falta', () => {
    // Act
    const valida = renderizar('/x?pestana=revisiones');
    const invalida = renderizar('/x?pestana=otra');
    const ausente = renderizar('/x');

    // Assert
    expect(valida.result.current.pestana[0]).toBe('revisiones');
    expect(invalida.result.current.pestana[0]).toBe('items');
    expect(ausente.result.current.pestana[0]).toBe('items');
  });

  it('al cambiar reemplaza la entrada, conserva los demás parámetros y no deja parámetro con la de por defecto', () => {
    // Arrange
    const { result } = renderizar('/x?ficha=f-1');

    // Act
    act(() => result.current.pestana[1]('estados'));

    // Assert
    expect(result.current.pestana[0]).toBe('estados');
    expect(result.current.location.search).toBe('?ficha=f-1&pestana=estados');

    // Act
    act(() => result.current.pestana[1]('items'));

    // Assert
    expect(result.current.pestana[0]).toBe('items');
    expect(result.current.location.search).toBe('?ficha=f-1');
  });
});

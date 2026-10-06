import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { act, renderHook } from '../../../test-utils/render';
import { leerOrden, useParametrosListado } from './useParametrosListado';

function montarEn(entrada: string) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[entrada]}>{children}</MemoryRouter>;
  }
  return renderHook(() => ({ hook: useParametrosListado(), url: useLocation().search }), {
    wrapper: Wrapper,
  });
}

describe('leerOrden', () => {
  it('devuelve el valor si está permitido y el por defecto si no', () => {
    // Arrange
    const permitidos = ['a:ASC', 'a:DESC'] as const;

    // Act / Assert
    expect(leerOrden('a:DESC', permitidos, 'a:ASC')).toBe('a:DESC');
    expect(leerOrden('b:DESC', permitidos, 'a:ASC')).toBe('a:ASC');
    expect(leerOrden('', permitidos, 'a:ASC')).toBe('a:ASC');
  });
});

describe('useParametrosListado', () => {
  it('lee texto, lista repetida y la página 1-based como índice 0-based', () => {
    // Act
    const { result } = montarEn('/?q=hola&estado=a&estado=b&pagina=3');

    // Assert
    expect(result.current.hook.texto('q')).toBe('hola');
    expect(result.current.hook.texto('otro')).toBe('');
    expect(result.current.hook.lista('estado')).toEqual(['a', 'b']);
    expect(result.current.hook.pagina).toBe(2);
  });

  it('una pagina ausente, no numérica o menor que 1 se lee como 0', () => {
    // Act / Assert
    expect(montarEn('/').result.current.hook.pagina).toBe(0);
    expect(montarEn('/?pagina=abc').result.current.hook.pagina).toBe(0);
    expect(montarEn('/?pagina=0').result.current.hook.pagina).toBe(0);
    expect(montarEn('/?pagina=-2').result.current.hook.pagina).toBe(0);
  });

  it('cambiar escribe valores, repite listas, borra los vacíos y borra pagina', () => {
    // Arrange
    const { result } = montarEn('/?pagina=4&q=viejo&estado=x');

    // Act
    act(() => result.current.hook.cambiar({ q: 'nuevo', estado: ['a', 'b'] }));

    // Assert
    expect(result.current.url).toBe('?q=nuevo&estado=a&estado=b');

    // Act
    act(() => result.current.hook.cambiar({ q: '', estado: [] }));

    // Assert
    expect(result.current.url).toBe('');
  });

  it('irAPagina escribe la página 1-based, conserva el resto y la borra en la primera', () => {
    // Arrange
    const { result } = montarEn('/?q=hola');

    // Act
    act(() => result.current.hook.irAPagina(2));

    // Assert
    expect(result.current.url).toBe('?q=hola&pagina=3');

    // Act
    act(() => result.current.hook.irAPagina(0));

    // Assert
    expect(result.current.url).toBe('?q=hola');
  });
});

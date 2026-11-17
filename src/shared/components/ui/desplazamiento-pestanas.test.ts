import { describe, it, expect } from 'vitest';
import { desplazamientoParaMostrar } from './desplazamiento-pestanas';

const LISTA = { left: 100, right: 500 };

describe('desplazamientoParaMostrar', () => {
  it('no desplaza si la pestaña activa cabe entera en la lista', () => {
    // Act / Assert
    expect(desplazamientoParaMostrar(LISTA, { left: 120, right: 260 })).toBe(0);
    expect(desplazamientoParaMostrar(LISTA, { left: 100, right: 500 })).toBe(0);
  });

  it('si queda cortada por la derecha, desplaza hasta su borde izquierdo', () => {
    // Act / Assert
    expect(desplazamientoParaMostrar(LISTA, { left: 450, right: 580 })).toBe(350);
  });

  it('si queda cortada por la izquierda, desplaza hacia atrás', () => {
    // Act / Assert
    expect(desplazamientoParaMostrar(LISTA, { left: 60, right: 180 })).toBe(-40);
  });
});

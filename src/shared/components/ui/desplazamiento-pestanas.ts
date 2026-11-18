interface Tramo {
  left: number;
  right: number;
}

export function desplazamientoParaMostrar(lista: Tramo, activa: Tramo): number {
  const cabeEntera = activa.left >= lista.left && activa.right <= lista.right;
  return cabeEntera ? 0 : activa.left - lista.left;
}

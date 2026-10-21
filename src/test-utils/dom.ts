// El fondo es aria-hidden y no tiene rol: se llega a él desde el diálogo, su hermano anterior.
export function fondoDe(dialogo: HTMLElement): HTMLElement {
  const fondo = dialogo.previousElementSibling;
  if (!(fondo instanceof HTMLElement)) throw new Error('El diálogo no tiene fondo');
  return fondo;
}

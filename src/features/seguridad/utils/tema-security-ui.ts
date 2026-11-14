import type { SecurityUiTema } from '../models/SecurityUi';

export function temaSecurityUi(estilos: CSSStyleDeclaration): SecurityUiTema {
  return {
    accent: estilos.getPropertyValue('--color-primary').trim(),
    fontFamily: estilos.fontFamily,
    radius: estilos.getPropertyValue('--radius-lg').trim(),
  };
}

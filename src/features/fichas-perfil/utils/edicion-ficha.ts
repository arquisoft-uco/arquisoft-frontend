export const ESTADO_FICHA_EDITABLE = 'EN_CONSTRUCCION';

// Ayuda de UX: el backend es la autoridad (422 ESTADO_FICHA_PERFIL_NO_EN_CONSTRUCCION).
export function admiteEdicionFicha(estadoId: string | undefined): boolean {
  return estadoId === ESTADO_FICHA_EDITABLE;
}

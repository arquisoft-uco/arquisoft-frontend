export const MENSAJES_VALIDACION = {
  requerido: 'Este campo es requerido',
  formatoEmail: 'Ingresa un correo electrónico válido',
  formatoUuid: 'Identificador inválido',
  seleccioneOpcion: 'Selecciona una opción',
  longitudMaxima: (max: number) => `Máximo ${max} caracteres`,
  listaVacia: 'Agrega al menos un elemento',
  listaMaxima: (max: number) => `Máximo ${max} elementos`,
} as const;

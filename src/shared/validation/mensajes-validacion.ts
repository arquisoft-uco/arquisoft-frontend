export const MENSAJES_VALIDACION = {
  requerido: 'Este campo es requerido',
  formatoEmail: 'Ingresa un correo electrónico válido',
  formatoUuid: 'Identificador inválido',
  seleccioneOpcion: 'Selecciona una opción',
  longitudMaxima: (max: number) => `Máximo ${max} caracteres`,
  longitudEntre: (min: number, max: number) => `Debe tener entre ${min} y ${max} caracteres`,
  listaVacia: 'Agrega al menos un elemento',
  elementoRepetido: 'Hay un elemento repetido',
  listaMaxima: (max: number) => `Máximo ${max} elementos`,
  soloDigitos: 'Solo se permiten dígitos',
  formatoNombre: 'Solo letras y espacios',
  valorEntre: (min: number, max: number) => `Debe estar entre ${min} y ${max}`,
  fechaInvalida: 'Ingresa una fecha válida',
  fechaFinPosterior: 'La fecha de fin debe ser posterior a la de inicio',
  archivoRequerido: 'Selecciona un archivo',
  formatoArchivo: (extensiones: readonly string[]) => {
    const nombres = extensiones.map((e) => e.toUpperCase());
    const ultimo = nombres[nombres.length - 1];
    const previos = nombres.slice(0, -1);
    return `Formato no permitido. Usa ${previos.length > 0 ? `${previos.join(', ')} o ${ultimo}` : ultimo}`;
  },
  archivoVacio: 'El archivo está vacío',
  archivoMuyGrande: (maxBytes: number) => `El archivo supera los ${maxBytes / 1_048_576} MB`,
  nombreArchivoInvalido: 'El nombre del archivo tiene caracteres no permitidos',
} as const;

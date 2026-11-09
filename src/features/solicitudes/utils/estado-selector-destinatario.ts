export type EstadoSelectorDestinatario = 'cargando' | 'vacio' | 'error' | 'listo';

interface Entrada {
  cargando: boolean;
  error: boolean;
  cantidad: number;
}

export function estadoSelectorDestinatario({
  cargando,
  error,
  cantidad,
}: Entrada): EstadoSelectorDestinatario {
  if (cargando) return 'cargando';
  if (error) return 'error';
  if (cantidad === 0) return 'vacio';
  return 'listo';
}

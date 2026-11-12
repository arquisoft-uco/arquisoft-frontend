import { Download } from 'lucide-react';
import type { AccionMenu } from './ui/RowMenu';

interface Opciones {
  onSeleccionar: () => void;
  deshabilitada?: boolean;
  etiqueta?: string;
}

export function accionDescargar({
  onSeleccionar,
  deshabilitada,
  etiqueta = 'Descargar',
}: Opciones): AccionMenu {
  return { etiqueta, icono: Download, onSeleccionar, deshabilitada };
}

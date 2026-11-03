import { Download } from 'lucide-react';
import type { AccionMenu } from './ui/RowMenu';

interface Opciones {
  onSeleccionar: () => void;
  deshabilitada?: boolean;
}

export function accionDescargar({ onSeleccionar, deshabilitada }: Opciones): AccionMenu {
  return { etiqueta: 'Descargar', icono: Download, onSeleccionar, deshabilitada };
}

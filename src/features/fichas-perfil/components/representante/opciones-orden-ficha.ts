import type { OpcionFiltro } from '../../../../shared/components/ui/FilterBar';
import type { OrdenDireccion } from '../../hooks/useFichasDisponibles';
import type { OrdenCampoFicha } from '../../models/OrdenCampoFicha';

export interface OpcionOrden extends OpcionFiltro {
  campo: OrdenCampoFicha;
  direccion: OrdenDireccion;
}

export const OPCIONES_ORDEN: OpcionOrden[] = [
  { id: 'tituloProyecto:ASC', etiqueta: 'Ficha (A-Z)', campo: 'tituloProyecto', direccion: 'ASC' },
  {
    id: 'tituloProyecto:DESC',
    etiqueta: 'Ficha (Z-A)',
    campo: 'tituloProyecto',
    direccion: 'DESC',
  },
  { id: 'asesorNombre:ASC', etiqueta: 'Asesor (A-Z)', campo: 'asesorNombre', direccion: 'ASC' },
  { id: 'asesorNombre:DESC', etiqueta: 'Asesor (Z-A)', campo: 'asesorNombre', direccion: 'DESC' },
];

import type { ProyectoGrado } from '../models/ProyectoGrado';
import type { ResumenProyectoGrado } from '../models/ResumenProyectoGrado';

export function aResumen(proyecto: ProyectoGrado): ResumenProyectoGrado {
  return {
    id: proyecto.id,
    titulo: proyecto.tituloProyecto,
    estadoId: proyecto.estado.id,
    estadoNombre: proyecto.estado.nombre,
  };
}

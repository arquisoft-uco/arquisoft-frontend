import type { FichaPerfil } from '../models/FichaPerfil';
import type { ResumenFicha } from '../models/ResumenFicha';

export function resumenDeFicha(ficha: FichaPerfil): ResumenFicha {
  return {
    id: ficha.id,
    titulo: ficha.tituloProyecto,
    estadoId: ficha.estado.id,
    estadoNombre: ficha.estado.nombre,
    fechaActualizacion: ficha.estado.fechaActualizacion,
  };
}

export function resumenConAsesor(ficha: FichaPerfil): ResumenFicha {
  return {
    ...resumenDeFicha(ficha),
    asesorId: ficha.asesorFicha.id,
    asesorNombre: ficha.asesorFicha.nombre,
    asesorEmail: ficha.asesorFicha.email,
  };
}

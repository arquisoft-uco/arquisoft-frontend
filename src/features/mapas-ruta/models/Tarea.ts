export interface Tarea {
  id: string;
  descripcion: string;
  mapaRutaId: string;
  estado: { id: string; nombre: string };
  asesor: { id: string; nombre: string; email: string };
}

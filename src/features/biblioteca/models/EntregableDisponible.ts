import type { AutorResumen } from './biblioteca';

export interface EntregableDisponible {
  id: string;
  proyectoGrado: string;
  tituloProyecto: string | null;
  versionEntregable: number;
  nombreArchivo: string;
  autores: AutorResumen[];
}

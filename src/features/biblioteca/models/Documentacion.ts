import type { AutorResumen } from './biblioteca';

export interface Documentacion {
  id: string;
  tituloProyecto: string | null;
  fechaPublicacion: string;
  entregableProyectoGrado: { id: string; versionEntregable: number };
  bibliotecario: { id: string; nombre: string };
  estadoDocumentacion: { id: string; nombre: string };
  autores: AutorResumen[];
}

export interface Documentacion {
  id: string;
  fechaPublicacion: string;
  entregableProyectoGrado: { id: string; versionEntregable: number };
  bibliotecario: { id: string; nombre: string };
  estadoDocumentacion: { id: string; nombre: string };
}

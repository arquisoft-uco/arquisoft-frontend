// ─── Reference tables ───

export interface EstadoFicha {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface EstadoEvaluacion {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface EstadoRevision {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface EstadoObservacionRevision {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface TipoItem {
  id: string;
  nombre: string;
  descripcion: string;
}

// ─── Identity ───

export interface Estudiante {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
}

export interface AsesorFicha {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
}

export interface RepresentanteComiteCurriculum {
  id: string;
  identificador: string;
  nombre: string;
  email: string;
}

// ─── Ficha Perfil ───

export interface FichaPerfil {
  id: string;
  tituloProyecto: string;
  asesorFichaId: string;
}

export interface PaginaFichasPerfil {
  content: FichaPerfil[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ─── Estudiante Ficha Perfil ───

export interface EstudianteFichaPerfil {
  id: string;
  fichaPerfilId: string;
  estudianteId: string;
}

// ─── Estado Ficha Perfil ───

export interface EstadoFichaPerfil {
  id: string;
  fichaPerfilId: string;
  estadoFichaId: string;
  fechaActualizacion: string;
}

// ─── Item ───

export interface Item {
  id: string;
  tipoItem: { id: string; nombre: string };
  contenido: string;
  fichaPerfilId: string;
}

// ─── Revisión Item ───

export interface RevisionItem {
  id: string;
  itemId: string;
  estadoRevisionId: string;
  fechaCreacion: string;
}

// ─── Observación Item ───

export interface ObservacionItem {
  id: string;
  revisionItemId: string;
  observacion: string;
  estadoObservacionRevisionId: string;
}

// ─── Evaluación Ficha Perfil ───

export interface EvaluacionFichaPerfil {
  id: string;
  representanteComiteId: string;
  fichaPerfilId: string;
  fechaCreacion: string;
  estadoActual: string;
}

// ─── Estado Evaluación Ficha ───

export interface EstadoEvaluacionFicha {
  id: string;
  evaluacionFichaPerfilId: string;
  estadoEvaluacionId: string;
  fechaActualizacion: string;
}

// ─── Observación Evaluación ───

export interface ObservacionEvaluacion {
  id: string;
  evaluacionFichaPerfilId: string;
  observacion: string;
}

// ─── Request DTOs ───

export interface CrearFichaPerfilRequest {
  tituloProyecto: string;
  asesorFichaId: string;
}

export interface ModificarFichaPerfilRequest {
  fichaPerfilId: string;
  tituloProyecto: string;
}

export interface CambiarAsesorRequest {
  nuevoAsesorFichaId: string;
}

export interface AsignarEstudianteRequest {
  estudianteId: string;
}

export interface AgregarEstadoFichaPerfilRequest {
  estadoFichaId: string;
}

export interface AgregarEstadoAprobacionRequest {
  estadoFichaId: string;
}

export interface CrearItemRequest {
  fichaPerfilId: string;
  tipoItemId: string;
  contenido: string;
}

export interface ItemCreadoResponse {
  id: string;
}

export interface ModificarItemRequest {
  itemId: string;
  contenido: string;
}

export interface CrearRevisionItemRequest {
  itemId: string;
  estadoRevisionId: string;
}

export interface ModificarRevisionItemRequest {
  estadoRevisionId: string;
}

export interface CrearObservacionItemRequest {
  revisionItemId: string;
  observacion: string;
  estadoObservacionRevisionId: string;
}

export interface CrearEvaluacionFichaPerfilRequest {
  fichaPerfilId: string;
}

export interface EvaluacionCreadaResponse {
  id: string;
  fechaCreacion: string;
  estadoActual: string;
}

export interface AgregarEstadoEvaluacionRequest {
  estadoEvaluacionId: string;
}

export interface CrearObservacionEvaluacionRequest {
  observacion: string;
}

export interface ModificarObservacionRequest {
  observacion: string;
}

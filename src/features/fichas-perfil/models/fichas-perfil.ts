// Barril de catálogos y DTOs menores de fichas-perfil.
// Las entidades y DTOs con peso propio viven en su archivo: FichaPerfil.ts, Estudiante.ts,
// AsignarEstudianteRequest.ts, EstadoFichaPerfil.ts, etc. No los dupliques aquí.

// ─── Catálogos ───

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

export interface TipoItem {
  id: string;
  nombre: string;
  descripcion: string;
}

// ─── Ítem ───

export interface Item {
  id: string;
  tipoItem: { id: string; nombre: string };
  contenido: string;
  fichaPerfilId: string;
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

// ─── Evaluación de ficha perfil ───

export interface EvaluacionFichaPerfil {
  id: string;
  fichaPerfilId: string;
  fechaCreacion: string;
  estadoEvaluacionId: string | null;
  estadoEvaluacionNombre: string | null;
}

export interface CrearEvaluacionFichaPerfilRequest {
  fichaPerfilId: string;
}

export interface EvaluacionCreadaResponse {
  id: string;
}

// ─── Estado de la evaluación ───

export interface AgregarEstadoEvaluacionRequest {
  evaluacionFichaPerfilId: string;
  estadoEvaluacionId: string;
}

export interface EstadoEvaluacionFicha {
  id: string;
}

import type { FichaDisponibleEvaluacion } from './FichaDisponibleEvaluacion';

export interface FichaPerfilRepresentante extends FichaDisponibleEvaluacion {
  evaluacionId: string;
  evaluacionEstadoId: string;
  evaluacionEstadoNombre: string;
}

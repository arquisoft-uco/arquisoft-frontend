import type { FiltrosFichasDisponibles } from './FiltrosFichasDisponibles';

export interface FiltrosFichasParticipacion extends FiltrosFichasDisponibles {
  estadoIds: string[];
}

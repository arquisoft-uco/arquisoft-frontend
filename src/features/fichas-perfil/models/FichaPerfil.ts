import type { Asesor } from '../../../shared/models/Asesor';

export interface FichaPerfil {
  id: string;
  tituloProyecto: string;
  asesorFicha: Asesor;
  estado: { id: string; nombre: string; fechaActualizacion: string };
}

import type { Asesor } from '../../../shared/models/Asesor';

export interface FichaPerfil {
  id: string;
  tituloProyecto: string;
  asesorFicha: Asesor;
}

import type { Asesor } from '../../../shared/models/Asesor';

export interface EntregableProyectoGrado {
  id: string;
  versionEntregable: number;
  proyectoGrado: { id: string; nombre: string };
  asesor: Asesor;
  estadoEntregable: { id: string; nombre: string };
}

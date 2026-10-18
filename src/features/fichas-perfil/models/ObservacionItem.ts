import type { Item } from './fichas-perfil';

export interface ObservacionItem {
  id: string;
  revisionItemId: string;
  observacion: string;
  estadoId: string;
  estadoNombre: string;
}

export interface ObservacionItemFila {
  observacion: ObservacionItem;
  item: Item | undefined;
  revisionCerrada: boolean;
}

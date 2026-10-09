import type { Item } from './fichas-perfil';

export interface RevisionItem {
  id: string;
  itemId: string;
  estadoId: string;
  estadoNombre: string;
  fechaCreacion: string;
}

export interface RevisionItemFila {
  revision: RevisionItem;
  item: Item | undefined;
}

import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import type { Documentacion } from './Documentacion';

export interface EnlaceCompartidoDocumentacion {
  documentacion: Documentacion;
  enlace: EnlaceDescargaVersion;
}

import type { EnlaceDescargaVersion } from '../../../shared/models/EnlaceDescargaVersion';
import type { Documentacion } from './Documentacion';

export interface EnlaceManualDocumentacion {
  documentacion: Documentacion;
  enlace: EnlaceDescargaVersion;
}

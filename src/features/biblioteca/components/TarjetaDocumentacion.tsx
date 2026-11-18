import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { Documentacion } from '../models/Documentacion';
import { AutoresProyecto, InsigniaEstado, TituloProyecto } from './DocumentacionCeldas';

const TARJETA_DATOS = 'flex flex-wrap items-center gap-1.5';
const DATO_SECUNDARIO = 'text-on-surface-secondary';

interface Props {
  documentacion: Documentacion;
}

export default function TarjetaDocumentacion({ documentacion }: Props) {
  return (
    <>
      <TituloProyecto titulo={documentacion.tituloProyecto} />
      <div className={TARJETA_DATOS}>
        <InsigniaEstado documentacion={documentacion} />
        <span className={DATO_SECUNDARIO}>
          Versión {documentacion.entregableProyectoGrado.versionEntregable}
        </span>
      </div>
      <span className="sr-only">Autores: </span>
      <AutoresProyecto autores={documentacion.autores} />
      <span className={DATO_SECUNDARIO}>{documentacion.bibliotecario.nombre}</span>
      <span className={DATO_SECUNDARIO}>
        {formatearFechaCreacion(documentacion.fechaPublicacion)}
      </span>
    </>
  );
}

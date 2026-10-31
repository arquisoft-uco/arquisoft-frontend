import type { ReactNode } from 'react';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import InsigniaEstadoRevision from './InsigniaEstadoRevision';

const RAIZ = 'flex flex-col gap-6';
const SECCION = 'flex flex-col gap-3';
const TITULO = 'text-sm font-semibold text-on-surface';
const LISTA = 'flex flex-col gap-3';
const ETIQUETA = 'text-[13px] text-on-surface-secondary';
const VALOR = 'break-words text-sm text-on-surface [overflow-wrap:anywhere]';
const SECUNDARIO = 'text-[13px] text-on-surface-secondary';

interface DatoProps {
  etiqueta: string;
  children: ReactNode;
}

function Dato({ etiqueta, children }: DatoProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={ETIQUETA}>{etiqueta}</dt>
      <dd className={VALOR}>{children}</dd>
    </div>
  );
}

interface Props {
  version: VersionArtefacto;
}

export default function DetalleVersionArtefactoContenido({ version }: Props) {
  return (
    <div className={RAIZ}>
      <section className={SECCION}>
        <h3 className={TITULO}>Versión</h3>
        <dl className={LISTA}>
          <Dato etiqueta="Versión">Versión {version.version}</Dato>
          <Dato etiqueta="Fecha de creación">{formatearFechaCreacion(version.fechaCreacion)}</Dato>
          <Dato etiqueta="Ubicación del archivo">{version.uriArchivo ?? 'No disponible'}</Dato>
        </dl>
      </section>

      <section className={SECCION}>
        <h3 className={TITULO}>Contexto</h3>
        <dl className={LISTA}>
          <Dato etiqueta="Proyecto">{version.nombreProyecto}</Dato>
          <Dato etiqueta="Documento">
            {version.nombreDocumento}
            <span className={`block ${SECUNDARIO}`}>
              Versión {version.versionDocumento} del documento
            </span>
          </Dato>
          <Dato etiqueta="Repositorio">{version.nombreRepositorio}</Dato>
          <Dato etiqueta="Asesor">{version.nombreAsesor}</Dato>
        </dl>
      </section>

      <section className={SECCION}>
        <h3 className={TITULO}>Revisión más reciente</h3>
        <div className="flex flex-col items-start gap-1.5">
          <InsigniaEstadoRevision version={version} />
          {version.estadoRevision === null && (
            <p className={SECUNDARIO}>Esta versión aún no tiene revisiones.</p>
          )}
        </div>
      </section>
    </div>
  );
}

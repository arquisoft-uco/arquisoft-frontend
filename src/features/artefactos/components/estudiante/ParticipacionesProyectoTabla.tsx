import { useId } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import type { ProyectoConParticipaciones } from '../../utils/agrupar-participaciones';

const SECCION = 'flex flex-col gap-3';
const TITULO = 'text-base font-semibold text-on-surface';
const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

function etiquetaVersion(participacion: ParticipacionArtefacto): string {
  return `Versión ${participacion.versionDocumento}`;
}

const COLUMNAS: ColumnaTabla<ParticipacionArtefacto>[] = [
  {
    id: 'documento',
    encabezado: 'Documento',
    clave: 'nombreDocumento',
    celda: (participacion) => <span className={NOMBRE}>{participacion.nombreDocumento}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    clave: 'versionDocumento',
    celda: (participacion) => <Badge variante="neutro">{etiquetaVersion(participacion)}</Badge>,
  },
  {
    id: 'repositorio',
    encabezado: 'Repositorio',
    clave: 'nombreRepositorio',
    celda: (participacion) => (
      <span className={DATO_SECUNDARIO}>{participacion.nombreRepositorio}</span>
    ),
  },
];

interface Props {
  proyecto: ProyectoConParticipaciones;
}

export default function ParticipacionesProyectoTabla({ proyecto }: Props) {
  const idTitulo = useId();

  return (
    <section aria-labelledby={idTitulo} className={SECCION}>
      <h2 id={idTitulo} className={TITULO}>
        {proyecto.nombreProyecto}
      </h2>
      <DataTable
        etiqueta={`Artefactos del proyecto ${proyecto.nombreProyecto}`}
        columnas={COLUMNAS}
        filas={proyecto.participaciones}
        idDeFila={(participacion) => participacion.id}
        tarjeta={(participacion) => (
          <>
            <p className={TARJETA_NOMBRE}>{participacion.nombreDocumento}</p>
            <p className={TARJETA_DATO}>{participacion.nombreRepositorio}</p>
            <p className={TARJETA_DATO}>{etiquetaVersion(participacion)}</p>
          </>
        )}
      />
    </section>
  );
}

import { useId, useMemo } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import InsigniaOmitido from '../InsigniaOmitido';
import type { ProyectoConParticipaciones } from '../../utils/agrupar-participaciones';

const SECCION = 'flex flex-col gap-3';
const TITULO = 'text-base font-semibold text-on-surface';
const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE_BOTON =
  'block truncate text-left font-medium text-on-surface hover:text-primary hover:underline hover:underline-offset-4';
const NOMBRE_TEXTO = 'block truncate font-medium text-on-surface';
const MOTIVO = 'block text-[13px] text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

type AlAbrir = (participacion: ParticipacionArtefacto) => void;
type MotivoBloqueo = (participacion: ParticipacionArtefacto) => string | null | undefined;

function etiquetaVersion(participacion: ParticipacionArtefacto): string {
  return `Versión ${participacion.versionDocumento}`;
}

function BotonNombre({
  participacion,
  onAbrir,
  motivoBloqueo,
}: {
  participacion: ParticipacionArtefacto;
  onAbrir: AlAbrir;
  motivoBloqueo: MotivoBloqueo;
}) {
  if (participacion.omitido) {
    return (
      <>
        <span title={participacion.nombreDocumento} className={NOMBRE_TEXTO}>
          {participacion.nombreDocumento}
        </span>
        <InsigniaOmitido />
      </>
    );
  }

  const motivo = motivoBloqueo(participacion);
  if (motivo !== null) {
    return (
      <>
        <span title={participacion.nombreDocumento} className={NOMBRE_TEXTO}>
          {participacion.nombreDocumento}
        </span>
        {motivo !== undefined && <span className={MOTIVO}>{motivo}</span>}
      </>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Subir nueva versión de ${participacion.nombreDocumento}`}
      title={participacion.nombreDocumento}
      onClick={() => onAbrir(participacion)}
      className={NOMBRE_BOTON}
    >
      {participacion.nombreDocumento}
    </button>
  );
}

function columnasDe(
  onAbrir: AlAbrir,
  motivoBloqueo: MotivoBloqueo,
): ColumnaTabla<ParticipacionArtefacto>[] {
  return [
    {
      id: 'documento',
      encabezado: 'Documento',
      clave: 'nombreDocumento',
      celda: (participacion) => (
        <BotonNombre
          participacion={participacion}
          onAbrir={onAbrir}
          motivoBloqueo={motivoBloqueo}
        />
      ),
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
    {
      id: 'asesor',
      encabezado: 'Asesor',
      clave: 'nombreAsesor',
      celda: (participacion) => (
        <span className={DATO_SECUNDARIO}>{participacion.nombreAsesor}</span>
      ),
    },
  ];
}

interface Props {
  proyecto: ProyectoConParticipaciones;
  onAbrir: AlAbrir;
  motivoBloqueo: MotivoBloqueo;
}

export default function ParticipacionesProyectoTabla({ proyecto, onAbrir, motivoBloqueo }: Props) {
  const idTitulo = useId();
  const columnas = useMemo(() => columnasDe(onAbrir, motivoBloqueo), [onAbrir, motivoBloqueo]);

  return (
    <section aria-labelledby={idTitulo} className={SECCION}>
      <h2 id={idTitulo} className={TITULO}>
        {proyecto.nombreProyecto}
      </h2>
      <DataTable
        etiqueta={`Artefactos del proyecto ${proyecto.nombreProyecto}`}
        columnas={columnas}
        filas={proyecto.participaciones}
        idDeFila={(participacion) => participacion.id}
        tarjeta={(participacion) => (
          <>
            <BotonNombre
              participacion={participacion}
              onAbrir={onAbrir}
              motivoBloqueo={motivoBloqueo}
            />
            <p className={TARJETA_DATO}>{participacion.nombreRepositorio}</p>
            <p className={TARJETA_DATO}>
              {participacion.nombreAsesor} · {etiquetaVersion(participacion)}
            </p>
          </>
        )}
      />
    </section>
  );
}

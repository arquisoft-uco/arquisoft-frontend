import { useId, useMemo } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import EnlaceVersionesArtefacto from '../EnlaceVersionesArtefacto';
import InsigniaOmitido from '../InsigniaOmitido';
import MenuArtefactoEstudiante from './MenuArtefactoEstudiante';
import type { ProyectoConParticipaciones } from '../../utils/agrupar-participaciones';

const SECCION = 'flex flex-col gap-3';
const TITULO = 'text-base font-semibold text-on-surface';
const DATO_SECUNDARIO = 'text-on-surface-secondary';
const MOTIVO = 'block text-[13px] text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

type AlElegir = (participacion: ParticipacionArtefacto) => void;
type MotivoBloqueo = (participacion: ParticipacionArtefacto) => string | null | undefined;

interface Acciones {
  onGestionarRevision: AlElegir;
  onSubirVersion: AlElegir;
}

function etiquetaVersion(participacion: ParticipacionArtefacto): string {
  return `Versión ${participacion.versionDocumento}`;
}

function NombreArtefacto({
  participacion,
  motivoBloqueo,
}: {
  participacion: ParticipacionArtefacto;
  motivoBloqueo: MotivoBloqueo;
}) {
  const motivo = participacion.omitido ? undefined : motivoBloqueo(participacion);

  return (
    <>
      <EnlaceVersionesArtefacto
        artefactoId={participacion.id}
        nombreDocumento={participacion.nombreDocumento}
        vista="versiones-revisiones"
      />
      {participacion.omitido && <InsigniaOmitido />}
      {motivo && <span className={MOTIVO}>{motivo}</span>}
    </>
  );
}

function columnasDe(motivoBloqueo: MotivoBloqueo): ColumnaTabla<ParticipacionArtefacto>[] {
  return [
    {
      id: 'documento',
      encabezado: 'Documento',
      clave: 'nombreDocumento',
      celda: (participacion) => (
        <NombreArtefacto participacion={participacion} motivoBloqueo={motivoBloqueo} />
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

interface Props extends Acciones {
  proyecto: ProyectoConParticipaciones;
  motivoBloqueo: MotivoBloqueo;
}

export default function ParticipacionesProyectoTabla({
  proyecto,
  motivoBloqueo,
  onGestionarRevision,
  onSubirVersion,
}: Props) {
  const idTitulo = useId();
  const columnas = useMemo(() => columnasDe(motivoBloqueo), [motivoBloqueo]);
  const acciones = { onGestionarRevision, onSubirVersion };

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
        acciones={(participacion) => (
          <MenuArtefactoEstudiante
            participacion={participacion}
            puedeSubir={motivoBloqueo(participacion) === null}
            {...acciones}
          />
        )}
        tarjeta={(participacion) => (
          <>
            <NombreArtefacto participacion={participacion} motivoBloqueo={motivoBloqueo} />
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

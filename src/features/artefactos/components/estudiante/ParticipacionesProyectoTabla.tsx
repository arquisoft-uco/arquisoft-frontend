import { useId, useMemo } from 'react';
import AvisoProyectoCerrado from '../../../../shared/components/AvisoProyectoCerrado';
import InsigniaProyectoCerrado from '../../../../shared/components/InsigniaProyectoCerrado';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import type { ProyectoConParticipaciones } from '../../utils/agrupar-participaciones';
import { estaCerrado } from '../../utils/estado-proyecto';
import InsigniaEstadoUltimaRevision from '../InsigniaEstadoUltimaRevision';
import MenuArtefactoEstudiante from './MenuArtefactoEstudiante';
import NombreArtefacto, { type MotivoBloqueo } from './NombreArtefacto';

const SECCION = 'flex flex-col gap-3';
const ENCABEZADO = 'flex flex-wrap items-center gap-2';
const TITULO = 'text-base font-semibold text-on-surface';
const DATO_SECUNDARIO = 'text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

type AlElegir = (participacion: ParticipacionArtefacto) => void;

interface Acciones {
  onGestionarRevision: AlElegir;
  onSubirVersion: AlElegir;
}

function celdaRevision(participacion: ParticipacionArtefacto, estados: EstadoRevisionAsesor[]) {
  if (participacion.omitido) return null;
  return (
    <InsigniaEstadoUltimaRevision estado={participacion.estadoUltimaRevision} estados={estados} />
  );
}

function columnasDe(
  avisoFila: MotivoBloqueo,
  estados: EstadoRevisionAsesor[],
): ColumnaTabla<ParticipacionArtefacto>[] {
  return [
    {
      id: 'documento',
      encabezado: 'Documento',
      clave: 'nombreDocumento',
      celda: (participacion) => (
        <NombreArtefacto participacion={participacion} avisoFila={avisoFila} />
      ),
    },
    {
      id: 'version',
      encabezado: 'Versión del documento',
      clave: 'versionDocumento',
      celda: (participacion) => (
        <Badge variante="neutro">{`Versión ${participacion.versionDocumento}`}</Badge>
      ),
    },
    {
      id: 'revision',
      encabezado: 'Última revisión',
      celda: (participacion) => celdaRevision(participacion, estados),
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
  avisoFila: MotivoBloqueo;
  estados: EstadoRevisionAsesor[];
}

export default function ParticipacionesProyectoTabla({
  proyecto,
  motivoBloqueo,
  avisoFila,
  estados,
  onGestionarRevision,
  onSubirVersion,
}: Props) {
  const idTitulo = useId();
  const cerrado = estaCerrado(proyecto);
  const avisoVisible: MotivoBloqueo = (participacion) =>
    cerrado ? undefined : avisoFila(participacion);
  const columnas = useMemo(
    () => columnasDe(cerrado ? () => undefined : avisoFila, estados),
    [avisoFila, estados, cerrado],
  );
  const acciones = { onGestionarRevision, onSubirVersion };

  return (
    <section aria-labelledby={idTitulo} className={SECCION}>
      <div className={ENCABEZADO}>
        <h2 id={idTitulo} className={TITULO}>
          {proyecto.nombreProyecto}
        </h2>
        <InsigniaProyectoCerrado
          proyectoFinalizado={proyecto.proyectoFinalizado}
          proyectoCancelado={proyecto.proyectoCancelado}
        />
      </div>
      <AvisoProyectoCerrado
        proyectoFinalizado={proyecto.proyectoFinalizado}
        proyectoCancelado={proyecto.proyectoCancelado}
      />
      <DataTable
        etiqueta={`Artefactos del proyecto ${proyecto.nombreProyecto}`}
        columnas={columnas}
        filas={proyecto.participaciones}
        idDeFila={(participacion) => participacion.id}
        acciones={(participacion) => (
          <MenuArtefactoEstudiante
            participacion={participacion}
            puedeSubir={!cerrado && motivoBloqueo(participacion) === null}
            {...acciones}
          />
        )}
        tarjeta={(participacion) => (
          <>
            <NombreArtefacto participacion={participacion} avisoFila={avisoVisible} />
            {celdaRevision(participacion, estados)}
            <p className={TARJETA_DATO}>{participacion.nombreRepositorio}</p>
            <p className={TARJETA_DATO}>
              {`${participacion.nombreAsesor} · Versión ${participacion.versionDocumento} del documento`}
            </p>
          </>
        )}
      />
    </section>
  );
}

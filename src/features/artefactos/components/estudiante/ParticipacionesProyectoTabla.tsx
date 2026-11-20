import { useId, useMemo } from 'react';
import AvisoProyectoCerrado from '../../../../shared/components/AvisoProyectoCerrado';
import InsigniaProyectoCerrado from '../../../../shared/components/InsigniaProyectoCerrado';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { estaCerrado } from '../../utils/estado-proyecto';
import EstadoUltimaRevision from '../EstadoUltimaRevision';
import NombreArtefacto, { type MotivoBloqueo } from './NombreArtefacto';
import MenuArtefactoEstudiante from './MenuArtefactoEstudiante';
import type { ProyectoConParticipaciones } from '../../utils/agrupar-participaciones';

const SECCION = 'flex flex-col gap-3';
const ENCABEZADO = 'flex flex-wrap items-center gap-2';
const TITULO = 'text-base font-semibold text-on-surface';
const DATO_SECUNDARIO = 'text-on-surface-secondary';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

type AlElegir = (participacion: ParticipacionArtefacto) => void;
type UltimaVersion = (artefactoId: string) => VersionArtefacto | null | undefined;

interface Acciones {
  onGestionarRevision: AlElegir;
  onSubirVersion: AlElegir;
}

function etiquetaVersion(participacion: ParticipacionArtefacto): string {
  return `Versión ${participacion.versionDocumento}`;
}

function columnasDe(
  avisoFila: MotivoBloqueo,
  ultimaVersion: UltimaVersion,
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
      celda: (participacion) => <Badge variante="neutro">{etiquetaVersion(participacion)}</Badge>,
    },
    {
      id: 'revision',
      encabezado: 'Revisión',
      celda: (participacion) => (
        <EstadoUltimaRevision
          ultima={ultimaVersion(participacion.id)}
          omitido={participacion.omitido}
        />
      ),
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
  ultimaVersion: UltimaVersion;
}

export default function ParticipacionesProyectoTabla({
  proyecto,
  motivoBloqueo,
  avisoFila,
  ultimaVersion,
  onGestionarRevision,
  onSubirVersion,
}: Props) {
  const idTitulo = useId();
  const cerrado = estaCerrado(proyecto);
  const avisoVisible: MotivoBloqueo = (participacion) =>
    cerrado ? undefined : avisoFila(participacion);
  const columnas = useMemo(
    () => columnasDe(cerrado ? () => undefined : avisoFila, ultimaVersion),
    [avisoFila, ultimaVersion, cerrado],
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
            <EstadoUltimaRevision
              ultima={ultimaVersion(participacion.id)}
              omitido={participacion.omitido}
            />
            <p className={TARJETA_DATO}>{participacion.nombreRepositorio}</p>
            <p className={TARJETA_DATO}>
              {participacion.nombreAsesor} · {etiquetaVersion(participacion)} del documento
            </p>
          </>
        )}
      />
    </section>
  );
}

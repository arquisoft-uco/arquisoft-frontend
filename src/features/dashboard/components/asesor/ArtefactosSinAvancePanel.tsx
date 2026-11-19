import { FolderCheck } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import { useArtefactosSinAvance } from '../../hooks/useArtefactosSinAvance';
import { LISTA } from '../disposicion';
import BandejaInicio from '../BandejaInicio';

function textoDias(dias?: number): string | undefined {
  if (dias === undefined) return undefined;
  return dias === 1 ? '1 día sin avance' : `${dias} días sin avance`;
}

export default function ArtefactosSinAvancePanel() {
  const { artefactos, dias, cargado, hayError, reintentar } = useArtefactosSinAvance();

  return (
    <BandejaInicio
      titulo="Artefactos sin avance"
      nombre="los artefactos sin avance"
      verTodos={{ etiqueta: 'Ver todos', destino: '/artefactos?vista=sin-avance' }}
      cargado={cargado}
      hayError={hayError}
      reintentar={() => void reintentar()}
      vacia={artefactos.length === 0}
      vacio={{
        icono: FolderCheck,
        titulo: 'Tus artefactos tienen avance reciente',
        descripcion: `Ningún artefacto de un proyecto habilitado lleva más de ${dias} días sin una versión nueva.`,
      }}
    >
      <ul className={LISTA}>
        {artefactos.map((artefacto) => (
          <li key={artefacto.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium text-on-surface">{artefacto.nombreDocumento}</p>
              <p className="text-sm text-on-surface-secondary">
                {artefacto.nombreProyecto} · versión {artefacto.versionDocumento}
              </p>
              {artefacto.estadoUltimaRevision && (
                <p className="text-sm text-on-surface-secondary">
                  Última revisión: {artefacto.estadoUltimaRevision}
                </p>
              )}
            </div>
            {textoDias(artefacto.diasSinAvance) && (
              <Badge variante="advertencia">{textoDias(artefacto.diasSinAvance)}</Badge>
            )}
          </li>
        ))}
      </ul>
    </BandejaInicio>
  );
}

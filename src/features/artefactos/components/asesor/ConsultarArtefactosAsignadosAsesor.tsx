import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useArtefactosAsesor } from '../../hooks/useArtefactosAsesor';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import AsignarArtefactoPanel from './AsignarArtefactoPanel';
import EstudiantesArtefactoPanel from './EstudiantesArtefactoPanel';
import CambiarAsesorArtefactoPanel from './CambiarAsesorArtefactoPanel';
import FiltrosArtefactosAsesor from './FiltrosArtefactosAsesor';
import ArtefactosAsesorTable from './ArtefactosAsesorTable';
import OmitirArtefactoDialog from './OmitirArtefactoDialog';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'artefacto' : 'artefactos'}`;
}

export default function ConsultarArtefactosAsignadosAsesor() {
  const [enCambio, setEnCambio] = useState<ArtefactoAsesor | null>(null);
  const listado = useArtefactosAsesor();
  const [aOmitir, setAOmitir] = useState<ArtefactoAsesor | null>(null);
  const [aReactivar, setAReactivar] = useState<ArtefactoAsesor | null>(null);
  const [aGestionarEstudiantes, setAGestionarEstudiantes] = useState<ArtefactoAsesor | null>(null);
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const artefactos = data?.content ?? [];

  return (
    <div className={RAIZ}>
      <FiltrosArtefactosAsesor listado={listado} />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los artefactos"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <ArtefactosAsesorTable
            artefactos={artefactos}
            cargando={isLoading}
            hayFiltros={listado.hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onOmitir={setAOmitir}
            onReactivar={setAReactivar}
            onGestionarEstudiantes={setAGestionarEstudiantes}
            onCambiarAsesor={setEnCambio}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={artefactos.length}
          etiquetaPlural="artefactos"
          onPageChange={listado.goToPage}
        />
      )}

      {aOmitir && <OmitirArtefactoDialog artefacto={aOmitir} onCerrar={() => setAOmitir(null)} />}
      {aReactivar && (
        <AsignarArtefactoPanel
          reactivar={{
            proyectoGrado: aReactivar.proyectoGrado,
            versionRepositorioArtefacto: aReactivar.versionRepositorioArtefacto,
            nombreProyecto: aReactivar.nombreProyecto,
            nombreDocumento: aReactivar.nombreDocumento,
            versionDocumento: aReactivar.versionDocumento,
          }}
          onCerrar={() => setAReactivar(null)}
        />
      )}
      {aGestionarEstudiantes && (
        <EstudiantesArtefactoPanel
          artefacto={aGestionarEstudiantes}
          onCerrar={() => setAGestionarEstudiantes(null)}
        />
      )}
      {enCambio && (
        <CambiarAsesorArtefactoPanel artefacto={enCambio} onCerrar={() => setEnCambio(null)} />
      )}
    </div>
  );
}

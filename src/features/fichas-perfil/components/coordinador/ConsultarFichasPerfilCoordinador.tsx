import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useFichasPerfilCoordinador } from '../../hooks/useFichasPerfilCoordinador';
import type { FichaPerfil } from '../../models/FichaPerfil';
import CambiarAsesorPanel from './CambiarAsesorPanel';
import EvaluacionesFichaPanel from './EvaluacionesFichaPanel';
import EstudiantesVinculadosPanel from './EstudiantesVinculadosPanel';
import FichasPerfilTable from './FichasPerfilTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

interface PanelFicha {
  tipo: 'estudiantes' | 'asesor' | 'evaluaciones';
  ficha: FichaPerfil;
}

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'ficha' : 'fichas'}`;
}

export default function ConsultarFichasPerfilCoordinador() {
  const [panel, setPanel] = useState<PanelFicha | null>(null);
  const listado = useFichasPerfilCoordinador();

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const fichas = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '';
  const recargandoSinFilas = isPlaceholderData && fichas.length === 0 && !hayFiltros;

  function cerrarPanel() {
    setPanel(null);
  }

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar fichas',
          placeholder: 'Buscar por título del proyecto',
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las fichas de perfil"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <FichasPerfilTable
            fichas={fichas}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onVerEstudiantes={(ficha) => setPanel({ tipo: 'estudiantes', ficha })}
            onVerEvaluaciones={(ficha) => setPanel({ tipo: 'evaluaciones', ficha })}
            onCambiarAsesor={(ficha) => setPanel({ tipo: 'asesor', ficha })}
            onLimpiarFiltros={listado.limpiarFiltros}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={fichas.length}
          etiquetaPlural="fichas"
          onPageChange={listado.goToPage}
        />
      )}

      {panel?.tipo === 'estudiantes' && (
        <EstudiantesVinculadosPanel ficha={panel.ficha} onCerrar={cerrarPanel} />
      )}
      {panel?.tipo === 'evaluaciones' && (
        <EvaluacionesFichaPanel ficha={panel.ficha} onCerrar={cerrarPanel} />
      )}
      {panel?.tipo === 'asesor' && (
        <CambiarAsesorPanel ficha={panel.ficha} onCerrar={cerrarPanel} />
      )}
    </div>
  );
}

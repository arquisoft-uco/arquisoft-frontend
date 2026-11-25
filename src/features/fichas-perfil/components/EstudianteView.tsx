import type { ComponentType } from 'react';
import { FileText } from 'lucide-react';
import { useItemsMiFicha } from '../hooks/useItemsMiFicha';
import { useMiFichaPerfil } from '../hooks/useMiFichaPerfil';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import type { ResumenFicha } from '../models/ResumenFicha';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import Tabs from '../../../shared/components/ui/Tabs';
import { usePestanaEnUrl } from '../../../shared/hooks/usePestanaEnUrl';
import { DISPOSICION } from './disposicion';
import ResumenFichaPanel from './ResumenFichaPanel';
import CabeceraMiFicha from './estudiante/CabeceraMiFicha';
import CompanerosFichaPanel from './estudiante/CompanerosFichaPanel';
import EstadosObservacionPanel from './estudiante/EstadosObservacionPanel';
import EvaluacionesMiFichaPanel from './estudiante/EvaluacionesMiFichaPanel';
import HistorialEstadosFichaPanel from './estudiante/HistorialEstadosFichaPanel';
import ItemsMiFichaPanel from './estudiante/ItemsMiFichaPanel';
import ObservacionesMiFichaPanel from './estudiante/ObservacionesMiFichaPanel';
import RevisionesMiFichaPanel from './estudiante/RevisionesMiFichaPanel';
import SelectorFichaEstudiante from './estudiante/SelectorFichaEstudiante';

const RAIZ = 'flex flex-col gap-6';

const PANEL_POR_PESTANA = {
  items: ItemsMiFichaPanel,
  revisiones: RevisionesMiFichaPanel,
  observaciones: ObservacionesMiFichaPanel,
  estados: HistorialEstadosFichaPanel,
  evaluaciones: EvaluacionesMiFichaPanel,
  estadosObservacion: EstadosObservacionPanel,
} satisfies Record<string, ComponentType>;

type Pestana = keyof typeof PANEL_POR_PESTANA;

const PESTANAS_VALIDAS = Object.keys(PANEL_POR_PESTANA) as Pestana[];

function aResumen(ficha: MiFichaPerfilResponse): ResumenFicha {
  return {
    id: ficha.id,
    titulo: ficha.tituloProyecto,
    estadoId: ficha.estadoActual.id,
    estadoNombre: ficha.estadoActual.nombre,
    fechaActualizacion: ficha.estadoActual.fechaActualizacion,
    asesorNombre: ficha.asesor.nombre,
    asesorEmail: ficha.asesor.email,
  };
}

export default function EstudianteView() {
  const {
    ficha,
    fichaEditable,
    fichas,
    cargada,
    sinFicha,
    errorFicha,
    seleccionarFicha,
    reintentar,
  } = useMiFichaPerfil();
  const { items, itemsCargados } = useItemsMiFicha();
  const [pestana, setPestana] = usePestanaEnUrl(PESTANAS_VALIDAS, 'items');

  if (errorFicha) {
    return (
      <ErrorState
        titulo="No pudimos cargar tu ficha de perfil"
        descripcion="Inténtalo nuevamente."
        onReintentar={reintentar}
      />
    );
  }

  if (!cargada) return <Skeleton variante="tarjetas" etiqueta="Cargando tu ficha…" />;

  if (sinFicha || !ficha) {
    return (
      <EmptyState
        icono={FileText}
        titulo="Aún no tienes una ficha de perfil"
        descripcion="Cuando tu coordinador te asigne a una, aparecerá aquí."
      />
    );
  }

  const pestanas = [
    { id: 'items' as const, etiqueta: 'Ítems', contador: itemsCargados ? items.length : undefined },
    { id: 'revisiones' as const, etiqueta: 'Revisiones' },
    { id: 'observaciones' as const, etiqueta: 'Observaciones' },
    { id: 'estados' as const, etiqueta: 'Historial de estados' },
    { id: 'evaluaciones' as const, etiqueta: 'Evaluaciones' },
    { id: 'estadosObservacion' as const, etiqueta: 'Estados de observación' },
  ];
  const Panel = PANEL_POR_PESTANA[pestana];

  return (
    <div className={RAIZ}>
      {fichas.length > 1 && (
        <SelectorFichaEstudiante
          fichas={fichas}
          fichaActivaId={ficha.id}
          onSeleccionar={seleccionarFicha}
        />
      )}
      <CabeceraMiFicha ficha={ficha} editable={fichaEditable} />
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <Tabs
            items={pestanas}
            valor={pestana}
            onCambiar={setPestana}
            etiqueta="Secciones de mi ficha"
          >
            <Panel key={ficha.id} />
          </Tabs>
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenFichaPanel
            resumen={aResumen(ficha)}
            equipo={<CompanerosFichaPanel idFichaPerfil={ficha.id} />}
          />
        </div>
      </div>
    </div>
  );
}

import { useState, type ComponentType } from 'react';
import { Edit3, FileText } from 'lucide-react';
import { useItemsMiFicha } from '../hooks/useItemsMiFicha';
import { useMiFichaPerfil } from '../hooks/useMiFichaPerfil';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import type { ResumenFicha } from '../models/ResumenFicha';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import Tabs from '../../../shared/components/ui/Tabs';
import { DISPOSICION } from './disposicion';
import { FechaDeEstado, InsigniaEstadoFicha } from './FichaCeldas';
import ResumenFichaPanel from './ResumenFichaPanel';
import CompanerosFichaPanel from './estudiante/CompanerosFichaPanel';
import EditarTituloForm from './estudiante/EditarTituloForm';
import EvaluacionesMiFichaPanel from './estudiante/EvaluacionesMiFichaPanel';
import HistorialEstadosFichaPanel from './estudiante/HistorialEstadosFichaPanel';
import ItemsMiFichaPanel from './estudiante/ItemsMiFichaPanel';
import RevisionesMiFichaPanel from './estudiante/RevisionesMiFichaPanel';
import SelectorFichaEstudiante from './estudiante/SelectorFichaEstudiante';

type Pestana = 'items' | 'revisiones' | 'estados' | 'evaluaciones';

const RAIZ = 'flex flex-col gap-6';

const PANEL_POR_PESTANA: Record<Pestana, ComponentType> = {
  items: ItemsMiFichaPanel,
  revisiones: RevisionesMiFichaPanel,
  estados: HistorialEstadosFichaPanel,
  evaluaciones: EvaluacionesMiFichaPanel,
};

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
  const { ficha, fichas, cargada, sinFicha, errorFicha, seleccionarFicha, reintentar } =
    useMiFichaPerfil();
  const { items, itemsCargados } = useItemsMiFicha();
  const [pestana, setPestana] = useState<Pestana>('items');
  const [editandoTitulo, setEditandoTitulo] = useState(false);

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
    { id: 'estados' as const, etiqueta: 'Historial de estados' },
    { id: 'evaluaciones' as const, etiqueta: 'Evaluaciones' },
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
      <PageHeader
        titulo={ficha.tituloProyecto}
        insignia={
          <InsigniaEstadoFicha
            estadoId={ficha.estadoActual.id}
            nombre={ficha.estadoActual.nombre}
          />
        }
        meta={
          <>
            Mi ficha de perfil · Actualizada el{' '}
            <FechaDeEstado iso={ficha.estadoActual.fechaActualizacion} />
          </>
        }
        acciones={
          <Button variante="secundario" icono={Edit3} onClick={() => setEditandoTitulo(true)}>
            Editar título
          </Button>
        }
      />
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
            equipo={<CompanerosFichaPanel integrantes={ficha.integrantes} />}
          />
        </div>
      </div>
      {editandoTitulo && (
        <EditarTituloForm
          key={ficha.id}
          tituloActual={ficha.tituloProyecto}
          onCerrar={() => setEditandoTitulo(false)}
        />
      )}
    </div>
  );
}

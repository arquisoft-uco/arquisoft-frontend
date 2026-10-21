import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import type { OrigenNavegacion } from '../../../shared/models/OrigenNavegacion';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import type { ResumenFicha } from '../models/ResumenFicha';
import { DISPOSICION } from './disposicion';
import { FechaDeEstado, InsigniaEstadoFicha } from './FichaCeldas';
import ResumenFichaPanel from './ResumenFichaPanel';

const ETIQUETA_LISTADO = 'Fichas de perfil';
const RUTA_LISTADO = '/fichas-perfil';
const TITULO_GENERICO = 'Ficha de perfil';

export interface PestanaDetalle {
  id: string;
  etiqueta: string;
  to: string;
}

interface Props {
  resumen: ResumenFicha | null;
  search: string;
  origen?: OrigenNavegacion;
  pestanas: PestanaDetalle[];
  accion?: ReactNode;
  decision?: ReactNode;
}

export default function DetalleFichaEstructura({
  resumen,
  search,
  origen,
  pestanas,
  accion,
  decision,
}: Props) {
  const { pathname } = useLocation();
  const titulo = resumen?.titulo ?? TITULO_GENERICO;
  const activa = pestanas.find((p) => pathname.startsWith(p.to)) ?? pestanas[0];
  const insignia =
    resumen?.estadoId && resumen.estadoNombre ? (
      <InsigniaEstadoFicha estadoId={resumen.estadoId} nombre={resumen.estadoNombre} />
    ) : undefined;
  const meta = resumen?.fechaActualizacion ? (
    <>
      Actualizada el <FechaDeEstado iso={resumen.fechaActualizacion} />
    </>
  ) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo={titulo}
        insignia={insignia}
        meta={meta}
        migas={[
          {
            etiqueta: origen?.etiqueta ?? ETIQUETA_LISTADO,
            to: (origen?.to ?? RUTA_LISTADO) + search,
          },
          { etiqueta: titulo },
        ]}
      />
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <Tabs items={pestanas} valor={activa.id} etiqueta="Secciones de la ficha" />
          <Outlet />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenFichaPanel resumen={resumen} accion={accion} />
          {decision}
        </div>
      </div>
    </div>
  );
}

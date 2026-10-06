import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import type { ResumenFicha } from '../models/ResumenFicha';
import { DISPOSICION } from './disposicion';
import { FechaDeEstado, InsigniaEstadoFicha } from './FichaCeldas';
import ResumenFichaPanel from './ResumenFichaPanel';

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
  pestanas: PestanaDetalle[];
  accion?: ReactNode;
}

export default function DetalleFichaEstructura({ resumen, search, pestanas, accion }: Props) {
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
        migas={[{ etiqueta: 'Fichas de perfil', to: RUTA_LISTADO + search }, { etiqueta: titulo }]}
      />
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <Tabs items={pestanas} valor={activa.id} etiqueta="Secciones de la ficha" />
          <Outlet />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenFichaPanel resumen={resumen} accion={accion} />
        </div>
      </div>
    </div>
  );
}

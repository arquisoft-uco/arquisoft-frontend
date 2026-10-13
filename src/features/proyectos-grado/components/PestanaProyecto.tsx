import type { ComponentType } from 'react';
import { Navigate, useParams } from 'react-router';
import { useRolActivo } from '../../../hooks/useAuth';
import { Rol } from '../../../shared/models/rol';
import HistorialEstadosProyectoPanel from './estudiante/HistorialEstadosProyectoPanel';
import PestanaAsesores from './PestanaAsesores';

export type Pestana = 'asesores' | 'estados';

type PanelDeProyecto = ComponentType<{ proyectoGradoId: string }>;

const PANEL_POR_PESTANA: Record<Pestana, Record<string, PanelDeProyecto>> = {
  asesores: { [Rol.Coordinador]: PestanaAsesores },
  estados: { [Rol.Estudiante]: HistorialEstadosProyectoPanel },
};

const PESTANA_INICIAL_POR_ROL: Record<string, Pestana> = {
  [Rol.Estudiante]: 'estados',
};

interface Props {
  pestana: Pestana;
}

export default function PestanaProyecto({ pestana }: Props) {
  const { id } = useParams();
  const rol = useRolActivo();
  const Panel = rol ? PANEL_POR_PESTANA[pestana][rol] : undefined;

  if (!Panel || !id) {
    const inicial = (rol && PESTANA_INICIAL_POR_ROL[rol]) ?? 'asesores';
    return <Navigate to={`../${inicial}`} replace />;
  }

  return <Panel proyectoGradoId={id} />;
}

import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../../hooks/useAuth';
import { Rol } from '../../../shared/models/rol';
import PestanaAsesores from './PestanaAsesores';

export type Pestana = 'asesores';

const PANEL_POR_PESTANA: Record<Pestana, Record<string, ComponentType>> = {
  asesores: { [Rol.Coordinador]: PestanaAsesores },
};

const PESTANA_INICIAL_POR_ROL: Record<string, Pestana> = {
  [Rol.Coordinador]: 'asesores',
};

interface Props {
  pestana?: Pestana;
}

export default function PestanaProyectoGrado({ pestana }: Props) {
  const rol = useRolActivo();
  const inicial = rol ? PESTANA_INICIAL_POR_ROL[rol] : undefined;
  const Panel = rol && pestana ? PANEL_POR_PESTANA[pestana][rol] : undefined;

  if (Panel) return <Panel />;
  if (inicial) return <Navigate to={pestana ? `../${inicial}` : inicial} replace />;
  return pestana ? <Navigate to=".." replace /> : null;
}

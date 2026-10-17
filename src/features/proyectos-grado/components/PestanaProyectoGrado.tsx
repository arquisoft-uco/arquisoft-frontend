import type { ComponentType } from 'react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../../hooks/useAuth';
import { Rol } from '../../../shared/models/rol';
import PestanaResumenAsesor from './asesor/PestanaResumenAsesor';
import PestanaAsesores from './PestanaAsesores';

export type Pestana = 'asesores' | 'resumen';

const PANEL_POR_PESTANA: Record<Pestana, Record<string, ComponentType>> = {
  asesores: { [Rol.Coordinador]: PestanaAsesores },
  resumen: { [Rol.Asesor]: PestanaResumenAsesor },
};

const PESTANA_INICIAL_POR_ROL: Record<string, Pestana> = {
  [Rol.Coordinador]: 'asesores',
  [Rol.Asesor]: 'resumen',
};

interface Props {
  pestana?: Pestana;
}

export default function PestanaProyectoGrado({ pestana }: Props) {
  const rol = useRolActivo();
  const inicial = rol ? PESTANA_INICIAL_POR_ROL[rol] : undefined;

  if (!rol || !inicial) return <Navigate to="/forbidden" replace />;

  const Panel = pestana ? PANEL_POR_PESTANA[pestana][rol] : undefined;
  if (!Panel) return <Navigate to={pestana ? `../${inicial}` : inicial} replace />;

  return <Panel />;
}

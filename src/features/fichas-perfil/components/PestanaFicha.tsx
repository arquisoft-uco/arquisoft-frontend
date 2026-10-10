import type { ComponentType } from 'react';
import { Navigate, useParams } from 'react-router';
import { Rol } from '../../../shared/models/rol';
import { useRolActivo } from '../../../hooks/useAuth';
import EstadosFichaAsesorPanel from './asesor-ficha/EstadosFichaAsesorPanel';
import ItemsFichaAsesorPanel from './asesor-ficha/ItemsFichaAsesorPanel';
import RevisionesFichaAsesorPanel from './asesor-ficha/RevisionesFichaAsesorPanel';
import EvaluacionesFichaPanel from './coordinador/EvaluacionesFichaPanel';
import ItemsFichaCoordinadorPanel from './coordinador/ItemsFichaCoordinadorPanel';
import EstadosFichaRepresentantePanel from './representante/EstadosFichaRepresentantePanel';
import ItemsFichaRepresentantePanel from './representante/ItemsFichaRepresentantePanel';
import RegistrarEvaluacionPanel from './representante/RegistrarEvaluacionPanel';

export type Pestana = 'items' | 'estados' | 'evaluaciones' | 'revisiones';

type PanelDeFicha = ComponentType<{ fichaPerfilId: string }>;

const PANEL_POR_PESTANA: Record<Pestana, Record<string, PanelDeFicha>> = {
  items: {
    [Rol.AsesorFicha]: ItemsFichaAsesorPanel,
    [Rol.RepresentanteComiteCurriculum]: ItemsFichaRepresentantePanel,
    [Rol.Coordinador]: ItemsFichaCoordinadorPanel,
  },
  revisiones: { [Rol.AsesorFicha]: RevisionesFichaAsesorPanel },
  estados: {
    [Rol.AsesorFicha]: EstadosFichaAsesorPanel,
    [Rol.RepresentanteComiteCurriculum]: EstadosFichaRepresentantePanel,
  },
  evaluaciones: {
    [Rol.RepresentanteComiteCurriculum]: RegistrarEvaluacionPanel,
    [Rol.Coordinador]: EvaluacionesFichaPanel,
  },
};

const PESTANA_INICIAL_POR_ROL: Record<string, Pestana> = {
  [Rol.Coordinador]: 'evaluaciones',
};

interface Props {
  pestana: Pestana;
}

export default function PestanaFicha({ pestana }: Props) {
  const { id } = useParams();
  const rol = useRolActivo();
  const Panel = rol ? PANEL_POR_PESTANA[pestana][rol] : undefined;

  if (!Panel || !id) {
    const inicial = (rol && PESTANA_INICIAL_POR_ROL[rol]) ?? 'items';
    return <Navigate to={`../${inicial}`} replace />;
  }

  return <Panel fichaPerfilId={id} />;
}

import type { ComponentType } from 'react';
import { Navigate, useParams } from 'react-router';
import { Rol } from '../../../shared/models/rol';
import { useRolActivo } from '../../../hooks/useAuth';
import EstadosFichaAsesorPanel from './asesor-ficha/EstadosFichaAsesorPanel';
import ItemsFichaAsesorPanel from './asesor-ficha/ItemsFichaAsesorPanel';
import EstadosFichaRepresentantePanel from './representante/EstadosFichaRepresentantePanel';
import ItemsFichaRepresentantePanel from './representante/ItemsFichaRepresentantePanel';
import RegistrarEvaluacionPanel from './representante/RegistrarEvaluacionPanel';

export type Pestana = 'items' | 'estados' | 'evaluaciones';

type PanelDeFicha = ComponentType<{ fichaPerfilId: string }>;

const PANEL_POR_PESTANA: Record<Pestana, Record<string, PanelDeFicha>> = {
  items: {
    [Rol.AsesorFicha]: ItemsFichaAsesorPanel,
    [Rol.RepresentanteComiteCurriculum]: ItemsFichaRepresentantePanel,
  },
  estados: {
    [Rol.AsesorFicha]: EstadosFichaAsesorPanel,
    [Rol.RepresentanteComiteCurriculum]: EstadosFichaRepresentantePanel,
  },
  evaluaciones: { [Rol.RepresentanteComiteCurriculum]: RegistrarEvaluacionPanel },
};

interface Props {
  pestana: Pestana;
}

export default function PestanaFicha({ pestana }: Props) {
  const { id } = useParams();
  const rol = useRolActivo();
  const Panel = rol ? PANEL_POR_PESTANA[pestana][rol] : undefined;

  if (!Panel || !id) return <Navigate to="../items" replace />;

  return <Panel fichaPerfilId={id} />;
}

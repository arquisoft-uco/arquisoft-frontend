import { useState, type ComponentType } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import AsignarArtefactoPanel from './asesor/AsignarArtefactoPanel';
import ConsultarArtefactosAsignadosAsesor from './asesor/ConsultarArtefactosAsignadosAsesor';
import ConsultarArtefactosSinAvanceAsesor from './asesor/ConsultarArtefactosSinAvanceAsesor';
import ConsultarVersionesArtefactoAsesor from './asesor/ConsultarVersionesArtefactoAsesor';
import ConsultarVersionesRepositorioAsesor from './asesor/ConsultarVersionesRepositorioAsesor';
import ConsultarEstadosRevisionAsesor from './ConsultarEstadosRevisionAsesor';

type Vista = 'artefactos' | 'versiones-artefactos' | 'versiones' | 'sin-avance' | 'estados';

const CONTENIDO_POR_VISTA: Record<Vista, ComponentType> = {
  artefactos: ConsultarArtefactosAsignadosAsesor,
  'versiones-artefactos': ConsultarVersionesArtefactoAsesor,
  versiones: ConsultarVersionesRepositorioAsesor,
  'sin-avance': ConsultarArtefactosSinAvanceAsesor,
  estados: ConsultarEstadosRevisionAsesor,
};

const VISTAS_RETIRADAS: Record<string, Vista> = {
  revisiones: 'versiones-artefactos',
};

function leerVista(valor: string): Vista {
  return Object.keys(CONTENIDO_POR_VISTA).includes(valor) ? (valor as Vista) : 'artefactos';
}

export default function AsesorView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [asignando, setAsignando] = useState(false);
  const valorVista = useParametrosListado().texto('vista');
  const vista = leerVista(valorVista);
  const Contenido = CONTENIDO_POR_VISTA[vista];

  if (Object.keys(VISTAS_RETIRADAS).includes(valorVista)) {
    return <Navigate to={`${pathname}?vista=${VISTAS_RETIRADAS[valorVista]}`} replace />;
  }

  function alAsignar() {
    if (vista !== 'artefactos') navigate(pathname);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        acciones={
          <Button icono={Plus} onClick={() => setAsignando(true)}>
            Asignar artefacto
          </Button>
        }
        titulo="Artefactos"
        descripcion="Consulta los artefactos que tienes asignados, el estado de revisión de sus versiones, las versiones de repositorio disponibles para asignar, el reporte de artefactos sin avance y los estados de una revisión."
      />
      <Tabs
        etiqueta="Secciones de artefactos"
        valor={vista}
        items={[
          { id: 'artefactos', etiqueta: 'Artefactos asignados', to: pathname },
          {
            id: 'versiones-artefactos',
            etiqueta: 'Versiones de artefactos',
            to: `${pathname}?vista=versiones-artefactos`,
          },
          {
            id: 'versiones',
            etiqueta: 'Versiones de repositorio',
            to: `${pathname}?vista=versiones`,
          },
          { id: 'sin-avance', etiqueta: 'Sin avance', to: `${pathname}?vista=sin-avance` },
          {
            id: 'estados',
            etiqueta: 'Estados de revisión',
            to: `${pathname}?vista=estados`,
          },
        ]}
      />
      <Contenido />
      {asignando && (
        <AsignarArtefactoPanel onCerrar={() => setAsignando(false)} onAsignado={alAsignar} />
      )}
    </div>
  );
}

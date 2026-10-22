import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarEvaluacionesAsesor from './asesor-ficha/ConsultarEvaluacionesAsesor';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';

const RAIZ = 'flex flex-col gap-6';

export default function AsesorFichaView() {
  const { pathname } = useLocation();
  const vista =
    useParametrosListado().texto('vista') === 'evaluaciones' ? 'evaluaciones' : 'fichas';

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo="Mis fichas de perfil"
        descripcion="Revisa las fichas que asesoras y las evaluaciones que han recibido."
      />
      <Tabs
        etiqueta="Secciones de mis fichas"
        valor={vista}
        items={[
          { id: 'fichas', etiqueta: 'Fichas', to: pathname },
          { id: 'evaluaciones', etiqueta: 'Evaluaciones', to: `${pathname}?vista=evaluaciones` },
        ]}
      />
      {vista === 'evaluaciones' ? <ConsultarEvaluacionesAsesor /> : <ConsultarFichasAsesor />}
    </div>
  );
}

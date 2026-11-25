import { useLocation } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import ConsultarFichasDisponibles from './representante/ConsultarFichasDisponibles';
import ConsultarFichasParticipo from './representante/ConsultarFichasParticipo';

const RAIZ = 'flex flex-col gap-6';

export default function RepresentanteView() {
  const { pathname } = useLocation();
  const vista = useParametrosListado().texto('vista') === 'participo' ? 'participo' : 'disponibles';

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo="Fichas de perfil"
        descripcion="Evalúa las fichas disponibles y consulta aquellas en las que participas."
      />
      <Tabs
        etiqueta="Secciones de fichas de perfil"
        valor={vista}
        items={[
          { id: 'disponibles', etiqueta: 'Disponibles para evaluar', to: pathname },
          { id: 'participo', etiqueta: 'En las que participo', to: `${pathname}?vista=participo` },
        ]}
      />
      {vista === 'participo' ? <ConsultarFichasParticipo /> : <ConsultarFichasDisponibles />}
    </div>
  );
}

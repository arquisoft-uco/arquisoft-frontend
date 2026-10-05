import { useSearchParams } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import ConsultarFichasAsesor from './asesor-ficha/ConsultarFichasAsesor';
import EstadosFichasAsesorPanel from './asesor-ficha/EstadosFichasAsesorPanel';

type Vista = 'fichas' | 'estados';

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'fichas', etiqueta: 'Mis fichas' },
  { id: 'estados', etiqueta: 'Estados de mis fichas' },
];

export default function AsesorFichaView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vista: Vista = searchParams.get('vista') === 'estados' ? 'estados' : 'fichas';

  function cambiarVista(nueva: Vista) {
    setSearchParams(nueva === 'estados' ? { vista: 'estados' } : {}, { replace: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mis fichas de perfil"
        descripcion="Revisa las fichas que asesoras y el historial de sus estados."
      />
      <Tabs items={VISTAS} valor={vista} onCambiar={cambiarVista} etiqueta="Vistas de mis fichas">
        {vista === 'fichas' && <ConsultarFichasAsesor />}
        {vista === 'estados' && <EstadosFichasAsesorPanel />}
      </Tabs>
    </div>
  );
}

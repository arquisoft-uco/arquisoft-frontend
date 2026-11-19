import { useNavigate } from 'react-router';
import { ClipboardCheck } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { useFichasPorEvaluar } from '../../hooks/useFichasPorEvaluar';
import BandejaInicio from '../BandejaInicio';
import ListaFichas from '../ListaFichas';

export default function BandejaFichasPanel() {
  const navigate = useNavigate();
  const { fichas, cargado, hayError, reintentar } = useFichasPorEvaluar();

  return (
    <BandejaInicio
      titulo="Fichas por evaluar"
      nombre="las fichas por evaluar"
      verTodos={{ etiqueta: 'Ver todas', destino: '/fichas-perfil' }}
      cargado={cargado}
      hayError={hayError}
      reintentar={() => void reintentar()}
      vacia={fichas.length === 0}
      vacio={{
        icono: ClipboardCheck,
        titulo: 'No hay fichas por evaluar',
        descripcion: 'Cuando una ficha esté disponible para evaluación aparecerá aquí.',
        accion: (
          <Button variante="secundario" onClick={() => navigate('/fichas-perfil')}>
            Ver todas las fichas
          </Button>
        ),
      }}
    >
      <ListaFichas fichas={fichas} etiquetaAccion="Revisar" />
    </BandejaInicio>
  );
}

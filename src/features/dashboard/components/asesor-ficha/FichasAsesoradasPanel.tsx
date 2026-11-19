import { FileText } from 'lucide-react';
import { useFichasAsesoradas } from '../../hooks/useFichasAsesoradas';
import BandejaInicio from '../BandejaInicio';
import ListaFichas from '../ListaFichas';

export default function FichasAsesoradasPanel() {
  const { fichas, cargado, hayError, reintentar } = useFichasAsesoradas();

  return (
    <BandejaInicio
      titulo="Tus fichas de perfil"
      nombre="tus fichas de perfil"
      verTodos={{ etiqueta: 'Ver todas', destino: '/fichas-perfil' }}
      cargado={cargado}
      hayError={hayError}
      reintentar={() => void reintentar()}
      vacia={fichas.length === 0}
      vacio={{
        icono: FileText,
        titulo: 'Aún no asesoras fichas de perfil',
        descripcion: 'Cuando el coordinador te asigne una ficha, aparecerá aquí.',
      }}
    >
      <ListaFichas fichas={fichas} etiquetaAccion="Abrir" mostrarAsesor={false} />
    </BandejaInicio>
  );
}

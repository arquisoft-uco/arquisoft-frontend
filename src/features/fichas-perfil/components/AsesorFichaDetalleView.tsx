import { Navigate, useNavigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import { useResumenFichaAsesor } from '../hooks/useResumenFichaAsesor';
import DetalleFichaEstructura from './DetalleFichaEstructura';

export default function AsesorFichaDetalleView() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { resumen, search } = useResumenFichaAsesor(id);

  if (!id) return <Navigate to="/fichas-perfil" replace />;

  const base = `/fichas-perfil/${id}`;
  const pestanas = [
    { id: 'items', etiqueta: 'Ítems', to: `${base}/items` },
    { id: 'estados', etiqueta: 'Estados', to: `${base}/estados` },
  ];

  return (
    <DetalleFichaEstructura
      resumen={resumen}
      search={search}
      pestanas={pestanas}
      accion={
        <Button variante="secundario" onClick={() => navigate(`${base}/estados`)}>
          Cambiar estado
        </Button>
      }
    />
  );
}

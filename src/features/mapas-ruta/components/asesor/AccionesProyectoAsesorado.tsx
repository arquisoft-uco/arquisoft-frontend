import { ClipboardCheck, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { useMapaRutaProyectoAsesor } from '../../hooks/useMapaRutaProyectoAsesor';
import type { NavegacionDetalleTarea } from '../../models/NavegacionDetalleTarea';
import type { ProyectoAsesorado } from '../../models/ProyectoAsesorado';

interface Props {
  proyecto: ProyectoAsesorado;
}

export default function AccionesProyectoAsesorado({ proyecto }: Props) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { mapa } = useMapaRutaProyectoAsesor(proyecto.id);

  if (!mapa) return null;

  function verPlanesEstimados() {
    const navegacion: NavegacionDetalleTarea = { search };
    navigate(`/mapas-ruta/proyectos/${proyecto.id}/planes-estimados`, { state: navegacion });
  }

  function verPlanesReales() {
    const navegacion: NavegacionDetalleTarea = { search };
    navigate(`/mapas-ruta/proyectos/${proyecto.id}/planes-reales`, { state: navegacion });
  }

  return (
    <RowMenu
      etiqueta={`Acciones de ${proyecto.titulo}`}
      acciones={[
        {
          etiqueta: 'Ver planes estimados',
          icono: ClipboardList,
          onSeleccionar: verPlanesEstimados,
        },
        {
          etiqueta: 'Ver planes reales',
          icono: ClipboardCheck,
          onSeleccionar: verPlanesReales,
        },
      ]}
    />
  );
}

import { ClipboardCheck, FileText, History, RefreshCw } from 'lucide-react';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import { proyectoCerrado, puedeDescargarPaquete } from '../../utils/estado-proyecto';
import {
  ESTADO_DISPONIBLE_EVALUACION,
  puedeCambiarEstado,
  puedeHabilitarEvaluacion,
} from '../../utils/estados-entregable';

interface Props {
  entregable: EntregableProyectoGrado;
  descargando: boolean;
  onCambiarEstado: (entregable: EntregableProyectoGrado, destinoInicial?: string) => void;
  onVerArtefactos: (entregable: EntregableProyectoGrado) => void;
  onVerHistorial: (entregable: EntregableProyectoGrado) => void;
  onDescargarPaquete: (entregable: EntregableProyectoGrado) => void;
}

export default function AccionesEntregableAsesor({
  entregable,
  descargando,
  onCambiarEstado,
  onVerArtefactos,
  onVerHistorial,
  onDescargarPaquete,
}: Props) {
  const acciones: AccionMenu[] = [
    {
      etiqueta: 'Ver artefactos',
      icono: FileText,
      onSeleccionar: () => onVerArtefactos(entregable),
    },
    {
      etiqueta: 'Ver historial de estados',
      icono: History,
      onSeleccionar: () => onVerHistorial(entregable),
    },
    accionDescargar({
      etiqueta: 'Descargar paquete',
      onSeleccionar: () => onDescargarPaquete(entregable),
      deshabilitada: !puedeDescargarPaquete(entregable) || descargando,
    }),
  ];
  if (!proyectoCerrado(entregable)) {
    if (puedeHabilitarEvaluacion(entregable.estadoEntregable.id)) {
      acciones.push({
        etiqueta: 'Habilitar para evaluación',
        icono: ClipboardCheck,
        onSeleccionar: () => onCambiarEstado(entregable, ESTADO_DISPONIBLE_EVALUACION),
      });
    }
    acciones.push({
      etiqueta: 'Cambiar estado',
      icono: RefreshCw,
      onSeleccionar: () => onCambiarEstado(entregable),
      deshabilitada: !puedeCambiarEstado(entregable.estadoEntregable.id),
    });
  }

  return (
    <RowMenu
      etiqueta={`Acciones del entregable de ${entregable.proyectoGrado.nombre}, versión ${entregable.versionEntregable}`}
      acciones={acciones}
    />
  );
}

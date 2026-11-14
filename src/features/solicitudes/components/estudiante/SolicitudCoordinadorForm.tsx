import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import { useCoordinadoresEstudiante } from '../../../../shared/hooks/useCoordinadoresEstudiante';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { estadoSelectorDestinatario } from '../../utils/estado-selector-destinatario';
import type { EstadoSelectorDestinatario } from '../../utils/estado-selector-destinatario';
import SelectorDestinatario from '../SelectorDestinatario';
import SolicitudNovedadForm from './SolicitudNovedadForm';

const TEXTOS_SELECTOR: Record<EstadoSelectorDestinatario, string> = {
  cargando: 'Cargando coordinadores…',
  vacio: 'No tienes un coordinador asignado actualmente',
  error: 'No se pudieron cargar los coordinadores',
  listo: 'Selecciona un coordinador',
};

type Props = Omit<
  ComponentProps<typeof SolicitudNovedadForm>,
  'renderDestinatario' | 'envioBloqueado'
>;

export default function SolicitudCoordinadorForm(props: Props) {
  const { data, isPending, isError, error } = useCoordinadoresEstudiante();

  useEffect(() => {
    if (isError) {
      toast.error(
        'No se pudieron cargar los coordinadores',
        getApiErrorMessage(error, 'Inténtalo de nuevo.'),
      );
    }
  }, [isError, error]);

  const coordinadores = data ?? [];
  const estado = estadoSelectorDestinatario({
    cargando: isPending,
    error: isError,
    cantidad: coordinadores.length,
  });
  const opciones = coordinadores.map((coordinador) => ({
    clave: coordinador.proyectoGradoId,
    valor: coordinador.coordinadorId,
    etiqueta: `${coordinador.nombre} — ${coordinador.tituloProyecto}`,
  }));

  return (
    <SolicitudNovedadForm
      {...props}
      envioBloqueado={estado !== 'listo'}
      renderDestinatario={({ registro, error: errorCampo }) => (
        <SelectorDestinatario
          etiqueta={props.textos.etiquetaDestinatario}
          estado={estado}
          opciones={opciones}
          textos={TEXTOS_SELECTOR}
          registro={registro}
          error={errorCampo}
        />
      )}
    />
  );
}

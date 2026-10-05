import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import { AsesorDeFicha, FechaDeEstado, InsigniaEstadoFicha } from './FichaCeldas';

interface DatosAsesorFicha {
  nombre: string;
  email: string;
}

interface DatosEstadoFicha {
  estadoId: string;
  nombre: string;
  fechaActualizacion: string;
}

export function columnaAsesor<T>(leer: (fila: T) => DatosAsesorFicha): ColumnaTabla<T> {
  return {
    id: 'asesor',
    encabezado: 'Asesor',
    clave: 'asesorNombre',
    ordenable: true,
    celda: (fila) => {
      const { nombre, email } = leer(fila);
      return <AsesorDeFicha nombre={nombre} email={email} />;
    },
  };
}

export function columnasEstado<T>(leer: (fila: T) => DatosEstadoFicha): ColumnaTabla<T>[] {
  return [
    {
      id: 'estado',
      encabezado: 'Estado actual',
      celda: (fila) => {
        const { estadoId, nombre } = leer(fila);
        return <InsigniaEstadoFicha estadoId={estadoId} nombre={nombre} />;
      },
    },
    {
      id: 'actualizacion',
      encabezado: 'Última actualización',
      celda: (fila) => <FechaDeEstado iso={leer(fila).fechaActualizacion} />,
    },
  ];
}

import type { Page } from '../../../shared/models/api-response';
import type { Solicitud } from './Solicitud';

export interface ConsultaListadoSolicitudes {
  data?: Page<Solicitud>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  isPlaceholderData: boolean;
  refetch: () => unknown;
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
}

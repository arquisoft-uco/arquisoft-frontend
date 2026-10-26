export interface SolicitarCargaVersionResponse {
  carga: string;
  url: string;
  campos: Record<string, string>;
  expiraEn: string;
}

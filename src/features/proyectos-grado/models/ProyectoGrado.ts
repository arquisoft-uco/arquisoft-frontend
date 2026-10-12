export interface EstadoProyectoGrado {
  id: string;
  nombre: string;
}

export interface ProyectoGrado {
  id: string;
  fichaPerfil: string;
  tituloProyecto: string;
  estado: EstadoProyectoGrado;
}

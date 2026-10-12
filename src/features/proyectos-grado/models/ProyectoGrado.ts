export interface EstadoProyecto {
  id: string;
  nombre: string;
}

export interface ProyectoGrado {
  id: string;
  fichaPerfil: string;
  tituloProyecto: string;
  estado: EstadoProyecto;
}

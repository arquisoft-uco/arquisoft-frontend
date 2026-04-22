import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-proyectos-grado',
  templateUrl: './proyectos-grado.html',
  styleUrl: './proyectos-grado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class ProyectosGradoComponent {}

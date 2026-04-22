import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-evaluaciones',
  templateUrl: './evaluaciones.html',
  styleUrl: './evaluaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class EvaluacionesComponent {}

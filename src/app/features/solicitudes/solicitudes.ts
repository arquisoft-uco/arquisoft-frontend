import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class SolicitudesComponent {}

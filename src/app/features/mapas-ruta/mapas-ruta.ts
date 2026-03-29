import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-mapas-ruta',
  templateUrl: './mapas-ruta.html',
  styleUrl: './mapas-ruta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class MapasRutaComponent {}

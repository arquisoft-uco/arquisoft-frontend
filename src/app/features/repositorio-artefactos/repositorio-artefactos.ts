import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-repositorio-artefactos',
  templateUrl: './repositorio-artefactos.html',
  styleUrl: './repositorio-artefactos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class RepositorioArtefactosComponent {}

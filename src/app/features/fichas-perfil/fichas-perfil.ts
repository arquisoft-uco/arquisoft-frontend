import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-fichas-perfil',
  templateUrl: './fichas-perfil.html',
  styleUrl: './fichas-perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class FichasPerfilComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.html',
  styleUrl: './biblioteca.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class BibliotecaComponent {}

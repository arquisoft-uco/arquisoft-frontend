import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  template: `
    <mat-card class="error-card" role="main" aria-labelledby="forbidden-title">
      <mat-card-header>
        <mat-card-title id="forbidden-title">Acceso Denegado</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>No tienes los permisos necesarios para acceder a esta sección.</p>
      </mat-card-content>
      <mat-card-actions>
        <a mat-button routerLink="/dashboard">Ir al inicio</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    :host { display: flex; justify-content: center; padding: 48px; }
    .error-card { max-width: 480px; width: 100%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, RouterLink],
})
export class ForbiddenComponent {}
